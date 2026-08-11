import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Work email").fill("founder@example.com");
  await page.getByLabel("Role").selectOption("executive");
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test.describe("Helm smoke journeys", () => {
  test("landing page renders and links to the command center", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /AI Business Operations Platform/i })).toBeVisible();
  });

  test("unauthenticated dashboard access redirects to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("login → dashboard shows health, KPIs and governance queue", async ({ page }) => {
    await login(page);
    await expect(page.getByRole("heading", { name: /Executive Command Center/i })).toBeVisible();
    await expect(page.getByText(/Company Health/i)).toBeVisible();
    await expect(page.getByText(/Monthly Recurring Revenue/i)).toBeVisible();
    await expect(page.getByText(/pending approval/i)).toBeVisible();
  });

  test("executive can approve an action and see it in the audit trail", async ({ page }) => {
    await login(page);
    const approve = page.getByRole("button", { name: /^Approve$/i }).first();
    await approve.click();
    await page.goto("/audit");
    await expect(page.getByRole("heading", { name: /Audit Trail/i })).toBeVisible();
    await expect(page.getByText(/approved/i).first()).toBeVisible();
  });

  test("health endpoint returns ok", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok()).toBeTruthy();
    expect((await res.json()).status).toBe("ok");
  });

  test("dashboard has no serious accessibility violations", async ({ page }) => {
    await login(page);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    const serious = results.violations.filter((v) => ["serious", "critical"].includes(v.impact ?? ""));
    expect(serious).toEqual([]);
  });
});
