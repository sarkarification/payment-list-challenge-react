import { describe, expect, expectTypeOf, it } from "vitest";
import { formatCurrency, formatDate, type Currency } from "./utils";

describe("formatDate", () => {
  it("formats a local date with padded date and time fields", () => {
    expect(formatDate("2024-01-05T09:04:03")).toBe("05/01/2024, 09:04:03");
  });

  it("formats a leap day", () => {
    expect(formatDate("2024-02-29T23:59:59")).toBe("29/02/2024, 23:59:59");
  });

  it("rejects an invalid date", () => {
    expect(() => formatDate("invalid")).toThrow(RangeError);
  });
});

describe("formatCurrency", () => {
  it.each<[Currency, string]>([
    ["USD", "US$1,234.56"],
    ["EUR", "€1,234.56"],
    ["GBP", "£1,234.56"],
    ["AUD", "A$1,234.56"],
    ["CAD", "CA$1,234.56"],
    ["ZAR", "ZAR\u00a01,234.56"],
    ["JPY", "JP¥1,235"],
    ["CZK", "CZK\u00a01,234.56"],
  ])("formats %s with its symbol and decimal rules", (currency, expected) => {
    expect(formatCurrency(1234.56, currency)).toBe(expected);
  });

  it("formats zero with two decimal places for GBP", () => {
    expect(formatCurrency(0, "GBP")).toBe("£0.00");
  });

  it("formats JPY without .00 and rounds fractions to the nearest whole yen", () => {
    expect(formatCurrency(1234.0, "JPY")).toBe("JP¥1,234");
    expect(formatCurrency(1234.08, "JPY")).toBe("JP¥1,234");
    expect(formatCurrency(1234.5, "JPY")).toBe("JP¥1,235");
    expect(formatCurrency(1234.8, "JPY")).toBe("JP¥1,235");
  });

  it("formats negative amounts", () => {
    expect(formatCurrency(-1234.56, "GBP")).toBe("-£1,234.56");
  });

  it("rounds amounts to the currency's decimal places", () => {
    expect(formatCurrency(1.239, "GBP")).toBe("£1.24");
  });

  it("accepts a number and only supported currency codes, returning a string", () => {
    expectTypeOf(formatCurrency).parameters.toEqualTypeOf<[number, Currency]>();
    expectTypeOf<"INR">().not.toExtend<Currency>();
    expectTypeOf(formatCurrency).returns.toEqualTypeOf<string>();
  });
});
