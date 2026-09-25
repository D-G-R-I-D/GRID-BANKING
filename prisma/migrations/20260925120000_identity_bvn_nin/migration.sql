-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bvnHash" TEXT,
ADD COLUMN     "bvnLast4" TEXT,
ADD COLUMN     "kycSnoozedUntil" TIMESTAMP(3),
ADD COLUMN     "ninHash" TEXT,
ADD COLUMN     "ninLast4" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_bvnHash_key" ON "User"("bvnHash");

-- CreateIndex
CREATE UNIQUE INDEX "User_ninHash_key" ON "User"("ninHash");

