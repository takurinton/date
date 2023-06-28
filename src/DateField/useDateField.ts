import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { getSections } from "./utils";
import { AllowedKeys, allowedKeys, numberKeys } from "./constants";

// https://day.js.org/docs/en/plugin/custom-parse-format
import customParseFormat from "dayjs/plugin/customParseFormat";

type Props = {
  date: Dayjs;
  format?: string;
  onDateChange?: (date: Dayjs) => void;
};

/**
 * 指定された format で日付を表示・操作するための hooks
 * 左右キーでセクション移動、上下キーで選択中のセクションの値を増減する
 * 直接キーボード入力することもできる
 *
 * @todo リファクタする、特に sections の扱いと状態管理
 */
export const useDateField = ({
  date,
  format = "YYYY-MM-DD",
  onDateChange,
}: Props) => {
  // dayjs では 00-00-2020 のようなことをすると invalid date になる
  // dayjs() の第二引数のフォーマットを指定するとそれに沿ってパースしてくれるプラグイン
  dayjs.extend(customParseFormat);

  const ref = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(date.format(format));
  const sectionsWithCharactor = useMemo(() => getSections(value), [value]);
  const sections = useMemo(
    () => sectionsWithCharactor.filter((section) => section.editable),
    [sectionsWithCharactor]
  );
  const [placement, setPlacement] = useState({
    start: 0,
    end: sections.length - 1,
    current: 0,
  });

  const [keyDownCount, setKeyDownCount] = useState(0);

  const setCurrent = useCallback(() => {
    setTimeout(() => {
      const selectionStart = ref.current?.selectionStart ?? 0;
      const lastSectionEnd = sections[sections.length - 1].end + 1;
      const currentFocusIndex =
        selectionStart >= lastSectionEnd ? lastSectionEnd : selectionStart;

      const currentSectionIndex = sections.findIndex(
        (section) =>
          currentFocusIndex >= section.start &&
          // +1 しておかないとインデックスの整合性が取れない
          currentFocusIndex <= section.end + 1
      );

      setPlacement((prev) => {
        if (prev.current === currentSectionIndex) {
          return prev;
        }

        return {
          ...prev,
          current: currentSectionIndex,
        };
      });

      ref.current?.setSelectionRange(
        sections[currentSectionIndex].start,
        sections[currentSectionIndex].end + 1
      );
    });
  }, [sections]);

  const onFocus = useCallback(() => {
    setCurrent();
  }, [setCurrent]);

  const onBlur = useCallback(() => {
    setPlacement((prev) => ({
      ...prev,
      current: 0,
    }));
    setKeyDownCount(0);
  }, []);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (!allowedKeys.includes(event.key as AllowedKeys)) {
        return;
      }

      // 左右キーでセクションを移動する
      // TODO: Tab and Tab + Command
      // ブラウザやOSでの差分吸収がめんどくさいので一旦保留
      if (
        event.key === AllowedKeys.ArrowLeft ||
        event.key === AllowedKeys.ArrowRight
      ) {
        event.preventDefault();

        const i = event.key === AllowedKeys.ArrowLeft ? -1 : 1;

        setPlacement((prev) => {
          const newCurrentIndex = prev.current + i;
          if (newCurrentIndex < 0 || newCurrentIndex >= sections.length) {
            return prev;
          }

          return {
            ...prev,
            current: newCurrentIndex,
          };
        });
      }

      // 上下キーで値を増減する
      // MEMO: 2020年00月01日 のような表記は
      // https://day.js.org/docs/en/plugin/custom-parse-format
      // の挙動が怪しいので一旦対応しない（現時点だとランタイムエラーになる）
      // e.g.) 2020-00-01 -> 2020-01-01 になる
      // 本来の dayjs の挙動としては 2019-12-01 になるべき
      if (
        event.key === AllowedKeys.ArrowUp ||
        event.key === AllowedKeys.ArrowDown
      ) {
        event.preventDefault();
        const i = event.key === AllowedKeys.ArrowUp ? 1 : -1;
        const newValueNumber = Number(sections[placement.current].value) + i;

        if (newValueNumber < 1) {
          return;
        }

        const newValue = String(newValueNumber).padStart(
          sections[placement.current].value.length,
          "0"
        );

        sections[placement.current].value = newValue;

        const newDate = dayjs(
          sectionsWithCharactor.map((section) => section.value).join(""),
          format
        );

        setValue(newDate.format(format));
        onDateChange && onDateChange(newDate);
      }

      // 数字を直接入力した時の挙動
      if (numberKeys.includes(event.key)) {
        event.preventDefault();

        if (keyDownCount === 0) {
          sections[placement.current].value = "".padStart(
            sections[placement.current].value.length,
            "0"
          );
        }

        const newValue = `${sections[placement.current].value.slice(1)}${
          event.key
        }`;
        sections[placement.current].value = newValue;

        setKeyDownCount(keyDownCount + 1);

        // そのセクションで入力が完了したら keydown をリセットする
        if (keyDownCount + 1 === sections[placement.current].value.length) {
          setKeyDownCount(0);

          // 入力が完了したら次のセクションに移動する
          // MEMO: 一旦保留
          // if (placement.current + 1 < sections.length) {
          //   setPlacement((prev) => ({
          //     ...prev,
          //     current: prev.current + 1,
          //   }));
          // }

          const v = sectionsWithCharactor
            .map((section) => section.value)
            .join("");
          const newDate = dayjs(v, format);

          if (!newDate.isValid()) {
            console.error("invalid date");
            return;
          }

          setValue(newDate.format(format));
          onDateChange && onDateChange(newDate);
        } else {
          // 日付の更新
          const v = sectionsWithCharactor
            .map((section) => section.value)
            .join("");
          setValue(v);
          onDateChange && onDateChange(dayjs(v, format));
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sections, format, onDateChange, placement]
  );

  const onMouseDown = useCallback(() => {
    setCurrent();
  }, [setCurrent]);

  // 日付をコピペした時の挙動
  // どのセクションにフォーカスしていてもペーストした日付がすべてのセクションに適用される
  const onPaste = useCallback(
    (event: React.ClipboardEvent<HTMLInputElement>) => {
      event.preventDefault();

      const pastedText = event.clipboardData.getData("text");
      const newDate = dayjs(pastedText);

      if (!newDate.isValid()) {
        console.error("invalid date");
        return;
      }

      setValue(newDate.format(format));
      onDateChange && onDateChange(newDate);
    },
    [format, onDateChange]
  );

  useEffect(() => {
    ref.current?.setSelectionRange(
      sections[placement.current].start,
      sections[placement.current].end + 1
    );
  }, [placement, sections]);

  // MEMO: playground のデバッグ用、後で消す
  useEffect(() => {
    setValue(date.format(format));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [format]);

  return {
    ref,
    value,
    onFocus,
    onBlur,
    onKeyDown,
    onMouseDown,
    onPaste,
  };
};
