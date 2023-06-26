import { describe, it, expect } from "vitest";
import { getSections } from "../utils";

describe("getSections", () => {
  it("should return a start:0 end: -1 when no numbers are present", () => {
    const formattedDate = "abcd";
    const result = getSections(formattedDate);
    expect(result).toEqual([]);
  });

  it("should correctly parse a date string with YYYY-MM-DD", () => {
    const formattedDate = "2023-01-02";
    const result = getSections(formattedDate);
    const expected = [
      { start: 0, end: 3, value: "2023" },
      { start: 5, end: 6, value: "01" },
      { start: 8, end: 9, value: "02" },
    ];
    expect(result).toEqual(expected);
  });

  it("should handle a date string with MM/DD/YYYY", () => {
    const formattedDate = "01/02/2023";
    const result = getSections(formattedDate);
    const expected = [
      { start: 0, end: 1, value: "01" },
      { start: 3, end: 4, value: "02" },
      { start: 6, end: 9, value: "2023" },
    ];
    expect(result).toEqual(expected);
  });

  it("should handle a date string with YYYY年MM月NN日", () => {
    const formattedDate = "2023年01月02日";
    const result = getSections(formattedDate);
    const expected = [
      { start: 0, end: 3, value: "2023" },
      { start: 5, end: 6, value: "01" },
      { start: 8, end: 9, value: "02" },
    ];
    expect(result).toEqual(expected);
  });

  it("should handle a date string with DD----MM+-*/===YY", () => {
    const formattedDate = "02----01+-*/===23";
    const result = getSections(formattedDate);
    const expected = [
      { start: 0, end: 1, value: "02" },
      { start: 6, end: 7, value: "01" },
      { start: 15, end: 16, value: "23" },
    ];
    expect(result).toEqual(expected);
  });
});
