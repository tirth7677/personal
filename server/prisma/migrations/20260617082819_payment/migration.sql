-- AlterTable
ALTER TABLE "users" ADD COLUMN     "bcoins" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "payment_history" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payment_history_userId_idx" ON "payment_history"("userId");

-- AddForeignKey
ALTER TABLE "payment_history" ADD CONSTRAINT "payment_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
