import { GoalsPage } from '@/features/goals/GoalsPage'
import { requireAuth } from '@/integrations/tanstack-query/requireAuth'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/goals')({
  component: GoalsPage,
  beforeLoad: requireAuth,
})
