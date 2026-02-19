import { useQuery } from '@tanstack/react-query'
import ky from 'ky'
import type { HTTPError } from 'ky'
import type { ProfileResponseDto, GoalResponse } from '@habit-tracker/validation-schemas'

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

/**
 * /profile/:username/goals
 * 
 * @param username 
 * @returns 
 */
async function fetchProfileGoalsByUsername(
  username: string,
): Promise<Array<GoalResponse>> {
  return api.get(`profiles/${username}/goals`).json()
}

export function useProfileGoals(username: string) {
  return useQuery<Array<GoalResponse>, HTTPError>({
    queryKey: ['goals', username],
    queryFn: () => fetchProfileGoalsByUsername(username),
    retry: REACT_QUERY_RETRY_NUM,
  })
}
