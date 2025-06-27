import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/goals_/$goalId_/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/goals/$goalId/edit"!</div>
}
