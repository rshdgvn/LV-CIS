import { test, expect } from "@playwright/test";

/**
 * Toggle this to `true` if you want to test the REAL Google login manually.
 * For CI or fast checks, keep it `false` (mock mode).
 */
const USE_REAL_GOOGLE_LOGIN = false;

/**
 * FRONTEND CONFIG — update if your frontend runs on a different URL
 */
const FRONTEND_URL = "http://localhost:5173";

test.describe("Google Login Flow", () => {
  test("should work and return token", async ({ page }) => {
    if (USE_REAL_GOOGLE_LOGIN) {
      console.log("🧍 Running in REAL Google Login mode...");
      await page.goto(`${FRONTEND_URL}/login`);

      await page.getByText("Login with Google", { exact: false }).click();

      await page.waitForURL(/google\/callback/, { timeout: 90000 });

      const currentURL = page.url();
      expect(currentURL).toContain("token=");

      await page.waitForTimeout(2000);

      const token = await page.evaluate(() => localStorage.getItem("token"));
      expect(token).toBeTruthy();

      console.log("Token successfully stored:", token);
    } else {
      console.log("Running in MOCK Google Login mode...");
      await page.goto(`${FRONTEND_URL}/login`);

      await page.goto(`${FRONTEND_URL}/google/callback?token=fake_token_123`);

      await page.waitForURL(/dashboard/, { timeout: 10000 });

      const token = await page.evaluate(() => localStorage.getItem("token"));
      expect(token).toBeTruthy();

      console.log("Mock login successful, token:", token);
    }
  });
});
