import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/goals/')({
  component: RouteComponent,
})

// TODOs: This seems useless/ redundant. Review TanStack Router docs
function RouteComponent() {
  return <div>Hello "/goals/"!</div>
}
