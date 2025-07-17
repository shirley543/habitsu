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

  create(createGoalDto: CreateGoalDto) {
    const userId = 4; //< TODOs: Address this hack, user ID should derived from JWT/ session
    // TODOss error handling when user ID is not valid/ not found.

    const prismaInput = (() => {
      const baseGoal: Prisma.GoalCreateInput = {
        title: createGoalDto.title,
        description: createGoalDto.description,
        colour: createGoalDto.colour,
        icon: createGoalDto.icon,
        publicity: createGoalDto.publicity,
        goalType: createGoalDto.goalType as GoalQuantify,
        visibility: true,
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

  remove(id: number) {
    return this.prisma.goal.delete({ where: { id } });
  }
}
