/*
  Warnings:

  - Added the required column `visibility` to the `Goal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- ALTER TABLE "Goal" ADD COLUMN     "visibility" BOOLEAN NOT NULL;

-- Manual edit: add column (no not-null condition),
-- set existing goal rows to have visibility be true (visible),
-- then add back not-null condition for visibility column 
ALTER TABLE "Goal" ADD COLUMN "visibility" BOOLEAN;
UPDATE "Goal" SET "visibility" = true WHERE "visibility" IS NULL;
ALTER TABLE "Goal" ALTER COLUMN "visibility" SET NOT NULL;