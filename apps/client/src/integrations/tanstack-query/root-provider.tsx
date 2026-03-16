import { clearAuthUser } from '@/apis/UserApi'
import { triggerErrorToast } from '@/components/custom/ErrorComponents'
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { redirect } from '@tanstack/react-router'
import { HTTPError } from 'ky'

// Handle mid-way unauthorized errors,
// by checking for 401 status and if so,
// clear user auth and redirect to login page
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: unknown, query) => {
      console.error(`Query ${query.options.queryKey ?? '<unknown query>'} failed:`, error)

      if (error instanceof HTTPError && error.response.status === 401) {
        clearAuthUser()
        throw redirect({ to: '/login' }) // TODOs #12 fix this; ideally redirect via router.navigate instead of redirect (intended for loader/beforeLoad)
      }

      triggerErrorToast(error)
    }
  }),
  mutationCache: new MutationCache({
    onError: (error: unknown, _variables, _context, mutation) => {
      console.error(`Mutation ${mutation.options.mutationKey ?? '<unknown mutation>'} failed:`, error)

      if (error instanceof HTTPError && error.response.status === 401) {
        clearAuthUser()
        throw redirect({ to: '/login' }) // TODOs #12 fix this; ideally redirect via router.navigate instead of redirect (intended for loader/beforeLoad)
      }

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
