import { Outlet, createRootRouteWithContext, redirect } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import TanStackQueryLayout from '../integrations/tanstack-query/layout.tsx'
import type { QueryClient } from '@tanstack/react-query'
import { queryClient } from '@/integrations/tanstack-query/root-provider.tsx'
import { fetchUser } from '@/apis/UserApi.ts'

interface MyRouterContext {
  queryClient: QueryClient
}

export async function checkAuthUser() {
  const user = await queryClient.ensureQueryData({
    queryKey: ['user'],
    queryFn: fetchUser,
  })
  return user
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <div className="bg-neutral-100 w-[100vw] h-[100vh] px-3 py-3 box-border flex flex-col items-center overflow-y-auto">
      <div className="max-w-[1024px] w-full">
        <Outlet />
      </div>
      
      {/* <TanStackRouterDevtools />

      <TanStackQueryLayout /> */}
    </div>
  ),
  beforeLoad: async ({ location }) => {
    const isLoggedInUser = await checkAuthUser();
    
    // List of public paths that don't require auth
    const publicPaths = ['/login', '/signup', '/forgot-password'];

    if (!isLoggedInUser && !publicPaths.includes(location.pathname)) {
      throw redirect({ to: '/login' })
    }
  },
})
