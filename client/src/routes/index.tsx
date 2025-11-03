import { createFileRoute } from '@tanstack/react-router'
// import logo from '../logo.svg'
// import Heatmap from '@/components/custom/Heatmap'
// import GoalForm from '@/components/custom/GoalForm'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="text-center">
      Landing page TODOs #1
    </div>
  )
}
