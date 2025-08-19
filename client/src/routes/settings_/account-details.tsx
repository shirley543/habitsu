import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/settings_/account-details')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/settings_/account-details"!</div>
}
