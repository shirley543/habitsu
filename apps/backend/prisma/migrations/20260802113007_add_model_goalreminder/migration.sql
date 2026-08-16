-- CreateTable
CREATE TABLE "GoalReminder" (
    "id" SERIAL NOT NULL,
    "goalId" INTEGER NOT NULL,
    "time" TEXT NOT NULL,
    "weekdays" INTEGER[],
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "GoalReminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GoalReminder_goalId_key" ON "GoalReminder"("goalId");

-- AddForeignKey
ALTER TABLE "GoalReminder" ADD CONSTRAINT "GoalReminder_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
