import { DeleteAccountPage } from '@/features/settings/DeleteAccountPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/settings_/delete-account')({
  component: DeleteAccountPage,
})
