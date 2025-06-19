/*
  Warnings:

  - You are about to drop the column `public` on the `Goal` table. All the data in the column will be lost.
  - Changed the type of `goalType` on the `Goal` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "GoalQuantify" AS ENUM ('NUMERIC', 'BOOLEAN');

-- CreateEnum
CREATE TYPE "GoalPublicity" AS ENUM ('PUBLIC', 'PRIVATE');

-- AlterTable

-- Auto-generated migration (skipped)
-- ALTER TABLE "Goal" DROP COLUMN "public",
-- ADD COLUMN     "publicity" "GoalPublicity" NOT NULL DEFAULT 'PRIVATE',
-- DROP COLUMN "goalType",
-- ADD COLUMN     "goalType" "GoalQuantify" NOT NULL;

ALTER TABLE "Goal" RENAME COLUMN "public" to "publicity";

-- Manual migration:

-- -> rename column public to publicity
-- -> change value of column public/ publicity from boolean (true, false) to enum (PUBLIC, PRIVATE)
--        TODOs: DB type is incorrect (currently 'text', should be 'GoalPublicity')
ALTER TABLE "Goal" ALTER COLUMN publicity DROP DEFAULT;
ALTER TABLE "Goal" ALTER COLUMN publicity TYPE TEXT USING 
  CASE
    WHEN publicity = TRUE THEN 'PUBLIC'
    ELSE 'PRIVATE'
  END;
ALTER TABLE "Goal" ALTER COLUMN publicity SET DEFAULT 'PRIVATE'; 


-- -> change type of column goalType from GoalType to GoalQuantify
ALTER TABLE "Goal"
ALTER COLUMN "goalType" TYPE "GoalQuantify"
USING CASE
  WHEN "goalType" = 'NUMERIC' THEN 'NUMERIC'::"GoalQuantify"
  WHEN "goalType" = 'BOOLEAN' THEN 'BOOLEAN'::"GoalQuantify"
  ELSE NULL
END;

-- DropEnum
DROP TYPE "GoalType";
