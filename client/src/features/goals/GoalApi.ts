import type { GoalEntryResponse, GoalResponse, SearchParamsGoalEntryDto, GoalStatisticsReponse, GoalMonthlyAveragesResponse } from "@habit-tracker/shared";
import { useQuery } from "@tanstack/react-query";

const BACKEND_BASE_URL = "http://localhost:8080";

/**
 * /goals
 */
async function fetchGoals(): Promise<Array<GoalResponse>> {
  const response = await fetch(`${BACKEND_BASE_URL}/goals`);
  const data = await response.json();
  return data;
}

export function useGoals() {
  return useQuery({
    queryKey: ['goal'],
    queryFn: () => fetchGoals(),
  });
}

async function fetchGoalById(goalId: number): Promise<GoalResponse> {
  // TODOss: wrap all fetch calls with throw new Error
  const response = await fetch(`${BACKEND_BASE_URL}/goals/${goalId}`);
  if (!response.ok) {
    console.log("response status", response.status);
    throw new Error('Network response was not ok')
  }
  const data = await response.json();
  return data;
}

export function useGoal(goalId: number) {
  return useQuery({
    queryKey: ['goal', goalId],
    queryFn: () => fetchGoalById(goalId),
    enabled: !!goalId,
  });
}


/**
 * /goalEntries
 */
async function fetchGoalEntriesBySearchParams(searchParams: SearchParamsGoalEntryDto): Promise<Array<GoalEntryResponse>> {
  const searchSegment = Object.entries(searchParams).map(([key, value]) => {
    return `${key}=${value}`
  }).join('&');
  const response = await fetch(`${BACKEND_BASE_URL}/goalEntries?${searchSegment}`);
  const data = await response.json();
  return data;
}

export function useGoalEntries(searchParams: SearchParamsGoalEntryDto) {
  return useQuery({
    queryKey: ['goalEntries', searchParams],
    queryFn: () => fetchGoalEntriesBySearchParams(searchParams),
  })
}

async function fetchGoalStatisticsBySearchParams(searchParams: SearchParamsGoalEntryDto): Promise<GoalStatisticsReponse> {
  const searchSegment = Object.entries(searchParams).map(([key, value]) => {
    return `${key}=${value}`
  }).join('&');
  const response = await fetch(`${BACKEND_BASE_URL}/goalEntries/statistics?${searchSegment}`);
  if (!response.ok) {
    console.log("response status", response.status);
    throw new Error('Network response was not ok')
  }
  const data = await response.json();
  return data;
}

export function useGoalStatistics(searchParams: SearchParamsGoalEntryDto) {
  return useQuery({
    queryKey: ['goalStatistics', searchParams],
    queryFn: () => fetchGoalStatisticsBySearchParams(searchParams),
  })
}

async function fetchGoalMonthlyAvgsBySearchParams(searchParams: SearchParamsGoalEntryDto): Promise<GoalMonthlyAveragesResponse> {
  const searchSegment = Object.entries(searchParams).map(([key, value]) => {
    return `${key}=${value}`
  }).join('&');
  const response = await fetch(`${BACKEND_BASE_URL}/goalEntries/monthly-averages?${searchSegment}`);
  if (!response.ok) {
    console.log("response status", response.status);
    throw new Error('Network response was not ok')
  }
  const data = await response.json();
  return data;
}

export function useGoalMonthlyAvgs(searchParams: SearchParamsGoalEntryDto) {
  return useQuery({
    queryKey: ['goalMonthlyAvgs', searchParams],
    queryFn: () => fetchGoalMonthlyAvgsBySearchParams(searchParams),
  })
}

