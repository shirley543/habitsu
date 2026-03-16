import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import ky, { HTTPError } from 'ky'
import type {
  CreateUserDto,
  LoginUserDto,
  UpdateUserDto,
  UserResponseDto,
} from '@habit-tracker/validation-schemas'
import { queryClient } from '@/integrations/tanstack-query/root-provider'

const KY_FETCH_RETRY_NUM = 0
const REACT_QUERY_RETRY_NUM = 0

// prefixUrl replaced by Vite proxy in dev to avoid CORS issues
const api = ky.create({
  prefixUrl: '/api',
  credentials: 'include',
  retry: KY_FETCH_RETRY_NUM,
})


/**
 * Helper functions
 */

export async function checkAuthUser() {
  const user = await queryClient.ensureQueryData({
    queryKey: ['user'],
    queryFn: fetchUser,
  })
  return user
}

export function clearAuthUser() {
  // Remove user query (used for determining if logged in)
  queryClient.removeQueries({
    queryKey: ['user']
  });
  // Also clear whole cache (ensure e.g. 'goals' data is cleared as only relevant to logged in user)
  queryClient.clear()
}


/**
 * /users
 */

export async function fetchUser(): Promise<UserResponseDto | null> {
  try {
    const data = await api.get('users/me').json<UserResponseDto | null>();
    return data;
  } catch (err: unknown) {
    if (err instanceof HTTPError) {
      console.error('HTTP Error:', err.response.status)
      if (err.response.status === 401) {
        return null
      }
    } else if (err instanceof TypeError) {
      console.error('Network error:', err.message)
    } else {
      console.error('Unexpected error:', err)
    }

    // TODOs #12 fix error handling if other error occurs e.g. backend down hence no HTTPError
    throw err
  }
}

export function useUser() {
  return useQuery<UserResponseDto | null, HTTPError>({
    queryKey: ['user'],
    queryFn: () => fetchUser(),
    retry: REACT_QUERY_RETRY_NUM,
  })
}

async function postCreateUser(
  newUser: CreateUserDto,
): Promise<UserResponseDto> {
  return api.post('users', { json: newUser }).json()
}

export function useCreateUserMutation() {
  return useMutation({
    mutationKey: ['createUser'],
    mutationFn: (newUser: CreateUserDto) => {
      return postCreateUser(newUser)
    },
  })
}

async function patchUpdateUser(
  updateUser: UpdateUserDto,
): Promise<UserResponseDto> {
  return api.patch(`users/me`, { json: updateUser }).json()
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['updateUser'],
    mutationFn: ({ update }: { update: UpdateUserDto }) => {
      return patchUpdateUser(update)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })
}

async function deleteUser(): Promise<UserResponseDto> {
  return api.delete(`users/me`).json()
}

export function useDeleteUserMutation() {
  return useMutation({
    mutationKey: ['deleteUser'],
    mutationFn: () => {
      return deleteUser()
    },
  })
}

async function postLoginUser(user: LoginUserDto): Promise<UserResponseDto> {
  return api.post('auth/login', { json: user }).json()
}

export function useLoginUserMutation() {
  return useMutation({
    mutationKey: ['loginUser'],
    mutationFn: (user: LoginUserDto) => {
      return postLoginUser(user)
    },
  })
}

async function postLogoutUser() {
  return api.post('auth/logout').json()
}

export function useLogoutUserMutation() {
  return useMutation({
    mutationKey: ['logoutUser'],
    mutationFn: () => {
      // Clear user data when log out is requested
      clearAuthUser()
      return postLogoutUser()
    },
  })
}
