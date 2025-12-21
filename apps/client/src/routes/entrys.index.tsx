import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/entrys/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/entrys/"!</div>
}
