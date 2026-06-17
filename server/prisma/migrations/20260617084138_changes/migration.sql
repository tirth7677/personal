/*
  Warnings:

  - Added the required column `status` to the `payment_history` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "payment_history" ADD COLUMN     "status" TEXT NOT NULL;
