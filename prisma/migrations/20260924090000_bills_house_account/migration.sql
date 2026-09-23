-- House account for bill payments (airtime, data). Purchases are ordinary
-- transfers from the customer's Flow account into this account, so they show
-- up in activity with a receipt. Owned by a system user that can't sign in or
-- be paid (same safeguards as the lending account in pin_and_loans).
INSERT INTO "User" ("id", "email", "phone", "accountNumber", "name", "passwordHash", "isSystem", "createdAt", "updatedAt")
VALUES ('sys_grid_bills', 'bills@system.grid.internal', '+2340000000001', '0000000001', 'GRID Bills', '!', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Account" ("id", "userId", "name", "kind", "balanceMinor", "currency", "createdAt")
VALUES ('acct_grid_bills', 'sys_grid_bills', 'Bills', 'FLOW', 0, 'NGN', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
