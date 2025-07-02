import { EntryCreatePage } from '@/features/entrys/EntryCreatePage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/goals_/$goalId_/entrys/create')({
  component: EntryCreatePage,
})
