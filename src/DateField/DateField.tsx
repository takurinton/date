import { forwardRef } from "react";
import { Dayjs } from "dayjs";
import { Input } from "ingred-ui";
import { useDateField } from "./useDateField";
import { useMergeRefs } from "./utils";

export type Props = {
  date: Dayjs;
  format?: string;
  onDateChange?: (date: Dayjs) => void;
};

export const DateField = forwardRef<HTMLInputElement, Props>(function DateField(
  props,
  propRef
) {
  const { ref: inputRef, ...rest } = useDateField(props);
  const ref = useMergeRefs<HTMLInputElement>(propRef, inputRef);

  return <Input readOnly ref={ref} {...rest} />;
});
