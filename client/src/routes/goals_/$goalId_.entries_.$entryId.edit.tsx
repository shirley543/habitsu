import { EntryEditPage } from '@/features/goals/EntryCreatePage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/goals_/$goalId_/entries_/$entryId/edit')({
  component: EntryEditPage,
})
