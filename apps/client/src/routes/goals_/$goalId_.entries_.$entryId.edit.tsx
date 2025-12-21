import { createFileRoute } from '@tanstack/react-router'
import { EntryEditPage } from '@/features/goals/EntryCreatePage'

export const Route = createFileRoute('/goals_/$goalId_/entries_/$entryId/edit')(
  {
    component: EntryEditPage,
  },
)
