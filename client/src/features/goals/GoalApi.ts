import type { GoalEntryResponse, GoalResponse, SearchParamsGoalEntryDto, GoalStatisticsReponse, GoalMonthlyAveragesResponse, GoalMonthlyCountsResponse, CreateGoalDto, UpdateGoalDto, CreateGoalEntryDto, UpdateGoalEntryDto } from "@habit-tracker/shared";
import { useMutation, useQuery } from "@tanstack/react-query";
import ky, { HTTPError } from 'ky';

const BACKEND_BASE_URL = "http://localhost:8080";

const KY_FETCH_RETRY_NUM = 0;
const REACT_QUERY_RETRY_NUM = 0;

/**
 * /goals
 */
async function fetchGoals(): Promise<Array<GoalResponse>> {
  return ky.get(`${BACKEND_BASE_URL}/goals`, { retry: KY_FETCH_RETRY_NUM }).json();
}

export function useGoals() {
  return useQuery<Array<GoalResponse>, HTTPError>({
    queryKey: ['goal'],
    queryFn: () => fetchGoals(),
    retry: REACT_QUERY_RETRY_NUM,
  });
}

async function fetchGoalById(goalId: number): Promise<GoalResponse> {
  return ky.get(`${BACKEND_BASE_URL}/goals/${goalId}`, { retry: KY_FETCH_RETRY_NUM }).json();
}

export function useGoal(goalId: string) {
  return useQuery<GoalResponse, HTTPError>({
    queryKey: ['goal', goalId],
    queryFn: () => fetchGoalById(Number(goalId)),
    enabled: Number.isInteger(Number(goalId)),
    retry: REACT_QUERY_RETRY_NUM,
  });
}

async function postCreateGoal(newGoal: CreateGoalDto): Promise<GoalResponse> {
  return ky.post(`${BACKEND_BASE_URL}/goals`, { retry: KY_FETCH_RETRY_NUM, json: newGoal }).json();
}

export function useCreateGoalMutation() {
  return useMutation({
    mutationFn: (newGoal: CreateGoalDto) => { return postCreateGoal(newGoal) },
  })
}

async function patchUpdateGoal(goalId: number, updateGoal: UpdateGoalDto): Promise<GoalResponse> {
  return ky.patch(`${BACKEND_BASE_URL}/goals/${goalId}`, { retry: KY_FETCH_RETRY_NUM, json: updateGoal }).json();
}

export function useUpdateGoalMutation() {
  return useMutation({
    mutationFn: ({ id, update }: { id: number, update: UpdateGoalDto }) => { return patchUpdateGoal(id, update) },
  })
}


/**
 * /goalEntries
 */
async function fetchGoalEntriesBySearchParams(searchParams: SearchParamsGoalEntryDto): Promise<Array<GoalEntryResponse>> {
  const searchSegment = Object.entries(searchParams).map(([key, value]) => {
    return `${key}=${value}`
  }).join('&');
  return ky.get(`${BACKEND_BASE_URL}/entries?${searchSegment}`, { retry: KY_FETCH_RETRY_NUM }).json();
}

export function useGoalEntries(searchParams: SearchParamsGoalEntryDto) {
  return useQuery<Array<GoalEntryResponse>, HTTPError>({
    queryKey: ['entries', searchParams],
    queryFn: () => fetchGoalEntriesBySearchParams(searchParams),
    retry: REACT_QUERY_RETRY_NUM,
  })
}

async function fetchGoalStatisticsBySearchParams(searchParams: SearchParamsGoalEntryDto): Promise<GoalStatisticsReponse> {
  const searchSegment = Object.entries(searchParams).map(([key, value]) => {
    return `${key}=${value}`
  }).join('&');
  return ky.get(`${BACKEND_BASE_URL}/entries/statistics?${searchSegment}`, { retry: KY_FETCH_RETRY_NUM }).json();
}

export function useGoalStatistics(searchParams: SearchParamsGoalEntryDto) {
  return useQuery<GoalStatisticsReponse, HTTPError>({
    queryKey: ['goalStatistics', searchParams],
    queryFn: () => fetchGoalStatisticsBySearchParams(searchParams),
    enabled: !!searchParams.goalId,
    retry: REACT_QUERY_RETRY_NUM,
  })
}

async function fetchGoalMonthlyAvgsBySearchParams(searchParams: SearchParamsGoalEntryDto): Promise<GoalMonthlyAveragesResponse> {
  const searchSegment = Object.entries(searchParams).map(([key, value]) => {
    return `${key}=${value}`
  }).join('&');
  return ky.get(`${BACKEND_BASE_URL}/entries/monthly-averages?${searchSegment}`, { retry: KY_FETCH_RETRY_NUM }).json();
}

export function useGoalMonthlyAvgs(searchParams: SearchParamsGoalEntryDto, enabled: boolean) {
  return useQuery<GoalMonthlyAveragesResponse, HTTPError>({
    queryKey: ['goalMonthlyAvgs', searchParams],
    queryFn: () => fetchGoalMonthlyAvgsBySearchParams(searchParams),
    enabled: enabled,
    retry: REACT_QUERY_RETRY_NUM,
  })
}

async function fetchGoalMonthlyCountsBySearchParams(searchParams: SearchParamsGoalEntryDto): Promise<GoalMonthlyCountsResponse> {
  const searchSegment = Object.entries(searchParams).map(([key, value]) => {
    return `${key}=${value}`
  }).join('&');
  return ky.get(`${BACKEND_BASE_URL}/entries/monthly-counts?${searchSegment}`, { retry: KY_FETCH_RETRY_NUM }).json();
}

export function useGoalMonthlyCounts(searchParams: SearchParamsGoalEntryDto, enabled: boolean) {
  return useQuery<GoalMonthlyCountsResponse, HTTPError>({
    queryKey: ['goalMonthlyCounts', searchParams],
    queryFn: () => fetchGoalMonthlyCountsBySearchParams(searchParams),
    enabled: enabled,
    retry: REACT_QUERY_RETRY_NUM,
  })
}

async function postCreateGoalEntry(goalId: number, createDto: CreateGoalEntryDto): Promise<GoalEntryResponse> {
  return ky.post(`${BACKEND_BASE_URL}/goals/${goalId}`, { retry: KY_FETCH_RETRY_NUM, json: createDto }).json();
}

export function useCreateGoalEntryMutation() {
  return useMutation({
    mutationFn: ({ goalId, newGoalEntry }: { goalId: number, newGoalEntry: CreateGoalEntryDto }) => { 
      return postCreateGoalEntry(goalId, newGoalEntry)
    },
  })
}

async function patchUpdateGoalEntry(goalId: number, entryId: number, updateGoalEntry: UpdateGoalEntryDto): Promise<GoalEntryResponse> {
  return ky.patch(`${BACKEND_BASE_URL}/goals/${goalId}/entries/${entryId}`, { retry: KY_FETCH_RETRY_NUM, json: updateGoalEntry }).json();
}

export function useUpdateGoalEntryMutation() {
  return useMutation({
    mutationFn: ({ goalId, entryId, updateDto }: { goalId: number, entryId: number, updateDto: UpdateGoalEntryDto }) => {
      return patchUpdateGoalEntry(goalId, entryId, updateDto)
    },
  })
}
