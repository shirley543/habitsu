import { useMutation, useQuery } from '@tanstack/react-query'
import ky from 'ky'
import type { HTTPError } from 'ky'
import type {
  CreateGoalDto,
  CreateGoalEntryDto,
  GoalEntryResponse,
  GoalMonthlyAveragesResponse,
  GoalMonthlyCountsResponse,
  GoalResponse,
  GoalStatisticsReponse,
  ReorderGoalDto,
  SearchParamsGoalEntryDto,
  UpdateGoalDto,
  UpdateGoalEntryDto,
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
 * /goals
 */
async function fetchGoals(): Promise<Array<GoalResponse>> {
  return api.get('goals').json()
}

export function useGoals() {
  return useQuery<Array<GoalResponse>, HTTPError>({
    queryKey: ['goals'],
    queryFn: () => fetchGoals(),
    retry: REACT_QUERY_RETRY_NUM,
  })
}

async function fetchGoalById(goalId: number): Promise<GoalResponse> {
  return api.get(`goals/${goalId}`).json()
}

export function useGoal(goalId: string) {
  return useQuery<GoalResponse, HTTPError>({
    queryKey: ['goal', Number(goalId)],
    queryFn: () => fetchGoalById(Number(goalId)),
    enabled: Number.isInteger(Number(goalId)),
    retry: REACT_QUERY_RETRY_NUM,
  })
}

async function postCreateGoal(newGoal: CreateGoalDto): Promise<GoalResponse> {
  return api.post('goals', { json: newGoal }).json()
}

export function useCreateGoalMutation() {
  return useMutation({
    mutationFn: (newGoal: CreateGoalDto) => {
      return postCreateGoal(newGoal)
    },
  })
}

async function patchUpdateGoal(
  goalId: number,
  updateGoal: UpdateGoalDto,
): Promise<GoalResponse> {
  return api.patch(`goals/${goalId}`, { json: updateGoal }).json()
}

export function useUpdateGoalMutation() {
  return useMutation({
    mutationFn: ({ id, update }: { id: number; update: UpdateGoalDto }) => {
      return patchUpdateGoal(id, update)
    },
    onMutate: async ({ id, update }: { id: number; update: UpdateGoalDto }) => {
      // Optimistically update the cache before mutation resolves:
      // - pause ongoing fetches,
      // - snapshot previous data for rollback if needed,
      // - then otimistically update the goal color in cache
      await queryClient.cancelQueries({ queryKey: ['goals'] })
      await queryClient.cancelQueries({ queryKey: ['goal', id] })

      const previousGoals = queryClient.getQueryData(['goals'])
      const previousGoal = queryClient.getQueryData(['goal', id])

      queryClient.setQueryData<Array<GoalResponse>>(['goals'], (oldGoals) => {
        if (!oldGoals) return oldGoals
        return oldGoals.map((goal) =>
          goal.id === id
            ? ({
                ...goal,
                colour: update.colour,
                description: update.description,
                icon: update.icon,
                title: update.title,
              } as GoalResponse)
            : goal,
        )
      })

      queryClient.setQueryData<GoalResponse>(['goal', id], (oldGoal) => {
        if (!oldGoal) return oldGoal
        return {
          ...oldGoal,
          colour: update.colour,
          description: update.description,
          icon: update.icon,
          title: update.title,
        } as GoalResponse
      })

      // Return context for rollback on error
      return { previousGoals, previousGoal }
    },
    onError: (_err, variables, context) => {
      // Rollback to previous cache on error
      if (context?.previousGoals) {
        queryClient.setQueryData(['goals'], context.previousGoals)
      }
      if (context?.previousGoal) {
        queryClient.setQueryData(['goal', variables.id], context.previousGoal)
      }
    },
    onSettled: (_data, _error, variables) => {
      // Invalidate queries to ensure fresh data next time
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      queryClient.invalidateQueries({ queryKey: ['goal', variables.id] })
    },
  })
}

async function deleteGoal(goalId: number): Promise<GoalResponse> {
  return api.delete(`goals/${goalId}`).json()
}

export function useDeleteGoalMutation() {
  return useMutation({
    mutationFn: (goalId: number) => {
      return deleteGoal(goalId)
    },
  })
}

async function reorderGoals(reorderGoal: ReorderGoalDto): Promise<void> {
  return api.post('goals/reorder', { json: reorderGoal }).json()
}

export function useReorderGoalsMutation() {
  return useMutation({
    mutationFn: (reorder: ReorderGoalDto) => {
      return reorderGoals(reorder)
    },
    onMutate: async (reorder: ReorderGoalDto) => {
      // Optimistically update the cache before mutation resolves:
      // - pause ongoing fetches,
      // - snapshot previous data for rollback if needed,
      // - then otimistically update the goal color in cache
      await queryClient.cancelQueries({ queryKey: ['goals'] })

      const previousGoals = queryClient.getQueryData(['goals'])

      function sortGoals(
        goals: Array<GoalResponse>,
        reorderData: Array<{ id: number; order: number }>,
      ): Array<GoalResponse> {
        const orderMap = new Map<number, number>(
          reorderData.map(({ id, order }) => [id, order]),
        )

        return [...goals].sort((a, b) => {
          const orderA = orderMap.get(a.id)
          const orderB = orderMap.get(b.id)

          // If both have order, sort by order
          if (orderA != null && orderB != null) {
            return orderA - orderB
          }

          // If only one has order, it comes first
          if (orderA != null) return -1
          if (orderB != null) return 1

          // If neither has order, keep original order
          return 0
        })
      }

      queryClient.setQueryData<Array<GoalResponse>>(['goals'], (oldGoals) => {
        if (!oldGoals) return oldGoals
        return sortGoals(oldGoals, reorder)
      })

      // Return context for rollback on error
      return { previousGoals }
    },
    onError: (_err, _variables, context) => {
      // Rollback to previous cache on error
      if (context?.previousGoals) {
        queryClient.setQueryData(['goals'], context.previousGoals)
      }
    },
    onSettled: () => {
      // Invalidate queries to ensure fresh data next time
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}

/**
 * /goalEntries
 */
async function fetchGoalEntriesBySearchParams(
  searchParams: SearchParamsGoalEntryDto,
): Promise<Array<GoalEntryResponse>> {
  const searchSegment = Object.entries(searchParams)
    .map(([key, value]) => {
      return `${key}=${value}`
    })
    .join('&')
  return api.get(`entries?${searchSegment}`).json()
}

export function useGoalEntries(searchParams: SearchParamsGoalEntryDto) {
  return useQuery<Array<GoalEntryResponse>, HTTPError>({
    queryKey: ['entries', searchParams],
    queryFn: () => fetchGoalEntriesBySearchParams(searchParams),
    retry: REACT_QUERY_RETRY_NUM,
  })
}

async function fetchGoalEntryById(entryId: number): Promise<GoalEntryResponse> {
  return api.get(`entries/${entryId}`).json()
}

export function useGoalEntry(entryId: string) {
  return useQuery<GoalEntryResponse, HTTPError>({
    queryKey: ['entries', entryId],
    queryFn: () => fetchGoalEntryById(Number(entryId)),
    enabled: Number.isInteger(Number(entryId)),
    retry: REACT_QUERY_RETRY_NUM,
  })
}

async function fetchGoalStatisticsBySearchParams(
  searchParams: SearchParamsGoalEntryDto,
): Promise<GoalStatisticsReponse> {
  const searchSegment = Object.entries(searchParams)
    .map(([key, value]) => {
      return `${key}=${value}`
    })
    .join('&')
  return api.get(`entries/statistics?${searchSegment}`).json()
}

export function useGoalStatistics(searchParams: SearchParamsGoalEntryDto) {
  return useQuery<GoalStatisticsReponse, HTTPError>({
    queryKey: ['goalStatistics', searchParams],
    queryFn: () => fetchGoalStatisticsBySearchParams(searchParams),
    enabled: !!searchParams.goalId,
    retry: REACT_QUERY_RETRY_NUM,
  })
}

async function fetchGoalMonthlyAvgsBySearchParams(
  searchParams: SearchParamsGoalEntryDto,
): Promise<GoalMonthlyAveragesResponse> {
  const searchSegment = Object.entries(searchParams)
    .map(([key, value]) => {
      return `${key}=${value}`
    })
    .join('&')
  return api.get(`entries/monthly-averages?${searchSegment}`).json()
}

export function useGoalMonthlyAvgs(
  searchParams: SearchParamsGoalEntryDto,
  enabled: boolean,
) {
  return useQuery<GoalMonthlyAveragesResponse, HTTPError>({
    queryKey: ['goalMonthlyAvgs', searchParams],
    queryFn: () => fetchGoalMonthlyAvgsBySearchParams(searchParams),
    enabled: enabled,
    retry: REACT_QUERY_RETRY_NUM,
  })
}

async function fetchGoalMonthlyCountsBySearchParams(
  searchParams: SearchParamsGoalEntryDto,
): Promise<GoalMonthlyCountsResponse> {
  const searchSegment = Object.entries(searchParams)
    .map(([key, value]) => {
      return `${key}=${value}`
    })
    .join('&')
  return api.get(`entries/monthly-counts?${searchSegment}`).json()
}

export function useGoalMonthlyCounts(
  searchParams: SearchParamsGoalEntryDto,
  enabled: boolean,
) {
  return useQuery<GoalMonthlyCountsResponse, HTTPError>({
    queryKey: ['goalMonthlyCounts', searchParams],
    queryFn: () => fetchGoalMonthlyCountsBySearchParams(searchParams),
    enabled: enabled,
    retry: REACT_QUERY_RETRY_NUM,
  })
}

async function postCreateGoalEntry(
  goalId: number,
  createDto: CreateGoalEntryDto,
): Promise<GoalEntryResponse> {
  return api.post(`goals/${goalId}/entries`, { json: createDto }).json()
}

export function useCreateGoalEntryMutation() {
  return useMutation({
    mutationFn: ({
      goalId,
      createDto,
    }: {
      goalId: number
      createDto: CreateGoalEntryDto
    }) => {
      return postCreateGoalEntry(goalId, createDto)
    },
  })
}

async function patchUpdateGoalEntry(
  goalId: number,
  entryId: number,
  updateGoalEntry: UpdateGoalEntryDto,
): Promise<GoalEntryResponse> {
  return api
    .patch(`goals/${goalId}/entries/${entryId}`, { json: updateGoalEntry })
    .json()
}

export function useUpdateGoalEntryMutation() {
  return useMutation({
    mutationFn: ({
      goalId,
      entryId,
      updateDto,
    }: {
      goalId: number
      entryId: number
      updateDto: UpdateGoalEntryDto
    }) => {
      return patchUpdateGoalEntry(goalId, entryId, updateDto)
    },
  })
}

async function deleteGoalEntry(
  goalId: number,
  entryId: number,
): Promise<GoalEntryResponse> {
  return api.delete(`goals/${goalId}/entries/${entryId}`).json()
}

export function useDeleteGoalEntryMutation() {
  return useMutation({
    mutationFn: ({ goalId, entryId }: { goalId: number; entryId: number }) => {
      return deleteGoalEntry(goalId, entryId)
    },
  })
}
