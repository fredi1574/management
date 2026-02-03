import { describe, it, expect } from "vitest";
import { formatCurrency, formatDateInput } from "./format";

describe("formatCurrency", () => {
  it("formats positive number as ILS by default", () => {
    expect(formatCurrency(1234.56)).toMatch(/1,?234\.56/);
    expect(formatCurrency(1234.56)).toMatch(/₪|ILS/);
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toMatch(/0\.00/);
  });

  it("formats negative number", () => {
    expect(formatCurrency(-100)).toMatch(/100\.00/);
  });

  it("formats in USD when specified", () => {
    expect(formatCurrency(100, "USD")).toMatch(/\$100\.00/);
  });
});

describe("formatDateInput", () => {
  it("returns YYYY-MM-DD for a given date", () => {
    const d = new Date(Date.UTC(2025, 2, 15));
    expect(formatDateInput(d)).toBe("2025-03-15");
  });
});
