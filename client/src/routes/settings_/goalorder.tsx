import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/settings_/goalorder')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/settings/goalorder"!</div>
}
