-- CreateEnum
CREATE TYPE "LoanPlan" AS ENUM ('INSTALLMENTS', 'SINGLE');

-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('ACTIVE', 'REPAID');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isSystem" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pinFailedAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pinHash" TEXT,
ADD COLUMN     "pinLength" INTEGER,
ADD COLUMN     "pinLockedUntil" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Loan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "principalMinor" INTEGER NOT NULL,
    "interestMinor" INTEGER NOT NULL,
    "totalMinor" INTEGER NOT NULL,
    "repaidMinor" INTEGER NOT NULL DEFAULT 0,
    "monthlyRateBps" INTEGER NOT NULL,
    "termMonths" INTEGER NOT NULL,
    "plan" "LoanPlan" NOT NULL,
    "status" "LoanStatus" NOT NULL DEFAULT 'ACTIVE',
    "disbursementTransferId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "Loan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoanInstallment" (
    "id" TEXT NOT NULL,
    "loanId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "paidMinor" INTEGER NOT NULL DEFAULT 0,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "LoanInstallment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoanRepayment" (
    "id" TEXT NOT NULL,
    "loanId" TEXT NOT NULL,
    "transferId" TEXT NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoanRepayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Loan_disbursementTransferId_key" ON "Loan"("disbursementTransferId");

-- CreateIndex
CREATE INDEX "Loan_userId_status_idx" ON "Loan"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "LoanInstallment_loanId_sequence_key" ON "LoanInstallment"("loanId", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "LoanRepayment_transferId_key" ON "LoanRepayment"("transferId");

-- CreateIndex
CREATE INDEX "LoanRepayment_loanId_createdAt_idx" ON "LoanRepayment"("loanId", "createdAt");

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_disbursementTransferId_fkey" FOREIGN KEY ("disbursementTransferId") REFERENCES "Transfer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanInstallment" ADD CONSTRAINT "LoanInstallment_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanRepayment" ADD CONSTRAINT "LoanRepayment_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanRepayment" ADD CONSTRAINT "LoanRepayment_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "Transfer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- House account for the lending book. Loans are paid out of (and back into)
-- this account as ordinary transfers. Its balance goes negative as money is
-- lent — that's the amount GRID has out on loan. The owning user is a system
-- user: its password hash is not a valid bcrypt hash, so it can never sign in,
-- and the phone/account number are outside the Nigerian mobile ranges a real
-- customer can register with.
INSERT INTO "User" ("id", "email", "phone", "accountNumber", "name", "passwordHash", "isSystem", "createdAt", "updatedAt")
VALUES ('sys_grid_lending', 'lending@system.grid.internal', '+2340000000000', '0000000000', 'GRID Loans', '!', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Account" ("id", "userId", "name", "kind", "balanceMinor", "currency", "createdAt")
VALUES ('acct_grid_lending', 'sys_grid_lending', 'Lending', 'FLOW', 0, 'NGN', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
