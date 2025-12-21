/*
  Warnings:

  - Added the required column `icon` to the `Goal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- ALTER TABLE "Goal" ADD COLUMN     "icon" VARCHAR(50) NOT NULL;

-- Manual edit: add column (no not-null condition),
-- set existing goal rows to have icon be asterisk,
-- then add back not-null condition for icon column 
ALTER TABLE "Goal" ADD COLUMN "icon" VARCHAR(50);
UPDATE "Goal" SET "icon" = 'asterisk' WHERE "icon" IS NULL;
ALTER TABLE "Goal" ALTER COLUMN "icon" SET NOT NULL;
