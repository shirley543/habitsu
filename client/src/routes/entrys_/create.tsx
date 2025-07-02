import { EntryCreatePage } from '@/features/entrys/EntryCreatePage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/entrys_/create')({
  component: EntryCreatePage,
})
