import { test, expect } from "@playwright/test";

test("a new person can sign up and land on their dashboard", async ({
  page,
}) => {
  const unique = Date.now().toString().slice(-9);
  const email = `test-${unique}@grid.bank`;
  const phone = `08${unique}`; // 0 + 8 + 9 digits = 11-digit NG mobile

  await page.goto("/sign-up");
  await page.getByLabel("Full name").fill("Test Person");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Phone number").fill(phone);
  await page.getByLabel("Password").fill("a-strong-passphrase");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  // Starter accounts are provisioned and shown.
  await expect(page.getByRole("heading", { name: "Accounts" })).toBeVisible();
  await expect(page.getByText("Flow")).toBeVisible();
  await expect(page.getByText("Vault")).toBeVisible();
});

test("a new person can open the transfer screen", async ({ page }) => {
  const unique = Date.now().toString().slice(-9);
  await page.goto("/sign-up");
  await page.getByLabel("Full name").fill("Mover Person");
  await page.getByLabel("Email").fill(`mover-${unique}@grid.bank`);
  await page.getByLabel("Phone number").fill(`08${unique}`);
  await page.getByLabel("Password").fill("a-strong-passphrase");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.getByRole("link", { name: "Move" }).click();
  await expect(page).toHaveURL(/\/transfer$/);
  await expect(page.getByRole("tab", { name: "My accounts" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Someone else" })).toBeVisible();
});

test("protected routes redirect anonymous visitors", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/sign-in$/);
});
