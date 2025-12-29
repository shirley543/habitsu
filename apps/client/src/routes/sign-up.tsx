import { createFileRoute } from '@tanstack/react-router'
import { SignUpPage } from '@/features/login/LoginPage'

export const Route = createFileRoute('/sign-up')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SignUpPage />
}
