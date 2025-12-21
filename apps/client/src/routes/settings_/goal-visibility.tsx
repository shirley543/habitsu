import { createFileRoute } from '@tanstack/react-router'
import { GoalVisibilityPage } from '@/features/settings/GoalVisibilityPage'

export const Route = createFileRoute('/settings_/goal-visibility')({
  component: GoalVisibilityPage,
})
