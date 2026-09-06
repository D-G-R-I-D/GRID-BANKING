import { test, expect } from "@playwright/test";

test("a new person can sign up and land on their dashboard", async ({
  page,
}) => {
  const email = `test-${Date.now()}@grid.bank`;

  await page.goto("/sign-up");
  await page.getByLabel("Full name").fill("Test Person");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("a-strong-passphrase");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText("Total position")).toBeVisible();
  await expect(page.getByText("Flow")).toBeVisible();
});

test("protected routes redirect anonymous visitors", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/sign-in$/);
});
