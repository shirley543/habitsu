import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGoalDto, UpdateGoalDto } from './goals.dtos';
import { GoalQuantify, Prisma } from '@prisma/client';
// import { GoalQuantifyType } from '@habit-tracker/shared';

// TODOss: Fix build error that's preventing habit-tracker/shared module from being pulled in
enum GoalQuantifyType {
  Numeric = 'NUMERIC',
  Boolean = 'BOOLEAN',
}

@Injectable()
export class GoalsService {
  constructor(private prisma: PrismaService) {}

  async create(createGoalDto: CreateGoalDto) {
    const userId = 4; //< TODOs: Address this hack, user ID should derived from JWT/ session
    // TODOss error handling when user ID is not valid/ not found.

    // Ordering: get current maximum order number for the user's goals,
    // and use to determine their new goal's order number
    const maxOrderNum = await this.prisma.goal.aggregate({
      _max: {
        order: true,
      },
      where: {
        userId: userId,
      }
    });
    const nextOrderNum = maxOrderNum._max.order ? maxOrderNum._max.order + 1 : 1;

    const prismaInput = (() => {
      const baseGoal: Prisma.GoalCreateInput = {
        title: createGoalDto.title,
        description: createGoalDto.description,
        colour: createGoalDto.colour,
        icon: createGoalDto.icon,
        publicity: createGoalDto.publicity,
        goalType: createGoalDto.goalType as GoalQuantify,
        order: nextOrderNum,
        user: {
          connect: { id: userId }
        }
      }
      switch (createGoalDto.goalType) {
        case GoalQuantifyType.Boolean:
        default:
          return {...baseGoal};
        case GoalQuantifyType.Numeric:
          return {
            ...baseGoal,
            numericTarget: createGoalDto.numericTarget,
            numericUnit: createGoalDto.numericUnit,
          }
      }
    })();

    return this.prisma.goal.create({ data: prismaInput });
  }

  findAll() {
    return this.prisma.goal.findMany();
  }

  findOne(id: number) {
    return this.prisma.goal.findUniqueOrThrow({ where: { id } });
  }

  update(id: number, updateGoalDto: UpdateGoalDto) {
    const prismaInput = (() => {
      const baseGoal: Prisma.GoalUpdateInput = {
        title: updateGoalDto.title,
        description: updateGoalDto.description,
        colour: updateGoalDto.colour,
        icon: updateGoalDto.icon,
        publicity: updateGoalDto.publicity,
        goalType: updateGoalDto.goalType as GoalQuantify,
        visibility: updateGoalDto.visibility,
      }
      switch (updateGoalDto.goalType) {
        case GoalQuantifyType.Boolean:
        default:
          return {...baseGoal};
        case GoalQuantifyType.Numeric:
          return {
            ...baseGoal,
            numericTarget: updateGoalDto.numericTarget,
            numericUnit: updateGoalDto.numericUnit,
          }
      }
    })();

    return this.prisma.goal.update({
      where: { id },
      data: prismaInput,
    });
  }

  async remove(id: number) {
    const userId = 4; //< TODOs: Address this hack, user ID should derived from JWT/ session
    // TODOss error handling when user ID is not valid/ not found.

    // Find goal to delete and validate ownership
    const goalToDelete = await this.prisma.goal.findUniqueOrThrow({
      where: { id }
    });

    if (goalToDelete.userId !== userId) {
      throw new Error('Unauthorized: Goal does not belong to user');
    }

    // Start transaction, so that if any fail entire batch is rolled back,
    // to prevent e.g. delete failing but previous order updates
    // were already completed
    return await this.prisma.$transaction(async (tx) => {
      // Ordering: determine goals to update based on 
      // current goal being removed (e.g. goal with order 4 being removed, 
      // hence goal with order 5 becomes 4, 6 becomes 5, etc)

      // Get goals with order greater than goal to delete's order
      const goalsToUpdate = await tx.goal.findMany({
        where: {
          userId,
          order: {
            gt: goalToDelete.order,
          }
        },
        orderBy: { order: 'asc' }
      });

      // Update each goal's order by decreasing by one
      for (const goal of goalsToUpdate) {
        await tx.goal.update({
          where: { id: goal.id },
          data: { order: goal.order - 1 }
        })
      }

      // Delete the goal
      return tx.goal.delete({ where: { id }})
    });
  }
}
