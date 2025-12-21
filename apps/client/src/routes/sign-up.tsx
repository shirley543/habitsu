import { SignUpPage } from '@/features/login/LoginPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/sign-up')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SignUpPage/>
}
