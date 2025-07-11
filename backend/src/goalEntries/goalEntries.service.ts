import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
} from './goalEntries.dtos';
import { GoalQuantify, Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { GoalsService } from 'src/goals/goals.service';
// import { GoalQuantifyType } from '@habit-tracker/shared';

// // TODOss: Fix build error that's preventing habit-tracker/shared module from being pulled in
// enum GoalQuantifyType {
//   Numeric = 'NUMERIC',
//   Boolean = 'BOOLEAN',
// }

@Injectable()
export class GoalEntriesService {
  constructor(private prisma: PrismaService,
    private goalsService: GoalsService,
  ) {}

  async create(goalId: number, createGoalEntryDto: CreateGoalEntryDto) {
    const goal = await this.goalsService.findOne(goalId);
    if (!goal) {
      throw new NotFoundException("Goal not found for the given goal ID");
    }

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

  findAll() {
    return this.prisma.goalEntry.findMany();
  }

  findMany(searchParamsGoalEntryDto: SearchParamsGoalEntryDto) {
    const year = searchParamsGoalEntryDto.year;
    const goalId = searchParamsGoalEntryDto.goalId;

    return this.prisma.goalEntry.findMany({
      where: {
        goalId: goalId,
        entryDate: {
          lte: year ? new Date(year, 11, 31) : undefined,
          gte: year ? new Date(year, 0, 1) : undefined,
        }
      }
    })
  }

  findOne(id: number) {
    return this.prisma.goalEntry.findUnique({ where: { id } });
  }

  async update(goalId: number, entryId: number, updateGoalEntryDto: UpdateGoalEntryDto) {
    const goal = await this.goalsService.findOne(goalId);
    if (!goal) {
      throw new NotFoundException("Goal not found for the given goal ID");
    }

    const entry = await this.prisma.goalEntry.findUnique({
      where: {
        goalId: goalId,
        id: entryId,
      }
    });
    if (!entry) {
      throw new NotFoundException("Entry not found for this goal");
    }

    const prismaInput = (() => {
      const baseGoalEntry: Prisma.GoalEntryUpdateInput = {
        entryDate: updateGoalEntryDto.entryDate,
        note: updateGoalEntryDto.note,
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

  async remove(goalId: number, entryId: number) {
    const entry = await this.prisma.goalEntry.findUnique({
      where: {
        goalId: goalId,
        id: entryId,
      }
    });
    if (!entry) {
      throw new NotFoundException("Entry not found for this goal");
    }

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
  async getStatistics(goalId: number, year: number) {
    // Note: casting to INT as default without is BIGINT
    // To determine if worth updating types of SQL function params to BIGINT instead of INT
    // TODOs: look into changing $queryRaw call to use $queryRawTyped https://www.prisma.io/blog/announcing-typedsql-make-your-raw-sql-queries-type-safe-with-prisma-orm
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

  async getMonthlyAverages(goalId: number, year: number) {
    const goal = await this.goalsService.findOne(goalId);
    if (goal.goalType !== GoalQuantify.NUMERIC) {
      throw new BadRequestException("Goal type must be NUMERIC")
    }
    
    // TODOs: as above for changing $queryRaw call
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

  async getMonthlyCounts(goalId: number, year: number) {
    // TODOs: as above for changing $queryRaw call
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
