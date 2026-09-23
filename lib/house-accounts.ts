/**
 * GRID's own "house" accounts, created by migrations. Money for loans and
 * bill payments moves through them as ordinary transfers. Plain constants
 * (no DB) so pure mappers and tests can import them.
 */
export const LENDING_ACCOUNT_ID = "acct_grid_lending";
export const BILLS_ACCOUNT_ID = "acct_grid_bills";
