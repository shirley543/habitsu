import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import TanStackQueryLayout from '../integrations/tanstack-query/layout.tsx'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <div className="bg-neutral-100 w-[100vw] h-[100vh] px-3 py-3 box-border flex flex-col items-center overflow-y-auto">
      <div className="max-w-[1366px] w-full">
        <Outlet />
      </div>
      
      {/* <TanStackRouterDevtools />

      <TanStackQueryLayout /> */}
    </div>
  ),
})
