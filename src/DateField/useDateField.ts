import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { getSections } from "./utils";
import { AllowedKeys, allowedKeys, numberKeys } from "./constants";

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
 */
export const useDateField = ({
  date,
  format = "YYYY-MM-DD",
  onDateChange,
}: Props) => {
  dayjs.extend(customParseFormat);

  const ref = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(date.format(format));
  const sections = useMemo(() => getSections(value), [value]);
  const [placement, setPlacement] = useState({
    start: 0,
    end: sections.length - 1,
    current: 0,
  });

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
  }, []);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (!allowedKeys.includes(event.key as AllowedKeys)) {
        return;
      }

      // TODO: Tab and Tab + Command
      // ブラウザ間の差分吸収がめんどくさいので一旦保留
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

      if (
        event.key === AllowedKeys.ArrowUp ||
        event.key === AllowedKeys.ArrowDown
      ) {
        event.preventDefault();
        const i = event.key === AllowedKeys.ArrowUp ? 1 : -1;
        const newValue = String(
          Number(sections[placement.current].value) + i
        ).padStart(sections[placement.current].value.length, "0");
        const _sections = sections.map((section, index) => {
          if (index !== placement.current) {
            return section;
          }

          return {
            ...section,
            value: newValue.toString(),
          };
        });

        const newDate = dayjs(
          `${_sections.map((section) => section.value).join("-")}`,
          format
        );

        // 1月32日を入力したら 2月1日になるようにするか検討
        // ここで弾いてるので今はならない
        if (!newDate.isValid()) {
          return;
        }

        setValue(newDate.format(format));
        sections[placement.current].value = newValue;
      }

      // TODO: 月末とか考慮する
      if (numberKeys.includes(event.key)) {
        event.preventDefault();
        const currentValue = sections[placement.current].value;
        const newValue = `${currentValue.slice(1)}${event.key}`;
        sections[placement.current].value = newValue;
      }

      const newDate = dayjs(
        `${sections.map((section) => section.value).join("-")}`,
        format
      );

      setValue(newDate.format(format));

      if (!newDate.isValid()) {
        return;
      }

      onDateChange && onDateChange(newDate);
    },
    [sections, format, onDateChange, placement]
  );

  const onMouseDown = useCallback(() => {
    setCurrent();
  }, [setCurrent]);

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
  };
};
