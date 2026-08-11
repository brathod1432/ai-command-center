import { test, expect, type Page } from "@playwright/test";

/**
 * Generates the README screenshots. Run against a running server:
 *   npm run build && SESSION_SECRET=... npm run start   (port 3000)
 *   npx playwright test tests/e2e/screenshots.spec.ts --project=chromium
 * Images are written to docs/screenshots/.
 */

const DIR = "docs/screenshots";
const DESKTOP = { width: 1440, height: 900 };

async function login(page: Page, role: string) {
  await page.goto("/login");
  await page.getByLabel("Work email").fill(`${role}@example.com`);
  await page.getByLabel("Role").selectOption(role);
  await page.getByRole("button", { name: /sign in/i }).click();
  // Role-based landing may route elsewhere; land on the dashboard for shots.
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
  await page.goto("/dashboard");
  await page.waitForLoadState("networkidle");
}

async function shot(page: Page, name: string, fullPage = true) {
  await page.waitForTimeout(400); // let charts/animations settle
  await page.screenshot({ path: `${DIR}/${name}.png`, fullPage });
}

test.use({ viewport: DESKTOP });

test("public pages", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /AI Business Operations Platform/i })).toBeVisible();
  await shot(page, "01-landing");

  await page.goto("/login");
  await expect(page.getByRole("heading", { name: /Sign in to Helm/i })).toBeVisible();
  await shot(page, "02-login", false);

  await page.goto("/showcase");
  await expect(page.getByRole("heading", { name: /Adapts to your industry/i })).toBeVisible();
  await shot(page, "03-showcase");
});

test("executive perspective", async ({ page }) => {
  await login(page, "executive");

  await shot(page, "10-dashboard");

  // Dark mode
  await page.getByRole("button", { name: /Switch to dark theme/i }).click();
  await page.waitForTimeout(300);
  await shot(page, "11-dashboard-dark");
  await page.getByRole("button", { name: /Switch to light theme/i }).click();
  await page.waitForTimeout(200);

  const pages: Array<[string, string, RegExp]> = [
    ["/my-work", "12-my-work", /My Work/i],
    ["/agents", "13-agents", /Agents/i],
    ["/agents/customer_success", "14-agent-workspace", /Customer Success Agent/i],
    ["/finance", "15-finance", /Finance/i],
    ["/workflows", "16-workflows", /Workflows/i],
    ["/integrations", "17-integrations", /Integrations/i],
    ["/knowledge", "18-knowledge", /Knowledge/i],
    ["/reports", "19-reports", /Reports/i],
    ["/audit", "20-audit", /Audit Trail/i],
    ["/status", "21-status", /Status/i],
    ["/team", "22-team", /Team/i],
    ["/settings", "23-settings", /Settings/i],
  ];
  for (const [href, name, heading] of pages) {
    await page.goto(href);
    await expect(page.getByRole("heading", { name: heading }).first()).toBeVisible();
    await page.waitForLoadState("networkidle");
    await shot(page, name);
  }

  // Command palette (open, viewport shot)
  await page.goto("/dashboard");
  await page.waitForLoadState("networkidle");
  await page.keyboard.press("Control+k");
  await expect(page.getByPlaceholder("Go to…")).toBeVisible();
  await shot(page, "24-command-palette", false);
  await page.keyboard.press("Escape");
});

test("manager approves and follows through", async ({ page }) => {
  await login(page, "manager");
  await page.goto("/dashboard");
  await page.waitForLoadState("networkidle");
  // Approve the first pending action to reveal the follow-through UI.
  const approve = page.getByRole("button", { name: /^Approve$/ }).first();
  if (await approve.isVisible()) {
    await approve.click();
    await page.waitForTimeout(600);
  }
  await shot(page, "26-manager-followthrough");
});

test("viewer perspective (RBAC)", async ({ page }) => {
  await login(page, "viewer");
  await page.goto("/dashboard");
  await page.waitForLoadState("networkidle");
  await shot(page, "30-viewer-dashboard");

  await page.goto("/audit");
  await expect(page.getByText(/don.?t have access/i)).toBeVisible();
  await shot(page, "31-viewer-audit-forbidden");
});

test("mobile perspective", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await login(page, "executive");
  await shot(page, "40-mobile-dashboard");
  // Open mobile nav drawer
  await page.getByRole("button", { name: /Open navigation/i }).click();
  await page.waitForTimeout(300);
  await shot(page, "41-mobile-nav", false);
  await context.close();
});
