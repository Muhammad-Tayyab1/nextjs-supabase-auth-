import { expect, test } from "@playwright/test";

test.describe("public pages", () => {
  test("home page shows sign-in options for a signed-out visitor", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /auth & platform starter/i })).toBeVisible();
    await expect(page.getByRole("link", { name: "Log in" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign up" })).toBeVisible();
  });

  test("login page renders all sign-in methods", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Welcome back")).toBeVisible();
    await expect(page.getByRole("tab", { name: "Password" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Magic link" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Phone" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Google" })).toBeVisible();
    await expect(page.getByRole("button", { name: "GitHub" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue as guest" })).toBeVisible();
  });

  test("switching to the phone tab reveals the phone number field", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("tab", { name: "Phone" }).click();
    await expect(page.getByLabel("Phone number")).toBeVisible();
    await expect(page.getByRole("button", { name: "Send code" })).toBeVisible();
  });

  test("signup page renders the password sign-up form", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByText("Create an account")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  });

  test("forgot-password page renders", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.getByText("Reset your password")).toBeVisible();
  });
});

test.describe("route protection", () => {
  test("redirects a signed-out visitor away from the dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login\?next=%2Fdashboard/);
  });

  test("redirects a signed-out visitor away from the MFA challenge page", async ({ page }) => {
    await page.goto("/login/mfa");
    await expect(page).toHaveURL(/\/login\?next=%2Flogin%2Fmfa/);
  });

  test("redirects a signed-out visitor away from reset-password", async ({ page }) => {
    await page.goto("/reset-password");
    await expect(page).toHaveURL(/\/login\?next=%2Freset-password/);
  });
});
