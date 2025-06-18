import { Goal, GoalType } from '@prisma/client'
import prisma from '../prisma/prisma';
import { fetchUserById } from './userService';

export async function fetchAllGoals(orderBy?: string, order?: string, search?: string): Promise<Goal[]> {
  return prisma.goal.findMany({
    where: search
      ? {
          OR: [
            { title: { contains: String(search), mode: 'insensitive' } },
            { description: { contains: String(search), mode: 'insensitive' } },
          ],
        }
      : undefined,
    include: { user: true },
    orderBy: { [orderBy as string]: order },
  });
}

export async function fetchGoalById(id: number): Promise<Goal | null> {
  return prisma.goal.findUnique({
    where: { id },
  })
}

export async function registerNewNumericGoal(data: {
  title: string,
  description: string,
  colour: string,
  public: boolean,
  numericTarget: number,
  numericUnit: string,
  userId: number,
}): Promise<Goal> {
  const user = await fetchUserById(data.userId);
  if (!user) {
    throw new Error('User not found');
  }

  return prisma.goal.create({
    data: {
      title: data.title,
      description: data.description,
      colour: data.colour,
      public: data.public,
      goalType: GoalType.NUMERIC,
      numericTarget: data.numericTarget,
      numericUnit: data.numericUnit,
      userId: data.userId,
    }
  })
}

export async function registerNewBooleanGoal(data: {
  title: string,
  description: string,
  colour: string,
  public: boolean,
  userId: number,
}): Promise<Goal> {
  const user = await fetchUserById(data.userId);
  if (!user) {
    throw new Error('User not found');
  }

  return prisma.goal.create({
    data: {
      title: data.title,
      description: data.description,
      colour: data.colour,
      public: data.public,
      goalType: GoalType.BOOLEAN,
      userId: data.userId,
    }
  })
}

// TODOs: updateGoal, deleteGoal