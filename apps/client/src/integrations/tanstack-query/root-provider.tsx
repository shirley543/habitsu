import { triggerErrorToast } from '@/components/custom/ErrorComponents'
import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error: unknown, _variables, _context, mutation) => {
      console.error(`Mutation ${mutation.options.mutationKey ?? '<unknown mutation>'} failed:`, error)
      triggerErrorToast(error)
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
