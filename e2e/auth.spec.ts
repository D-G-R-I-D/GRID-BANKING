import { test, expect } from "@playwright/test";

async function signUp(page: import("@playwright/test").Page, tag: string) {
  const unique = Date.now().toString().slice(-9);
  await page.goto("/sign-up");
  await page.getByLabel("Full name").fill(`${tag} Person`);
  await page.getByLabel("Email").fill(`${tag}-${unique}@grid.bank`);
  await page.getByLabel("Phone number").fill(`08${unique}`);
  await page.getByLabel("Password").fill("a-strong-passphrase");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test("a new person can sign up and land on their dashboard", async ({
  page,
}) => {
  await signUp(page, "test");
  await expect(page.getByRole("heading", { name: "Accounts" })).toBeVisible();
  await expect(page.getByText("Flow").first()).toBeVisible();
});

test("the transfer screen has both modes", async ({ page }) => {
  await signUp(page, "mover");
  await page.goto("/transfer");
  await expect(page.getByRole("tab", { name: "My accounts" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Someone else" })).toBeVisible();
});

test("protected routes redirect anonymous visitors", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/sign-in$/);
});

test("shows a notice after an inactivity sign-out", async ({ page }) => {
  await page.goto("/sign-in?reason=timeout");
  await expect(
    page.getByText(/signed out after a period of inactivity/i),
  ).toBeVisible();
});
