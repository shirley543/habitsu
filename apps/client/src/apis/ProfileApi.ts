import { useQuery } from '@tanstack/react-query'
import ky from 'ky'
import type { HTTPError } from 'ky';
import type { ProfileResponseDto } from '@habit-tracker/validation-schemas'

const KY_FETCH_RETRY_NUM = 0
const REACT_QUERY_RETRY_NUM = 0

// prefixUrl replaced by Vite proxy in dev to avoid CORS issues
const api = ky.create({
  prefixUrl: '/api',
  credentials: 'include',
  retry: KY_FETCH_RETRY_NUM,
})

/**
 * /profile
 */
async function fetchProfileByUsername(
  username: string,
): Promise<ProfileResponseDto> {
  return api.get(`profiles/${username}`).json()
}

export function useProfile(username: string) {
  return useQuery<ProfileResponseDto, HTTPError>({
    queryKey: ['profile', username],
    queryFn: () => fetchProfileByUsername(username),
    retry: REACT_QUERY_RETRY_NUM,
  })
}
