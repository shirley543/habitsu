import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/settings_/delete-account')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/settings_/delete-account"!</div>
}
