import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateGoalDto,
  ReorderGoalDto,
  UpdateGoalDto,
} from '@habit-tracker/validation-schemas';
import {
  GoalPublicity,
  GoalQuantify,
  Prisma,
  ProfilePublicity,
} from '@prisma/client';
import { UsersService } from 'src/users/users.service';
import {
  assertCanModify,
  assertCanView,
  assertFound,
} from 'src/common/assert/assertions';
import { GoalQuantifyType } from '@habit-tracker/validation-schemas';

@Injectable()
export class GoalsService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async create(createGoalDto: CreateGoalDto, userId: number) {
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

    return this.prisma.goal.create({ data: prismaInput });
  }

  async findAll(userId: number) {
    return this.prisma.goal.findMany({ where: { userId } });
  }

  async findManyByUsername(targetUsername: string, requestingUserId: number) {
    // Fetch user to get their userId
    const user = await this.prisma.user.findUnique({
      where: { username: targetUsername },
    });
    assertFound(user, 'User not found');

    const isOwner = requestingUserId === user.id;
    const goals = await this.prisma.goal.findMany({
      where: {
        userId: user.id,
        // If owner, no publicity filter; otherwise only public goals
        ...(isOwner ? {} : { publicity: GoalPublicity.PUBLIC }),
      },
    });

    return goals;
  }

  async findOne(id: number, userId: number) {
    return this.prisma.goal.findUniqueOrThrow({ where: { id, userId } });
  }

  async update(id: number, updateGoalDto: UpdateGoalDto, userId: number) {
    // Find goal to update and validate ownership
    const goalToUpdate = await this.prisma.goal.findUniqueOrThrow({
      where: { id },
    });
    assertFound(goalToUpdate);
    assertCanModify(goalToUpdate, userId);

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

  async remove(id: number, userId: number) {
    // Find goal to delete and validate ownership
    const goalToDelete = await this.prisma.goal.findUniqueOrThrow({
      where: { id },
    });
    assertFound(goalToDelete);
    assertCanModify(goalToDelete, userId);

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

  async reorder(reorderGoalDto: ReorderGoalDto, userId: number) {
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
      throw new BadRequestException(
        'Bad Request: Reorder goals length does not match goals length',
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
      throw new BadRequestException('Bad Request: Invalid Goal IDs');
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
      throw new BadRequestException('Bad Request: Invalid Goal Orders');
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
