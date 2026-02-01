import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateGoalDto,
  ReorderGoalDto,
  UpdateGoalDto,
} from '@habit-tracker/validation-schemas';
import { Goal, GoalPublicity, GoalQuantify, Prisma } from '@prisma/client';
import { UsersService } from 'src/users/users.service';
import { GoalQuantifyType } from '@habit-tracker/validation-schemas';
import {
  assertGoalCanModify,
  assertGoalCanView,
  assertGoalFound,
} from './errors/goalAssertions';
import { assertUserFound } from 'src/users/errors/userAssertions';
import { GoalReorderInputInvalidError } from './errors/goalReorderInputInvalid.error';

@Injectable()
export class GoalsService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async create(createGoalDto: CreateGoalDto, userId: number): Promise<Goal> {
    // Validate user exists
    const user = await this.usersService.findOne(userId);
    assertUserFound(user, userId);

    // Ordering: get current maximum order number for the user's goals,
    // and use to determine their new goal's order number
    const maxOrderNum = await this.prisma.goal.aggregate({
      _max: {
        order: true,
      },
      where: {
        userId: userId,
      },
    });
    const nextOrderNum = maxOrderNum._max.order
      ? maxOrderNum._max.order + 1
      : 1;

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
          connect: { id: userId },
        },
      };
      switch (createGoalDto.goalType) {
        case GoalQuantifyType.Boolean:
        default:
          return { ...baseGoal };
        case GoalQuantifyType.Numeric:
          return {
            ...baseGoal,
            numericTarget: createGoalDto.numericTarget,
            numericUnit: createGoalDto.numericUnit,
          };
      }
    })();

    return await this.prisma.goal.create({ data: prismaInput });

    // try {
    //   return await this.prisma.goal.create({ data: prismaInput });
    // } catch (err) {
    //   // Prisma will throw if user does not exist (foreign key violation)
    //   if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
    //     throw new Error(`User ${userId} not found`); // domain-level error, replace with UserNotFoundError if defined
    //   }
    //   throw err;
    // }
  }

  async findAll(userId: number): Promise<Goal[]> {
    return this.prisma.goal.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
    });
  }

  async findManyByUsername(targetUsername: string, requestingUserId: number): Promise<Goal[]> {
    // Fetch user to get their userId
    const user = await this.prisma.user.findUnique({
      where: { username: targetUsername },
    });
    assertUserFound(user, targetUsername);

    const isOwner = requestingUserId === user.id;
    const goals = await this.prisma.goal.findMany({
      where: {
        userId: user.id,
        // If owner, no publicity filter; otherwise only public goals
        ...(isOwner ? {} : { publicity: GoalPublicity.PUBLIC }),
      },
      orderBy: { order: 'asc' },
    });

    return goals;
  }

  async findOne(id: number, userId: number): Promise<Goal> {
    const goal = await this.prisma.goal.findUnique({ where: { id } });
    assertGoalFound(goal, id);
    assertGoalCanView(goal, userId);

    return goal;
  }

  async update(id: number, updateGoalDto: UpdateGoalDto, userId: number): Promise<Goal> {
    // Find goal to update and validate ownership
    const goalToUpdate = await this.prisma.goal.findUnique({
      where: { id },
    });
    assertGoalFound(goalToUpdate, id);
    assertGoalCanModify(goalToUpdate, userId);

    const prismaInput = (() => {
      const baseGoal: Prisma.GoalUpdateInput = {
        title: updateGoalDto.title,
        description: updateGoalDto.description,
        colour: updateGoalDto.colour,
        icon: updateGoalDto.icon,
        publicity: updateGoalDto.publicity,
        goalType: updateGoalDto.goalType as GoalQuantify,
        visibility: updateGoalDto.visibility,
      };
      switch (updateGoalDto.goalType) {
        case GoalQuantifyType.Boolean:
        default:
          return { ...baseGoal };
        case GoalQuantifyType.Numeric:
          return {
            ...baseGoal,
            numericTarget: updateGoalDto.numericTarget,
            numericUnit: updateGoalDto.numericUnit,
          };
      }
    })();

    return this.prisma.goal.update({
      where: { id },
      data: prismaInput,
    });
  }

  async remove(id: number, userId: number): Promise<Goal> {
    return await this.prisma.$transaction(async (tx) => {
      const goalToDelete = await tx.goal.findUnique({ where: { id } });
      assertGoalFound(goalToDelete, id);
      assertGoalCanModify(goalToDelete, userId);

      // Get goals with order greater than goal being deleted
      const goalsToUpdate = await tx.goal.findMany({
        where: {
          userId,
          order: {
            gt: goalToDelete.order,
          },
        },
        orderBy: { order: 'asc' },
      });

      // Update each goal's order by decreasing by one
      for (const goal of goalsToUpdate) {
        await tx.goal.update({
          where: { id: goal.id },
          data: { order: goal.order - 1 },
        });
      }

      // Delete the goal
      return tx.goal.delete({ where: { id } });
    });
  }

  async reorder(reorderGoalDto: ReorderGoalDto, userId: number): Promise<void> {
    // Expect all goals to be present (lengths same)
    // Expect all IDs present
    // Expect orders to be sequential (i.e. no gaps)
    const usersGoals = await this.prisma.goal.findMany({
      where: { userId },
      orderBy: {
        id: 'asc',
      },
    });

    if (usersGoals.length !== reorderGoalDto.length) {
      throw new GoalReorderInputInvalidError(
        'Reorder goals length does not match goals length',
      );
    }

    // Check IDs to reorder are the same as in users (existing) goals
    // Note: ordering starts at 1
    const usersGoalIds = usersGoals
      .map((goal) => goal.id)
      .sort((a, b) => a - b);
    const reorderGoalIds = reorderGoalDto
      .map((entry) => entry.id)
      .sort((a, b) => a - b);
    const areIdsEqual = (() => {
      for (let i = 0; i < usersGoalIds.length; i++) {
        if (usersGoalIds[i] !== reorderGoalIds[i]) {
          return false;
        }
      }
      return true;
    })();

    if (!areIdsEqual) {
      throw new GoalReorderInputInvalidError('Invalid Goal IDs');
    }

    // Check orders are sequential
    const reorderOrders = reorderGoalDto
      .map((entry) => entry.order)
      .sort((a, b) => a - b);
    const areOrdersSequential = (() => {
      if (reorderOrders.length === 1) {
        return true;
      }
      for (let i = 1; i < reorderOrders.length; i++) {
        if (reorderOrders[i] - reorderOrders[i - 1] !== 1) {
          return false;
        }
      }
      return true;
    })();

    if (!areOrdersSequential) {
      throw new GoalReorderInputInvalidError('Invalid Goal Orders');
    }

    // Use transaction to update order of all given entries
    // Future work: Potentially evaluate performance of this:
    //              Prisma does not allow for bulk `updateMany` across different IDs.
    //              To see if raw SQL could be faster.
    return await this.prisma.$transaction(async (tx) => {
      for (const entry of reorderGoalDto) {
        await tx.goal.update({
          where: { id: entry.id },
          data: { order: entry.order },
        });
      }
    });
  }
}
