import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { toast } from 'sonner'

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      toast(`Something went wrong: ${error.message}`)
    }
  }),
})

export function getContext() {
  return {
    queryClient,
  }
}

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
