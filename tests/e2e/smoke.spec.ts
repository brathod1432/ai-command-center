import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Helm smoke journeys", () => {
  test("landing page renders and links to the command center", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /AI Business Operations Platform/i })).toBeVisible();
    await page.getByRole("link", { name: /Open the Command Center/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("dashboard shows health, KPIs and the governance queue", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /Executive Command Center/i })).toBeVisible();
    await expect(page.getByText(/Company Health/i)).toBeVisible();
    await expect(page.getByText(/Monthly Recurring Revenue/i)).toBeVisible();
    await expect(page.getByText(/pending approval/i)).toBeVisible();
  });

  test("health endpoint returns ok", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.status).toBe("ok");
  });

  test("dashboard has no serious accessibility violations", async ({ page }) => {
    await page.goto("/dashboard");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    const serious = results.violations.filter((v) => ["serious", "critical"].includes(v.impact ?? ""));
    expect(serious).toEqual([]);
  });
});
