import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/settings/goalvisibility')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/settings/goalvisibility"!</div>
}
