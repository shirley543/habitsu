import { Request, Response } from "express";
import { fetchAllGoals, registerNewBooleanGoal, registerNewNumericGoal } from "../services/goalService";
import { GoalType } from "@prisma/client";

export async function handleGetGoals(req: Request, res: Response) {
  const { orderBy = 'id', order = 'asc', search } = req.query;

  const goals = await fetchAllGoals(orderBy as string, order as string, search as string);
  res.json(goals);
  // TODOs: error-handling, e.g. query params invalid
  // res.status(400).json({ error: 'Invalid query' });
}

export async function handleCreateGoal(req: Request, res: Response) {
  const { 
    goalType, 
    title, 
    description, 
    colour, 
    isPublic, 
    numericTarget, 
    numericUnit, 
    userId
  } = req.body;
  
  function isValidGoalType(goalType: any): goalType is GoalType {
    return Object.values(GoalType).includes(goalType);
  }

  // TODOs: replace with zod schema validation of goal type
  // Should also be checking for presence of title, description (optional), colour, public (default to false),
  // numeric target + unit if numeric goal, user ID
  if (!isValidGoalType(goalType)) {
    res.status(400).json({ message: 'Invalid goal type' });
  }

  let newGoal;
  switch (goalType) {
    case GoalType.BOOLEAN:
      {
        newGoal = await registerNewBooleanGoal({
          title: title,
          description: description,
          colour: colour,
          public: isPublic, // TODOs update Prisma schema field name to isPublic for consistency
          userId: userId,
        });
        break;
      }

    case GoalType.NUMERIC:
      {
        newGoal = await registerNewNumericGoal({
          title: title,
          description: description,
          colour: colour,
          public: isPublic, // TODOs update Prisma schema field name to isPublic for consistency
          numericTarget: numericTarget,
          numericUnit: numericUnit,
          userId: userId,
        });
      }
  }

  res.status(201).json(newGoal);
  // TODOs: error handling, e.g. email must be unique
}
