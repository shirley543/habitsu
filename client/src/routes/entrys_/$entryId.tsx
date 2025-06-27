import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/entrys_/$entryId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/entrys/$entryId"!</div>
}
