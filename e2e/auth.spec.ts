import { test, expect, type Page } from "@playwright/test";

const PIN = "4826";

async function signUp(page: Page, tag: string) {
  const unique = Date.now().toString().slice(-9);
  await page.goto("/sign-up");
  await page.getByLabel("Full name").fill(`${tag} Person`);
  await page.getByLabel("Email").fill(`${tag}-${unique}@grid.bank`);
  await page.getByLabel("Phone number").fill(`08${unique}`);
  await page.getByLabel("Password").fill("a-strong-passphrase");
  await page.getByRole("button", { name: "Create account" }).click();

  // A PIN is mandatory before the app opens.
  await expect(page).toHaveURL(/\/set-pin$/);
  await page.getByLabel("New PIN").fill(PIN);
  await page.getByLabel("Confirm PIN").fill(PIN);
  await page.getByRole("button", { name: "Create PIN" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test("a new person signs up, sets a PIN and lands on their dashboard", async ({
  page,
}) => {
  await signUp(page, "test");
  await expect(page.getByRole("heading", { name: "Accounts" })).toBeVisible();
  await expect(page.getByText("Flow").first()).toBeVisible();
});

test("the app stays closed until a PIN is set", async ({ page }) => {
  const unique = Date.now().toString().slice(-9);
  await page.goto("/sign-up");
  await page.getByLabel("Full name").fill("Nopin Person");
  await page.getByLabel("Email").fill(`nopin-${unique}@grid.bank`);
  await page.getByLabel("Phone number").fill(`09${unique}`);
  await page.getByLabel("Password").fill("a-strong-passphrase");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/set-pin$/);

  await page.goto("/transfer");
  await expect(page).toHaveURL(/\/set-pin$/);

  // Obvious PINs are refused.
  await page.getByLabel("New PIN").fill("1234");
  await expect(page.getByText(/too easy to guess/i)).toBeVisible();
});

test("an internal transfer is authorised with the PIN and produces a receipt", async ({
  page,
}) => {
  await signUp(page, "mover");
  await page.goto("/transfer");

  await expect(page.getByRole("tab", { name: "My accounts" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Someone else" })).toBeVisible();

  await page.getByLabel("Amount").fill("50");
  await page.getByRole("button", { name: "Review transfer" }).click();
  await expect(page.getByText("Confirm this transfer")).toBeVisible();

  // A wrong PIN is rejected and counts down.
  await page.getByLabel("Transaction PIN").fill("9999");
  await page.getByRole("button", { name: /Move ₦50/ }).click();
  await expect(page.getByText(/Wrong PIN\. 4 tries left/)).toBeVisible();

  await page.getByLabel("Transaction PIN").fill(PIN);
  await page.getByRole("button", { name: /Move ₦50/ }).click();

  await expect(page).toHaveURL(/\/transfer\/receipt\//);
  await expect(page.getByRole("heading", { name: "Receipt" })).toBeVisible();
  await expect(page.getByText(/GRD-[0-9A-Z]{4}-[0-9A-Z]{4}/)).toBeVisible();
});

test("take a loan, then pay it off in full", async ({ page }) => {
  await signUp(page, "borrower");
  await page.goto("/loans");
  await expect(page.getByText("No active loan")).toBeVisible();

  await page.getByRole("link", { name: "Get a loan" }).click();
  await page.getByLabel("How much do you need?").fill("50000");
  // 3 months, monthly: 2.5% x 3 = ₦3,750 interest.
  await expect(page.getByText("₦53,750.00")).toBeVisible();
  await page.getByRole("button", { name: "Review loan" }).click();

  await expect(page.getByText("Confirm your loan")).toBeVisible();
  await page.getByLabel("Transaction PIN").fill(PIN);
  await page.getByRole("button", { name: /Get ₦50,000/ }).click();

  await expect(page).toHaveURL(/\/loans$/);
  await expect(page.getByText("Left to repay")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Schedule" })).toBeVisible();

  await page.getByText("Pay off the whole loan").click();
  await expect(page.getByLabel(/Pay off the whole loan/)).toBeChecked();
  await page.getByRole("button", { name: "Review payment" }).click();
  await page.getByLabel("Transaction PIN").fill(PIN);
  await page.getByRole("button", { name: "Pay off loan" }).click();

  await expect(page.getByText("No active loan")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Past loans" })).toBeVisible();
});

test("buy airtime with the PIN and get a receipt", async ({ page }) => {
  await signUp(page, "airtime");
  await page.getByRole("link", { name: "Top up" }).click();
  await expect(page).toHaveURL(/\/transfer\/topup$/);

  await page.getByRole("button", { name: "MTN" }).click();
  await page.getByPlaceholder("801 234 5678").fill("8031234567");
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByRole("button", { name: "₦500" }).click();
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page.getByText("Buy airtime")).toBeVisible();
  await page.getByLabel("Transaction PIN").fill(PIN);
  await page.getByRole("button", { name: /Pay ₦500/ }).click();

  await expect(page).toHaveURL(/\/transfer\/receipt\//);
  await expect(page.getByText("MTN airtime · 0803 123 4567")).toBeVisible();
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
