import { GoalVisibilityPage } from '@/features/settings/GoalVisibilityPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/settings_/goalvisibility')({
  component: GoalVisibilityPage,
})
