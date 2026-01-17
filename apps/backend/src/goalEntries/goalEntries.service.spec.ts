import { Test, TestingModule } from '@nestjs/testing';
import { GoalEntriesService } from './goalEntries.service';
import { PrismaService } from '../prisma/prisma.service';
import { GoalsService } from '../goals/goals.service';
import {
  CreateGoalEntryDto,
  UpdateGoalEntryDto,
  SearchParamsGoalEntryDto,
} from '@habit-tracker/validation-schemas';
import { GoalPublicity, GoalQuantify } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';

describe('GoalEntriesService', () => {
  let service: GoalEntriesService;
  let prismaService: jest.Mocked<PrismaService>;
  let goalsService: jest.Mocked<GoalsService>;

  const mockGoal = {
    id: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    title: 'Test Goal',
    description: 'Test Description',
    colour: 'FF5733',
    icon: 'heart',
    publicity: GoalPublicity.PRIVATE,
    goalType: GoalQuantify.BOOLEAN,
    numericTarget: null,
    numericUnit: null,
    userId: 1,
    visibility: true,
    order: 1,
  };

  const mockNumericGoal = {
    ...mockGoal,
    id: 2,
    title: 'Numeric Goal',
    goalType: GoalQuantify.NUMERIC,
    numericTarget: 100,
    numericUnit: 'km',
  };

  const mockGoalEntry = {
    id: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    entryDate: new Date('2025-01-15'),
    goalId: 1,
    numericValue: null,
    booleanValue: null,
    note: 'Test entry',
  };

  const mockNumericGoalEntry = {
    id: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
    entryDate: new Date('2025-01-15'),
    goalId: 2,
    numericValue: 50,
    booleanValue: null,
    note: 'Numeric entry',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoalEntriesService,
        {
          provide: PrismaService,
          useValue: {
            goalEntry: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            goal: {
              findUnique: jest.fn(),
            },
            $queryRaw: jest.fn(),
          },
        },
        {
          provide: GoalsService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GoalEntriesService>(GoalEntriesService);
    prismaService = module.get(PrismaService) as jest.Mocked<PrismaService>;
    goalsService = module.get(GoalsService) as jest.Mocked<GoalsService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a boolean goal entry', async () => {
      const createGoalEntryDto: CreateGoalEntryDto = {
        entryDate: new Date('2025-01-15'),
        note: 'Test entry',
      };

      goalsService.findOne.mockResolvedValue(mockGoal as any);
      prismaService.goalEntry.create.mockResolvedValue(mockGoalEntry as any);

      const result = await service.create(1, createGoalEntryDto, 1);

      expect(result).toEqual(mockGoalEntry);
      expect(goalsService.findOne).toHaveBeenCalledWith(1, 1);
      expect(prismaService.goalEntry.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          entryDate: createGoalEntryDto.entryDate,
          note: 'Test entry',
          goal: { connect: { id: 1 } },
        }),
      });
    });

    it('should create a numeric goal entry with value', async () => {
      const createGoalEntryDto: CreateGoalEntryDto = {
        entryDate: new Date('2025-01-15'),
        note: 'Numeric entry',
        numericValue: 50,
      };

      goalsService.findOne.mockResolvedValue(mockNumericGoal as any);
      prismaService.goalEntry.create.mockResolvedValue(mockNumericGoalEntry as any);

      const result = await service.create(2, createGoalEntryDto, 1);

      expect(result).toEqual(mockNumericGoalEntry);
      expect(prismaService.goalEntry.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          entryDate: createGoalEntryDto.entryDate,
          numericValue: 50,
        }),
      });
    });

    it('should throw error when goal not found', async () => {
      const createGoalEntryDto: CreateGoalEntryDto = {
        entryDate: new Date('2025-01-15'),
        note: 'Test',
      };

      goalsService.findOne.mockRejectedValue(new Error('Goal not found'));

      await expect(
        service.create(999, createGoalEntryDto, 1),
      ).rejects.toThrow();
    });

    it('should throw error when user does not own the goal', async () => {
      const createGoalEntryDto: CreateGoalEntryDto = {
        entryDate: new Date('2025-01-15'),
        note: 'Test',
      };

      goalsService.findOne.mockResolvedValue(mockGoal as any);

      await expect(
        service.create(1, createGoalEntryDto, 999),
      ).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return all goal entries for a user', async () => {
      const mockEntries = [mockGoalEntry, mockNumericGoalEntry];
      prismaService.goalEntry.findMany.mockResolvedValue(mockEntries as any);

      const result = await service.findAll(1);

      expect(result).toEqual(mockEntries);
      expect(prismaService.goalEntry.findMany).toHaveBeenCalledWith({
        where: {
          goal: {
            userId: 1,
          },
        },
      });
    });

    it('should return empty array when user has no entries', async () => {
      prismaService.goalEntry.findMany.mockResolvedValue([]);

      const result = await service.findAll(1);

      expect(result).toEqual([]);
    });
  });

  describe('findMany', () => {
    it('should return goal entries filtered by goalId and year for goal owner', async () => {
      const searchParams: SearchParamsGoalEntryDto = {
        goalId: 1,
        year: 2025,
      };

      const mockEntries = [mockGoalEntry];

      prismaService.goal.findUnique.mockResolvedValue({
        userId: 1,
        publicity: GoalPublicity.PRIVATE,
      } as any);

      prismaService.goalEntry.findMany.mockResolvedValue(mockEntries as any);

      const result = await service.findMany(searchParams, 1);

      expect(result).toEqual(mockEntries);
      expect(prismaService.goalEntry.findMany).toHaveBeenCalledWith({
        where: {
          goalId: 1,
          entryDate: {
            lte: new Date(2025, 11, 31),
            gte: new Date(2025, 0, 1),
          },
        },
      });
    });

    it('should return goal entries without year filter', async () => {
      const searchParams: SearchParamsGoalEntryDto = {
        goalId: 1,
        year: undefined,
      };

      const mockEntries = [mockGoalEntry];

      prismaService.goal.findUnique.mockResolvedValue({
        userId: 1,
        publicity: GoalPublicity.PRIVATE,
      } as any);

      prismaService.goalEntry.findMany.mockResolvedValue(mockEntries as any);

      const result = await service.findMany(searchParams, 1);

      expect(result).toEqual(mockEntries);
      expect(prismaService.goalEntry.findMany).toHaveBeenCalledWith({
        where: {
          goalId: 1,
          entryDate: {
            lte: undefined,
            gte: undefined,
          },
        },
      });
    });

    it('should allow viewing public goal entries for other users', async () => {
      const searchParams: SearchParamsGoalEntryDto = {
        goalId: 1,
        year: 2025,
      };

      const mockEntries = [mockGoalEntry];

      prismaService.goal.findUnique.mockResolvedValue({
        userId: 2,
        publicity: GoalPublicity.PUBLIC,
      } as any);

      prismaService.goalEntry.findMany.mockResolvedValue(mockEntries as any);

      const result = await service.findMany(searchParams, 1);

      expect(result).toEqual(mockEntries);
    });

    it('should throw error when goal not found', async () => {
      const searchParams: SearchParamsGoalEntryDto = {
        goalId: 999,
        year: 2025,
      };

      prismaService.goal.findUnique.mockResolvedValue(null);

      await expect(
        service.findMany(searchParams, 1),
      ).rejects.toThrow();
    });

    it('should throw error when user cannot view private goal', async () => {
      const searchParams: SearchParamsGoalEntryDto = {
        goalId: 1,
        year: 2025,
      };

      prismaService.goal.findUnique.mockResolvedValue({
        userId: 2,
        publicity: GoalPublicity.PRIVATE,
      } as any);

      await expect(
        service.findMany(searchParams, 1),
      ).rejects.toThrow();
    });
  });

  describe('findOne', () => {
    it('should return a goal entry for goal owner', async () => {
      prismaService.goalEntry.findUnique.mockResolvedValue({
        ...mockGoalEntry,
        goal: { userId: 1, publicity: GoalPublicity.PRIVATE },
      } as any);

      const result = await service.findOne(1, 1);

      expect(result).toBeDefined();
      expect(prismaService.goalEntry.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          goal: {
            select: {
              userId: true,
              publicity: true,
            },
          },
        },
      });
    });

    it('should allow viewing public goal entry for other users', async () => {
      prismaService.goalEntry.findUnique.mockResolvedValue({
        ...mockGoalEntry,
        goal: { userId: 2, publicity: GoalPublicity.PUBLIC },
      } as any);

      const result = await service.findOne(1, 1);

      expect(result).toBeDefined();
    });

    it('should throw error when entry not found', async () => {
      prismaService.goalEntry.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999, 1)).rejects.toThrow();
    });

    it('should throw error when user cannot view private goal entry', async () => {
      prismaService.goalEntry.findUnique.mockResolvedValue({
        ...mockGoalEntry,
        goal: { userId: 2, publicity: GoalPublicity.PRIVATE },
      } as any);

      await expect(service.findOne(1, 1)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update a boolean goal entry', async () => {
      const updateGoalEntryDto: UpdateGoalEntryDto = {
        entryDate: new Date('2025-01-20'),
        note: 'Updated note',
      };

      const updatedEntry = { ...mockGoalEntry, ...updateGoalEntryDto };

      prismaService.goalEntry.findUnique.mockResolvedValue({
        ...mockGoalEntry,
        goal: { userId: 1, goalType: GoalQuantify.BOOLEAN },
      } as any);

      prismaService.goalEntry.update.mockResolvedValue(updatedEntry as any);

      const result = await service.update(1, 1, updateGoalEntryDto, 1);

      expect(result).toEqual(updatedEntry);
      expect(prismaService.goalEntry.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          entryDate: updateGoalEntryDto.entryDate,
          note: 'Updated note',
        }),
      });
    });

    it('should update a numeric goal entry with value', async () => {
      const updateGoalEntryDto: UpdateGoalEntryDto = {
        entryDate: new Date('2025-01-20'),
        note: 'Updated',
        numericValue: 75,
      };

      const updatedEntry = { ...mockNumericGoalEntry, ...updateGoalEntryDto };

      prismaService.goalEntry.findUnique.mockResolvedValue({
        ...mockNumericGoalEntry,
        goal: { userId: 1, goalType: GoalQuantify.NUMERIC },
      } as any);

      prismaService.goalEntry.update.mockResolvedValue(updatedEntry as any);

      const result = await service.update(2, 2, updateGoalEntryDto, 1);

      expect(result).toBeDefined();
      expect(prismaService.goalEntry.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: expect.objectContaining({
          numericValue: 75,
        }),
      });
    });

    it('should throw error when entry not found', async () => {
      const updateGoalEntryDto: UpdateGoalEntryDto = {
        entryDate: new Date('2025-01-20'),
        note: 'Updated',
      };

      prismaService.goalEntry.findUnique.mockResolvedValue(null);

      await expect(
        service.update(1, 999, updateGoalEntryDto, 1),
      ).rejects.toThrow();
    });

    it('should throw error when user does not own the goal', async () => {
      const updateGoalEntryDto: UpdateGoalEntryDto = {
        entryDate: new Date('2025-01-20'),
        note: 'Updated',
      };

      prismaService.goalEntry.findUnique.mockResolvedValue({
        ...mockGoalEntry,
        goal: { userId: 2, goalType: GoalQuantify.BOOLEAN },
      } as any);

      await expect(
        service.update(1, 1, updateGoalEntryDto, 1),
      ).rejects.toThrow();
    });
  });

  describe('remove', () => {
    it('should delete a goal entry', async () => {
      prismaService.goalEntry.findUnique.mockResolvedValue({
        ...mockGoalEntry,
        goal: { userId: 1, goalType: GoalQuantify.BOOLEAN },
      } as any);

      prismaService.goalEntry.delete.mockResolvedValue(mockGoalEntry as any);

      const result = await service.remove(1, 1, 1);

      expect(result).toEqual(mockGoalEntry);
      expect(prismaService.goalEntry.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw error when entry not found', async () => {
      prismaService.goalEntry.findUnique.mockResolvedValue(null);

      await expect(service.remove(1, 999, 1)).rejects.toThrow();
    });

    it('should throw error when user does not own the goal', async () => {
      prismaService.goalEntry.findUnique.mockResolvedValue({
        ...mockGoalEntry,
        goal: { userId: 2, goalType: GoalQuantify.BOOLEAN },
      } as any);

      await expect(service.remove(1, 1, 1)).rejects.toThrow();
    });
  });

  describe('getStatistics', () => {
    it('should return statistics for a goal owned by user', async () => {
      const mockStats = {
        yearAvg: 0.5,
        yearCount: 10,
        currentStreakLen: 3,
        maxStreakLen: 7,
      };

      prismaService.goal.findUnique.mockResolvedValue(mockGoal as any);
      (prismaService.$queryRaw as jest.Mock).mockResolvedValue([mockStats]);

      const result = await service.getStatistics(1, 2025, 1);

      expect(result).toBeDefined();
      expect(prismaService.goal.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should return statistics for public goal viewed by other user', async () => {
      const publicGoal = { ...mockGoal, publicity: GoalPublicity.PUBLIC };
      const mockStats = {
        yearAvg: 0.5,
        yearCount: 10,
        currentStreakLen: 3,
        maxStreakLen: 7,
      };

      prismaService.goal.findUnique.mockResolvedValue(publicGoal as any);
      (prismaService.$queryRaw as jest.Mock).mockResolvedValue([mockStats]);

      const result = await service.getStatistics(1, 2025, 2);

      expect(result).toBeDefined();
    });

    it('should throw error when goal not found', async () => {
      prismaService.goal.findUnique.mockResolvedValue(null);

      await expect(
        service.getStatistics(999, 2025, 1),
      ).rejects.toThrow();
    });

    it('should throw error when user cannot view private goal', async () => {
      prismaService.goal.findUnique.mockResolvedValue(mockGoal as any);

      await expect(
        service.getStatistics(1, 2025, 2),
      ).rejects.toThrow();
    });

    it('should convert Decimal values to numbers', async () => {
      const mockStats = {
        yearAvg: new Decimal('10.5'),
        yearCount: new Decimal('20'),
        currentStreakLen: new Decimal('5'),
        maxStreakLen: new Decimal('15'),
      };

      prismaService.goal.findUnique.mockResolvedValue(mockGoal as any);
      (prismaService.$queryRaw as jest.Mock).mockResolvedValue([mockStats]);

      const result = await service.getStatistics(1, 2025, 1);

      expect(typeof result.yearAvg).toBe('number');
      expect(typeof result.yearCount).toBe('number');
    });
  });

  describe('getMonthlyAverages', () => {
    it('should return monthly averages for numeric goal', async () => {
      const mockAverages = [
        { year: 2025, month: 1, average: 10.5 },
        { year: 2025, month: 2, average: 12.3 },
      ];

      prismaService.goal.findUnique.mockResolvedValue(mockNumericGoal as any);
      (prismaService.$queryRaw as jest.Mock).mockResolvedValue(mockAverages);

      const result = await service.getMonthlyAverages(2, 2025, 1);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should throw error for non-numeric goal type', async () => {
      prismaService.goal.findUnique.mockResolvedValue(mockGoal as any);

      await expect(
        service.getMonthlyAverages(1, 2025, 1),
      ).rejects.toThrow('Goal type must be NUMERIC');
    });

    it('should throw error when goal not found', async () => {
      prismaService.goal.findUnique.mockResolvedValue(null);

      await expect(
        service.getMonthlyAverages(999, 2025, 1),
      ).rejects.toThrow();
    });

    it('should throw error when user cannot view goal', async () => {
      prismaService.goal.findUnique.mockResolvedValue(mockNumericGoal as any);

      await expect(
        service.getMonthlyAverages(2, 2025, 2),
      ).rejects.toThrow();
    });

    it('should convert Decimal values to numbers', async () => {
      const mockAverages = [
        { year: new Decimal('2025'), month: new Decimal('1'), average: new Decimal('10.5') },
      ];

      prismaService.goal.findUnique.mockResolvedValue(mockNumericGoal as any);
      (prismaService.$queryRaw as jest.Mock).mockResolvedValue(mockAverages);

      const result = await service.getMonthlyAverages(2, 2025, 1);

      expect(typeof result[0].year).toBe('number');
      expect(typeof result[0].month).toBe('number');
      expect(typeof result[0].average).toBe('number');
    });
  });

  describe('getMonthlyCounts', () => {
    it('should return monthly counts for goal', async () => {
      const mockCounts = [
        { year: 2025, month: 1, count: 5 },
        { year: 2025, month: 2, count: 8 },
      ];

      prismaService.goal.findUnique.mockResolvedValue(mockGoal as any);
      (prismaService.$queryRaw as jest.Mock).mockResolvedValue(mockCounts);

      const result = await service.getMonthlyCounts(1, 2025, 1);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should allow viewing counts for public goal', async () => {
      const publicGoal = { ...mockGoal, publicity: GoalPublicity.PUBLIC };
      const mockCounts = [
        { year: 2025, month: 1, count: 5 },
      ];

      prismaService.goal.findUnique.mockResolvedValue(publicGoal as any);
      (prismaService.$queryRaw as jest.Mock).mockResolvedValue(mockCounts);

      const result = await service.getMonthlyCounts(1, 2025, 2);

      expect(result).toBeDefined();
    });

    it('should throw error when goal not found', async () => {
      prismaService.goal.findUnique.mockResolvedValue(null);

      await expect(
        service.getMonthlyCounts(999, 2025, 1),
      ).rejects.toThrow();
    });

    it('should throw error when user cannot view private goal', async () => {
      prismaService.goal.findUnique.mockResolvedValue(mockGoal as any);

      await expect(
        service.getMonthlyCounts(1, 2025, 2),
      ).rejects.toThrow();
    });

    it('should convert Decimal values to numbers', async () => {
      const mockCounts = [
        { year: new Decimal('2025'), month: new Decimal('1'), count: new Decimal('5') },
      ];

      prismaService.goal.findUnique.mockResolvedValue(mockGoal as any);
      (prismaService.$queryRaw as jest.Mock).mockResolvedValue(mockCounts);

      const result = await service.getMonthlyCounts(1, 2025, 1);

      expect(typeof result[0].year).toBe('number');
      expect(typeof result[0].month).toBe('number');
      expect(typeof result[0].count).toBe('number');
    });
  });
});
