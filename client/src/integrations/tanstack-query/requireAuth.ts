import { queryClient } from './root-provider'
import { fetchUser } from '../../apis/UserApi'
import { redirect } from '@tanstack/react-router'

export async function requireAuth() {
  const user = await queryClient.ensureQueryData({
    queryKey: ['user'],
    queryFn: fetchUser,
  })

  if (!user) {
    throw redirect({ to: '/login' })
  }
  return user
}
