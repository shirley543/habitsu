import { createFileRoute } from '@tanstack/react-router'
import { GoalCreatePage, SkeletonGoalCreatePage } from '@/features/goals/GoalCreatePage'

export const Route = createFileRoute('/goals_/create')({
  component: GoalCreatePage,
  pendingComponent: SkeletonGoalCreatePage,
})
