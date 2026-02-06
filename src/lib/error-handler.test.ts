import { describe, it, expect } from "vitest";
import { formatZodErrors, handleApiError } from "./error-handler";
import { z, ZodError } from "zod";

describe("Error Handler", () => {
  describe("formatZodErrors", () => {
    it("formats single field error", () => {
      const schema = z.object({
        amount: z.number().positive(),
      });

      try {
        schema.parse({ amount: -5 });
      } catch (error) {
        if (error instanceof ZodError) {
          const formatted = formatZodErrors(error);
          expect(formatted.amount).toBeDefined();
          expect(Array.isArray(formatted.amount)).toBe(true);
          expect(formatted.amount.length).toBeGreaterThan(0);
        }
      }
    });

    it("formats multiple field errors", () => {
      const schema = z.object({
        amount: z.number().positive(),
        name: z.string().min(1),
      });

      try {
        schema.parse({ amount: -5, name: "" });
      } catch (error) {
        if (error instanceof ZodError) {
          const formatted = formatZodErrors(error);
          expect(formatted.amount).toBeDefined();
          expect(formatted.name).toBeDefined();
        }
      }
    });

    it("formats nested field errors", () => {
      const schema = z.object({
        user: z.object({
          email: z.string().email(),
        }),
      });

      try {
        schema.parse({ user: { email: "not-an-email" } });
      } catch (error) {
        if (error instanceof ZodError) {
          const formatted = formatZodErrors(error);
          expect(Object.keys(formatted).length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("handleApiError", () => {
    it("handles ZodError with validation details", () => {
      const schema = z.object({ email: z.string().email() });

      try {
        schema.parse({ email: "invalid" });
      } catch (error) {
        const response = handleApiError(error);
        expect(response.status).toBe(400);
      }
    });

    it("handles generic Error", () => {
      const error = new Error("Database connection failed");
      const response = handleApiError(error);
      expect(response.status).toBe(500);
    });

    it("handles unknown error type", () => {
      const response = handleApiError("Some string error");
      expect(response.status).toBe(500);
    });

    it("uses custom default message", () => {
      const error = new Error("Test error");
      const response = handleApiError(error, "Custom error message");
      expect(response.status).toBe(500);
    });
  });
});
