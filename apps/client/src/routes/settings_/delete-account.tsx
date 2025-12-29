import { createFileRoute } from '@tanstack/react-router'
import { DeleteAccountPage } from '@/features/settings/DeleteAccountPage'

export const Route = createFileRoute('/settings_/delete-account')({
  component: DeleteAccountPage,
})
