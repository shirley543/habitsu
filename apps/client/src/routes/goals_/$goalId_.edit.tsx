import { createFileRoute } from '@tanstack/react-router'
import { GoalEditPage, SkeletonGoalEditPage } from '@/features/goals/GoalCreatePage'

export const Route = createFileRoute('/goals_/$goalId_/edit')({
  component: GoalEditPage,
  pendingComponent: SkeletonGoalEditPage,
})
