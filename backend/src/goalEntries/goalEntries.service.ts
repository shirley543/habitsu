import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGoalEntryDto, UpdateGoalEntryDto, GoalQuantifyType, SearchParamsGoalEntryDto, GoalMonthlyAveragesResponse, GoalStatisticsSchema, GoalMonthlyAveragesSchema } from './goalEntries.dtos';
import { GoalQuantify, Prisma } from '@prisma/client';
// import { GoalQuantifyType } from '@habit-tracker/shared';

// // TODOss: Fix build error that's preventing habit-tracker/shared module from being pulled in
// enum GoalQuantifyType {
//   Numeric = 'NUMERICAL',
//   Boolean = 'BOOLEAN',
// }

@Injectable()
export class GoalEntriesService {
  constructor(private prisma: PrismaService) {}

  create(createGoalEntryDto: CreateGoalEntryDto) {
    const goalId = 1; //< TODOs: Address this hack, goal ID should be provided by DTO or endpoint design/ param
    const prismaInput = (() => {
      const baseGoalEntry: Prisma.GoalEntryCreateInput = {
        entryDate: createGoalEntryDto.entryDate,
        note: createGoalEntryDto.note,
        goal: {
          connect: { id: goalId }
        }
      }
      switch (createGoalEntryDto.goalType) {
        case GoalQuantifyType.Boolean:
        default:
          return {
            ...baseGoalEntry,
            booleanValue: createGoalEntryDto.booleanValue,
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

  update(id: number, updateGoalEntryDto: UpdateGoalEntryDto) {
    const prismaInput = (() => {
      const baseGoalEntry: Prisma.GoalEntryUpdateInput = {
        entryDate: updateGoalEntryDto.entryDate,
        note: updateGoalEntryDto.note,
      }
      switch (updateGoalEntryDto.goalType) {
        case GoalQuantifyType.Boolean:
        default:
          return {
            ...baseGoalEntry,
            booleanValue: updateGoalEntryDto.booleanValue,
          };
        case GoalQuantifyType.Numeric:
          return {
            ...baseGoalEntry,
            numericValue: updateGoalEntryDto.numericValue,
          }
      }
    })();

    return this.prisma.goalEntry.update({
      where: { id },
      data: prismaInput,
    });
  }

  remove(id: number) {
    return this.prisma.goalEntry.delete({ where: { id } });
  }

  /**
   * Statistics-specific
   */
  async getStatistics(goalId: number, year: number) {
    // Note: casting to INT as default without is BIGINT
    // To determine if worth updating types of SQL function params to BIGINT instead of INT
    // TODOs: look into changing $queryRaw call to use $queryRawTyped https://www.prisma.io/blog/announcing-typedsql-make-your-raw-sql-queries-type-safe-with-prisma-orm
    const [rawResult] = await this.prisma.$queryRaw<any[]>`SELECT * FROM get_numeric_stats(${goalId}::INT, ${year}::INT);`;
    console.log(rawResult)
    const stats = GoalStatisticsSchema.parse(rawResult);
    return stats;
  }

  async getMonthlyAverages(goalId: number, year: number) {
    // TODOs: as above for changing $queryRaw call
    const rawResults = await this.prisma.$queryRaw<any[]>`SELECT * FROM get_goal_year_monthly_avgs(${goalId}::INT, ${year}::INT);`;
    const monthlyAverages = GoalMonthlyAveragesSchema.parse(rawResults);
    return monthlyAverages;
  }
}
