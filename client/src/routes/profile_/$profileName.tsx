import { ProfilePage } from '@/features/profile/ProfilePage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/profile_/$profileName')({
  component: ProfilePage,
})
