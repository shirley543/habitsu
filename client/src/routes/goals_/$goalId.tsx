import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/goals_/$goalId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <>
  <div>Hello "/goals/$goalId" aaaa!</div>
  </>
  
}
