import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/entrys/$entryId/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/entrys/$entryId/edit"!</div>
}
