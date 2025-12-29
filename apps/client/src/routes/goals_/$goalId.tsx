import { createFileRoute } from '@tanstack/react-router'
import { GoalDetailsPage } from '@/features/goals/GoalDetailsPage'

export const Route = createFileRoute('/goals_/$goalId')({
  component: GoalDetailsPage,
})
