/**
 * Shared types between Lambda functions for reminder feature
 */

export interface DueGoalMessage {
  userId: number;
  userEmail: string;
  goalId: number;
  goalTitle: string;
}
