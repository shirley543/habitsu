import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGoalEntryDto, UpdateGoalEntryDto, GoalQuantifyType } from './goalEntries.dtos';
import { GoalQuantify, Prisma } from '@prisma/client';
// import { GoalQuantifyType } from '@habit-tracker/shared';

// // TODOss: Fix build error that's preventing habit-tracker/shared module from being pulled in
// enum GoalQuantifyType {
//   Numerical = 'NUMERICAL',
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
        case GoalQuantifyType.Numerical:
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
        case GoalQuantifyType.Numerical:
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
}
