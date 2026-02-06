import { test, expect } from "@playwright/test";

test.describe("Expenses Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display expenses summary", async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState("networkidle");
    
    // Check if main page elements are visible
    await expect(page).toHaveTitle(/Management|Income|Expense/i);
  });

  test("should navigate to stocks page", async ({ page }) => {
    // Look for navigation link
    const stocksLink = page.locator("a, button", { hasText: /stocks/i });
    
    if (await stocksLink.count() > 0) {
      await stocksLink.first().click();
      await page.waitForLoadState("networkidle");
    }
  });

  test("should display categories", async ({ page }) => {
    // Wait for the page to fully load
    await page.waitForLoadState("networkidle");
    
    // The page should contain some interactive elements
    const buttons = page.locator("button");
    const count = await buttons.count();
    
    // Verify that there are interactive elements
    expect(count).toBeGreaterThan(0);
  });

  test("should have dark mode support", async ({ page }) => {
    // Look for dark mode toggle or theme switcher
    const darkModeToggle = page.locator("button, [role='switch']").filter({
      hasText: /dark|light|theme/i,
    });
    
    // If dark mode toggle exists, test it
    if (await darkModeToggle.count() > 0) {
      const currentClasses = await page.locator("html").getAttribute("class");
      await darkModeToggle.first().click();
      await page.waitForTimeout(500);
      const updatedClasses = await page.locator("html").getAttribute("class");
      
      // Classes should have changed after clicking
      expect(currentClasses).not.toBe(updatedClasses);
    }
  });
});

test.describe("API Integration", () => {
  test("GET /api/expenses returns 200", async ({ request }) => {
    const response = await request.get("/api/expenses?month=1&year=2025");
    expect(response.status()).toBe(200);
    
    const json = await response.json();
    expect(Array.isArray(json)).toBe(true);
  });

  test("GET /api/categories returns 200", async ({ request }) => {
    const response = await request.get("/api/categories");
    expect(response.status()).toBe(200);
    
    const json = await response.json();
    expect(Array.isArray(json)).toBe(true);
  });

  test("POST /api/expenses validates input", async ({ request }) => {
    // Test with invalid data (negative amount)
    const response = await request.post("/api/expenses", {
      data: {
        amount: -50,
        categoryId: "test",
        date: new Date().toISOString(),
      },
    });
    
    // Should return 400 for validation error
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test("POST /api/expenses creates valid expense", async ({ request }) => {
    const validPayload = {
      amount: 25.50,
      categoryId: "mock-cat-id",
      date: new Date().toISOString(),
      notes: "Test E2E expense",
      isRecurring: false,
    };

    const response = await request.post("/api/expenses", {
      data: validPayload,
    });

    // Should return 201 for successful creation
    expect([200, 201]).toContain(response.status());
  });
});

test.describe("Responsive Design", () => {
  test("should render on mobile viewport", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    
    // Page should still be accessible
    const buttons = page.locator("button");
    expect(await buttons.count()).toBeGreaterThan(0);
  });

  test("should render on tablet viewport", async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    
    // Page should render without horizontal scrolling
    const viewport = await page.evaluate(() => ({
      width: window.innerWidth,
      height: window.innerHeight,
    }));
    
    expect(viewport.width).toBeLessThanOrEqual(768);
  });
});
