import { GoalDetailsPage } from '@/features/goals/GoalDetailsPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/goals_/$goalId')({
  component: GoalDetailsPage,
})

// function RouteComponent() {
//   return <>
//   <div>Hello "/goals/$goalId" aaaa!</div>
//   </>
  
// }
