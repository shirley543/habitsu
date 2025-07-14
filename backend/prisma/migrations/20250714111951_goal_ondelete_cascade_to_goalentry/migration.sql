-- DropForeignKey
ALTER TABLE "GoalEntry" DROP CONSTRAINT "GoalEntry_goalId_fkey";

-- AddForeignKey
ALTER TABLE "GoalEntry" ADD CONSTRAINT "GoalEntry_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
