import { useMemo } from "react";

type Sections = {
  start: number;
  end: number;
  value: string;
};

/**
 * 何らかのフォーマットで入ってくる日付を開始位置と終了位置と値を持つセクションに分割する
 * useDateField で format された日付操作を汎用的に行うために必要なプロパティを返す
 * 例) 2023-01-02 -> [
 *   { start: 0, end: 3, value: "2023" },
 *   { start: 5, end: 6, value: "01" },
 *   { start: 8, end: 9, value: "02"}
 * ]
 *
 * @param formattedDate 何らかのフォーマットで入ってくる日付
 * @returns 開始位置と終了位置と値を持つセクション
 */
export const getSections = (formattedDate: string) => {
  const sections: Sections[] = [];
  let start = 0;

  for (let index = 0; index <= formattedDate.length; index++) {
    const currentChar = formattedDate[index];

    // if currentChar is non-digit or end of string
    if (isNaN(Number(currentChar)) || index === formattedDate.length) {
      if (index > start) {
        sections.push({
          start,
          end: index - 1,
          value: formattedDate.slice(start, index),
        });
      }
      start = index + 1;
    }
  }

  return sections;
};

type ReactRef<T> =
  | React.RefCallback<T>
  | React.MutableRefObject<T>
  | React.ForwardedRef<T>
  | string
  | null
  | undefined;

// from: https://github.com/voyagegroup/ingred-ui/blob/master/src/hooks/useMergeRefs.ts
export function useMergeRefs<T>(...refs: ReactRef<T>[]): React.Ref<T> {
  return useMemo(() => {
    if (refs.every((ref) => ref === null)) {
      return null;
    }
    return (refValue: T) => {
      for (const ref of refs) {
        if (typeof ref === "function") {
          ref(refValue);
        } else if (ref && typeof ref !== "string") {
          ref.current = refValue;
        }
      }
    };
  }, [refs]);
}
