import { StoryObj } from "@storybook/react";
import { DateField, Props } from "./DateField";
import dayjs from "dayjs";
import { useState } from "react";
import { Typography } from "ingred-ui";

export default {
  title: "DateField",
  component: DateField,
  args: {
    format: "YYYY-MM-DD",
  },
};

export const Example: StoryObj<Props> = {
  render: (args) => {
    const [date, setDate] = useState(dayjs());
    return <DateField {...args} date={date} onDateChange={setDate} />;
  },
};

export const DateTimeField: StoryObj<Props> = {
  render: (args) => {
    const [date, setDate] = useState(dayjs());
    return (
      <>
        <DateField
          {...args}
          format="YYYY-MM-DD HH:mm:ss"
          date={date}
          onDateChange={setDate}
        />
        <Typography>※ format prop を変えてるだけです</Typography>
      </>
    );
  },
};

export const Japanese: StoryObj<Props> = {
  ...Example,
  args: {
    format: "YYYY月MM月DD日",
  },
};

export const Joking: StoryObj<Props> = {
  ...Example,
  args: {
    format: "YYYY+-*/MMほげDD___",
  },
};
