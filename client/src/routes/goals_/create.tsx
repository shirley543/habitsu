import { GoalCreatePage } from '@/features/goals/GoalCreatePage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/goals_/create')({
  component: GoalCreatePage,
})
