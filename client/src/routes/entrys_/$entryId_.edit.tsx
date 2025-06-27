import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/entrys_/$entryId_/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/entrys/$entryId/edit"!</div>
}
