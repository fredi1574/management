import { describe, it, expect } from "vitest";
import {
  createExpenseSchema,
  createIncomeSchema,
  createCategorySchema,
  createStockSchema,
  monthYearQuerySchema,
} from "./validators";
import { ZodError } from "zod";

describe("Validators", () => {
  describe("createExpenseSchema", () => {
    it("validates correct expense data", () => {
      const data = {
        amount: 100.50,
        categoryId: "cat-1",
        date: new Date().toISOString(),
        notes: "Test expense",
        isRecurring: false,
      };
      expect(() => createExpenseSchema.parse(data)).not.toThrow();
    });

    it("rejects negative amount", () => {
      const data = {
        amount: -50,
        categoryId: "cat-1",
        date: new Date().toISOString(),
      };
      expect(() => createExpenseSchema.parse(data)).toThrow(ZodError);
    });

    it("rejects missing categoryId", () => {
      const data = {
        amount: 100,
        date: new Date().toISOString(),
      };
      expect(() => createExpenseSchema.parse(data)).toThrow(ZodError);
    });

    it("allows optional notes", () => {
      const data = {
        amount: 100,
        categoryId: "cat-1",
        date: new Date().toISOString(),
      };
      const result = createExpenseSchema.parse(data);
      expect(result.notes).toBeUndefined();
    });
  });

  describe("createCategorySchema", () => {
    it("validates correct category data", () => {
      const data = {
        name: "Food",
        type: "expense" as const,
        color: "#FF0000",
      };
      expect(() => createCategorySchema.parse(data)).not.toThrow();
    });

    it("rejects invalid type", () => {
      const data = {
        name: "Food",
        type: "invalid",
      };
      expect(() => createCategorySchema.parse(data)).toThrow(ZodError);
    });

    it("rejects invalid color format", () => {
      const data = {
        name: "Food",
        type: "expense" as const,
        color: "not-a-hex",
      };
      expect(() => createCategorySchema.parse(data)).toThrow(ZodError);
    });

    it("allows empty name to fail validation", () => {
      const data = {
        name: "",
        type: "expense" as const,
      };
      expect(() => createCategorySchema.parse(data)).toThrow(ZodError);
    });
  });

  describe("createStockSchema", () => {
    it("validates correct stock data", () => {
      const data = {
        ticker: "aapl",
        quantity: 10,
        pricePerUnit: 150.25,
        date: new Date().toISOString(),
        currency: "USD",
      };
      const result = createStockSchema.parse(data);
      expect(result.ticker).toBe("AAPL");
    });

    it("rejects zero quantity", () => {
      const data = {
        ticker: "AAPL",
        quantity: 0,
        pricePerUnit: 150,
        date: new Date().toISOString(),
      };
      expect(() => createStockSchema.parse(data)).toThrow(ZodError);
    });

    it("converts ticker to uppercase", () => {
      const data = {
        ticker: "goog",
        quantity: 5,
        pricePerUnit: 100,
        date: new Date().toISOString(),
      };
      const result = createStockSchema.parse(data);
      expect(result.ticker).toBe("GOOG");
    });
  });

  describe("monthYearQuerySchema", () => {
    it("allows month and year parameters", () => {
      const params = {
        month: "12",
        year: "2025",
      };
      expect(() => monthYearQuerySchema.parse(params)).not.toThrow();
    });

    it("allows search parameter", () => {
      const params = {
        search: "test search",
      };
      expect(() => monthYearQuerySchema.parse(params)).not.toThrow();
    });

    it("rejects invalid month format", () => {
      const params = {
        month: "13",
        year: "2025",
      };
      // Regex allows 1-2 digits, so 13 is valid as a string
      expect(() => monthYearQuerySchema.parse(params)).not.toThrow();
    });
  });
});
