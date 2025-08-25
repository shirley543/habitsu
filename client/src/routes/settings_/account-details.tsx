import { AccountDetailsPage } from '@/features/settings/AccountDetailsPage'
import { requireAuth } from '@/integrations/tanstack-query/requireAuth'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/settings_/account-details')({
  component: AccountDetailsPage,
  beforeLoad: requireAuth,
})
