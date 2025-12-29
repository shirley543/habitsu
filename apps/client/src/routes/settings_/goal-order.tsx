import { createFileRoute } from '@tanstack/react-router'
import { GoalOrderPage } from '@/features/settings/GoalOrderPage'

export const Route = createFileRoute('/settings_/goal-order')({
  component: GoalOrderPage,
})
