import { createFileRoute } from '@tanstack/react-router'
import { EntryCreatePage } from '@/features/goals/EntryCreatePage'

export const Route = createFileRoute('/goals_/$goalId_/entries/create')({
  component: EntryCreatePage,
})
