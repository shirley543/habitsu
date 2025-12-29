import { createFileRoute } from '@tanstack/react-router'
import { AccountDetailsPage } from '@/features/settings/AccountDetailsPage'

export const Route = createFileRoute('/settings_/account-details')({
  component: AccountDetailsPage,
})
