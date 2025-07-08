import type { GoalEntryResponse, GoalResponse, SearchParamsGoalEntryDto, GoalStatisticsReponse, GoalMonthlyAveragesResponse, GoalMonthlyCountsResponse } from "@habit-tracker/shared";
import { useQuery } from "@tanstack/react-query";
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

export function useGoal(goalId: number) {
  return useQuery<GoalResponse, HTTPError>({
    queryKey: ['goal', goalId],
    queryFn: () => fetchGoalById(goalId),
    enabled: !!goalId,
    retry: REACT_QUERY_RETRY_NUM,
  });
}


/**
 * /goalEntries
 */
async function fetchGoalEntriesBySearchParams(searchParams: SearchParamsGoalEntryDto): Promise<Array<GoalEntryResponse>> {
  const searchSegment = Object.entries(searchParams).map(([key, value]) => {
    return `${key}=${value}`
  }).join('&');
  return ky.get(`${BACKEND_BASE_URL}/goalEntries?${searchSegment}`, { retry: KY_FETCH_RETRY_NUM }).json();
}

export function useGoalEntries(searchParams: SearchParamsGoalEntryDto) {
  return useQuery<Array<GoalEntryResponse>, HTTPError>({
    queryKey: ['goalEntries', searchParams],
    queryFn: () => fetchGoalEntriesBySearchParams(searchParams),
    retry: REACT_QUERY_RETRY_NUM,
  })
}

async function fetchGoalStatisticsBySearchParams(searchParams: SearchParamsGoalEntryDto): Promise<GoalStatisticsReponse> {
  const searchSegment = Object.entries(searchParams).map(([key, value]) => {
    return `${key}=${value}`
  }).join('&');
  return ky.get(`${BACKEND_BASE_URL}/goalEntries/statistics?${searchSegment}`, { retry: KY_FETCH_RETRY_NUM }).json();
}

export function useGoalStatistics(searchParams: SearchParamsGoalEntryDto) {
  return useQuery<GoalStatisticsReponse, HTTPError>({
    queryKey: ['goalStatistics', searchParams],
    queryFn: () => fetchGoalStatisticsBySearchParams(searchParams),
    retry: REACT_QUERY_RETRY_NUM,
  })
}

async function fetchGoalMonthlyAvgsBySearchParams(searchParams: SearchParamsGoalEntryDto): Promise<GoalMonthlyAveragesResponse> {
  const searchSegment = Object.entries(searchParams).map(([key, value]) => {
    return `${key}=${value}`
  }).join('&');
  return ky.get(`${BACKEND_BASE_URL}/goalEntries/monthly-averages?${searchSegment}`, { retry: KY_FETCH_RETRY_NUM }).json();
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
  return ky.get(`${BACKEND_BASE_URL}/goalEntries/monthly-counts?${searchSegment}`, { retry: KY_FETCH_RETRY_NUM }).json();
}

export function useGoalMonthlyCounts(searchParams: SearchParamsGoalEntryDto, enabled: boolean) {
  return useQuery<GoalMonthlyCountsResponse, HTTPError>({
    queryKey: ['goalMonthlyCounts', searchParams],
    queryFn: () => fetchGoalMonthlyCountsBySearchParams(searchParams),
    enabled: enabled,
    retry: REACT_QUERY_RETRY_NUM,
  })
}
