import type { GoalResponse } from "@habit-tracker/shared";
import { useQuery } from "@tanstack/react-query";

const BACKEND_BASE_URL = "http://localhost:8080";

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
  const response = await fetch(`${BACKEND_BASE_URL}/goals/${goalId}`);
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
