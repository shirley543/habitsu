/*
  Warnings:

  - The `publicity` column on the `Goal` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- -- AlterTable
-- ALTER TABLE "Goal" DROP COLUMN "publicity",
-- ADD COLUMN     "publicity" "GoalPublicity" NOT NULL DEFAULT 'PRIVATE';

-- Manual edit: Updating DB type incorrect (changing from 'text', to 'GoalPublicity')
ALTER TABLE "Goal" ALTER COLUMN publicity DROP DEFAULT;
ALTER TABLE "Goal" ALTER COLUMN publicity TYPE "GoalPublicity" USING 
  CASE
    WHEN publicity = 'PUBLIC' THEN 'PUBLIC'::"GoalPublicity"
    ELSE 'PRIVATE'::"GoalPublicity"
  END;
ALTER TABLE "Goal" ALTER COLUMN publicity SET DEFAULT 'PRIVATE'::"GoalPublicity"; 