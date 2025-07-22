/*
  Warnings:

  - Added the required column `order` to the `Goal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- ALTER TABLE "Goal" ADD COLUMN     "order" INTEGER NOT NULL;


-- Manual edit: add column (no not-null condition),
-- set existing goal rows to have order be an ascending integer (e.g. 1, 2, 3, 4 based off creation date),
-- then add back not-null condition for order column 
-- Note: currently 
ALTER TABLE "Goal" ADD COLUMN "order" INT;

WITH "OrderedGoals" AS (
  SELECT "id", ROW_NUMBER() OVER (ORDER BY "createdAt") AS "newOrder"
  FROM "Goal"
)
UPDATE "Goal"
SET "order" = "OrderedGoals"."newOrder"
FROM "OrderedGoals"
WHERE "Goal"."id" = "OrderedGoals"."id";

ALTER TABLE "Goal" ALTER COLUMN "order" SET NOT NULL;