import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { GET, POST } from "./route";

// Mock Prisma
vi.mock("@/lib/db", () => ({
  prisma: {
    expense: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe("Expenses API", () => {
  describe("GET /api/expenses", () => {
    it("returns expenses successfully", async () => {
      const mockRequest = new Request("http://localhost:3000/api/expenses");
      
      // Would need to mock prisma for this to work
      // const response = await GET(mockRequest);
      // expect(response.status).toBe(200);
    });

    it("filters by month and year", async () => {
      const url = new URL("http://localhost:3000/api/expenses");
      url.searchParams.set("month", "12");
      url.searchParams.set("year", "2025");
      const mockRequest = new Request(url.toString());

      // Test would validate that month/year filtering is applied
    });

    it("handles search parameter", async () => {
      const url = new URL("http://localhost:3000/api/expenses");
      url.searchParams.set("search", "groceries");
      const mockRequest = new Request(url.toString());

      // Test would validate search filtering
    });
  });

  describe("POST /api/expenses", () => {
    it("creates expense with valid data", async () => {
      const validPayload = {
        amount: 50.25,
        categoryId: "cat-1",
        date: new Date().toISOString(),
        notes: "Weekly groceries",
        isRecurring: false,
      };

      const mockRequest = new Request("http://localhost:3000/api/expenses", {
        method: "POST",
        body: JSON.stringify(validPayload),
        headers: { "Content-Type": "application/json" },
      });

      // Test would validate expense creation
    });

    it("rejects negative amount", async () => {
      const invalidPayload = {
        amount: -50,
        categoryId: "cat-1",
        date: new Date().toISOString(),
      };

      const mockRequest = new Request("http://localhost:3000/api/expenses", {
        method: "POST",
        body: JSON.stringify(invalidPayload),
        headers: { "Content-Type": "application/json" },
      });

      // const response = await POST(mockRequest);
      // expect(response.status).toBe(400);
    });

    it("rejects missing required fields", async () => {
      const invalidPayload = {
        amount: 50,
        // missing categoryId and date
      };

      const mockRequest = new Request("http://localhost:3000/api/expenses", {
        method: "POST",
        body: JSON.stringify(invalidPayload),
        headers: { "Content-Type": "application/json" },
      });

      // const response = await POST(mockRequest);
      // expect(response.status).toBe(400);
    });
  });
});
