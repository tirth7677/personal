/*
  Warnings:

  - Added the required column `title` to the `bounties` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bounties" ADD COLUMN     "title" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "bcoins_usage" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bcoins_usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bcoins_usage_userId_idx" ON "bcoins_usage"("userId");

-- AddForeignKey
ALTER TABLE "bcoins_usage" ADD CONSTRAINT "bcoins_usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
