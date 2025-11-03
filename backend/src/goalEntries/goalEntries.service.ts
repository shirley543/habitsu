import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateGoalEntryDto,
  UpdateGoalEntryDto,
  GoalQuantifyType,
  SearchParamsGoalEntryDto,
  GoalStatisticsReponse,
  GoalMonthlyAveragesResponse,
  GoalMonthlyCountsResponse,
  GoalStatisticsSchema,
  GoalMonthlyAveragesSchema,
  GoalMonthlyCountsSchema,
} from '@habit-tracker/shared';
import { GoalQuantify, Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { GoalsService } from 'src/goals/goals.service';
import { assertCanModify, assertCanView, assertFound } from 'src/common/assert/assertions';


@Injectable()
export class GoalEntriesService {
  constructor(private prisma: PrismaService,
    private goalsService: GoalsService,
  ) {}

  async create(goalId: number, createGoalEntryDto: CreateGoalEntryDto, userId: number) {
    const goal = await this.goalsService.findOne(goalId, userId);
    assertFound(goal, 'Associated goal not found');
    assertCanModify(goal, userId); // Only goal owner can create a goal entry for the given goal

    const prismaInput = (() => {
      const baseGoalEntry: Prisma.GoalEntryCreateInput = {
        entryDate: createGoalEntryDto.entryDate,
        note: createGoalEntryDto.note,
        goal: {
          connect: { id: goalId }
        }
      }
      switch (goal.goalType) {
        case GoalQuantifyType.Boolean:
        default:
          return {
            ...baseGoalEntry,
          };
        case GoalQuantifyType.Numeric:
          return {
            ...baseGoalEntry,
            numericValue: createGoalEntryDto.numericValue,
          }
      }
    })();

    return this.prisma.goalEntry.create({ data: prismaInput });
  }

  async findAll(userId: number) {
    return this.prisma.goalEntry.findMany({
      where: { 
        goal: {
          userId: userId,
        }
      }
    });
  }

  async findMany(searchParamsGoalEntryDto: SearchParamsGoalEntryDto, currentUserId: number) {
    const goalId = searchParamsGoalEntryDto.goalId;
    const year = searchParamsGoalEntryDto.year;

    const goal = await this.prisma.goal.findUnique({
      where: { id: goalId },
      select: { userId: true, publicity: true },
    });
    assertFound(goal, 'Goal not found');
    assertCanView(goal, currentUserId, 'Goal, and thus goal entries, not viewable (unauthorized)');

    const entries = await this.prisma.goalEntry.findMany({
      where: {
        goalId: goalId,
        entryDate: {
          lte: year ? new Date(year, 11, 31) : undefined,
          gte: year ? new Date(year, 0, 1) : undefined,
        },
      },
    });

    return entries;
  }

  async findOne(id: number, userId: number) {
    const entry = await this.prisma.goalEntry.findUnique({
      where: { id },
      include: {
        goal: {
          select: {
            userId: true,
            publicity: true,
          },
        },
      },
    });
    assertFound(entry, 'Goal entry not found');
    assertFound(entry.goal, 'Associated goal not found');
    assertCanView(entry.goal, userId, 'Associated goal not viewable (unauthorized)');

    return entry;
  }

  async update(goalId: number, entryId: number, updateGoalEntryDto: UpdateGoalEntryDto, userId: number) {
    const entry = await this.prisma.goalEntry.findUnique({
      where: {
        goalId: goalId,
        id: entryId,
      },
      include: {
        goal: {
          select: {
            userId: true,
            publicity: true,
            goalType: true,
          },
        },
      },
    });
    assertFound(entry, 'Goal entry not found');
    assertFound(entry.goal, 'Associated goal not found');
    assertCanModify(entry.goal, userId); // Only owner can modify (edit)

    const prismaInput = (() => {
      const baseGoalEntry: Prisma.GoalEntryUpdateInput = {
        entryDate: updateGoalEntryDto.entryDate,
        note: updateGoalEntryDto.note,
      }
      switch (entry.goal.goalType) {
        case GoalQuantifyType.Boolean:
        default:
          return {
            ...baseGoalEntry,
          };
        case GoalQuantifyType.Numeric:
          return {
            ...baseGoalEntry,
            numericValue: updateGoalEntryDto.numericValue,
          }
      }
    })();

    return this.prisma.goalEntry.update({
      where: { 
        id: entryId,
      },
      data: prismaInput,
    });
  }

  async remove(goalId: number, entryId: number, userId: number) {
    const entry = await this.prisma.goalEntry.findUnique({
      where: {
        goalId: goalId,
        id: entryId,
      },
      include: {
        goal: {
          select: {
            userId: true,
            goalType: true,
          },
        },
      },
    });

    assertFound(entry, 'Goal entry not found');
    assertFound(entry.goal, 'Associated goal not found');
    assertCanModify(entry.goal, userId); // Only owner can modify (delete)

    return this.prisma.goalEntry.delete({ 
      where: { 
        id: entryId
      }
    });
  }

  /**
   * Private functions
   */

  private convertDecimalToNumber = (value: any) => {
    return value instanceof Decimal ? value.toNumber() : value;
  }

  /**
   * Statistics-specific
   */
  async getStatistics(goalId: number, year: number, userId: number) {
    // Validate ownership. If goal is private, only the goal's owner can view.
    // if goal is public, any user can view it (and including any derived data e.g. statistics of it)
    const goal = await this.prisma.goal.findUnique({
      where: { id: goalId },
    });
    assertFound(goal, 'Goal not found');
    assertCanView(goal, userId, 'Goal not viewable (unauthorized)');

    // Note: casting to INT as default without is BIGINT
    // To determine if worth updating types of SQL function params to BIGINT instead of INT

    // TODOs #33: look into changing $queryRaw call to use $queryRawTyped https://www.prisma.io/blog/announcing-typedsql-make-your-raw-sql-queries-type-safe-with-prisma-orm
    const [rawResult] = await this.prisma.$queryRaw<any[]>`SELECT * FROM get_summary_stats(${goalId}::INT, ${year}::INT);`;

    // Convert Prisma Decimal fields to JS numbers
    const numberResult: GoalStatisticsReponse = {
      yearAvg: this.convertDecimalToNumber(rawResult.yearAvg),
      yearCount: this.convertDecimalToNumber(rawResult.yearCount),
      currentStreakLen: this.convertDecimalToNumber(rawResult.currentStreakLen),
      maxStreakLen: this.convertDecimalToNumber(rawResult.maxStreakLen),
    };

    const stats = GoalStatisticsSchema.parse(numberResult);
    return stats;
  }

  async getMonthlyAverages(goalId: number, year: number, userId: number) {
    // Validate ownership. If goal is private, only the goal's owner can view.
    // if goal is public, any user can view it (and including any derived data e.g. statistics of it)
    const goal = await this.prisma.goal.findUnique({
      where: { id: goalId },
    });
    assertFound(goal, 'Goal not found');
    assertCanView(goal, userId, 'Goal not viewable (unauthorized)');

    if (goal.goalType !== GoalQuantify.NUMERIC) {
      throw new BadRequestException("Goal type must be NUMERIC")
    }
    
    // TODOs #33: as above for changing $queryRaw call
    const rawResults = await this.prisma.$queryRaw<any[]>`SELECT * FROM get_goal_year_monthly_avgs(${goalId}::INT, ${year}::INT);`;

    // Convert Prisma Decimal fields to JS numbers
    const numberResults: GoalMonthlyAveragesResponse = rawResults.map((item) => {
      return {
        year: this.convertDecimalToNumber(item.year),
        month: this.convertDecimalToNumber(item.month),
        average: this.convertDecimalToNumber(item.average),
      }
    })

    const stats = GoalMonthlyAveragesSchema.parse(numberResults);
    return stats;
  }

  async getMonthlyCounts(goalId: number, year: number, userId: number) {
    // Validate ownership. If goal is private, only the goal's owner can view.
    // if goal is public, any user can view it (and including any derived data e.g. statistics of it)
    const goal = await this.prisma.goal.findUnique({
      where: { id: goalId },
    });
    assertFound(goal, 'Goal not found');
    assertCanView(goal, userId, 'Goal not viewable (unauthorized)');

    // TODOs #33: as above for changing $queryRaw call
    const rawResults = await this.prisma.$queryRaw<any[]>`SELECT * FROM get_goal_year_monthly_counts(${goalId}::INT, ${year}::INT);`;

    // Convert Prisma Decimal fields to JS numbers
    const numberResults: GoalMonthlyCountsResponse = rawResults.map((item) => {
      return {
        year: this.convertDecimalToNumber(item.year),
        month: this.convertDecimalToNumber(item.month),
        count: this.convertDecimalToNumber(item.count),
      }
    })

    const stats = GoalMonthlyCountsSchema.parse(numberResults);
    return stats;
  }
}
