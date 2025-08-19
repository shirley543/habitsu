import { GoalOrderPage } from '@/features/settings/GoalOrderPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/settings_/goal-order')({
  component: GoalOrderPage,
})
