import { AccountDetailsPage } from '@/features/settings/AccountDetailsPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/settings_/account-details')({
  component: AccountDetailsPage,
})
