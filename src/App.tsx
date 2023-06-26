import { useState } from "react";
import dayjs from "dayjs";
import { ThemeProvider, createTheme, Input, Table } from "ingred-ui";
import { DateField } from "./DateField";

function App() {
  const theme = createTheme();
  const [date, setDate] = useState(dayjs());
  const [format, setFormat] = useState("YYYY年MM月DD日");

  return (
    <ThemeProvider theme={theme}>
      <Table>
        <Table.Body>
          <Table.Row>
            <Table.HeaderCell width="175px">format</Table.HeaderCell>
            <Table.Cell>
              {" "}
              <Input
                value={format}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setFormat(event.target.value)
                }
              />
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.HeaderCell width="100px">date</Table.HeaderCell>
            <Table.Cell>
              <DateField date={date} format={format} onDateChange={setDate} />
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.HeaderCell width="100px">
              value(MM/DD/YYYYの固定フォーマット)
            </Table.HeaderCell>
            <Table.Cell>{date.format("MM/DD/YYYY")}</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    </ThemeProvider>
  );
}

export default App;
