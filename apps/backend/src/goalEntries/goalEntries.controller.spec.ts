import { Test, TestingModule } from '@nestjs/testing';
import { GoalEntriesController } from './goalEntries.controller.ts';
import { GoalEntriesService } from './goalEntries.service';
import {
  CreateGoalEntryDto,
  UpdateGoalEntryDto,
  SearchParamsGoalEntryDto,
} from '@habit-tracker/validation-schemas';
import { BadRequestException } from '@nestjs/common';
import { GoalPublicity, GoalQuantify } from '@prisma/client';

describe('GoalEntriesController', () => {
  let controller: GoalEntriesController;
  let goalEntriesService: jest.Mocked<GoalEntriesService>;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    username: 'testuser',
  };

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

  const mockStatistics = {
    yearAvg: 0.5,
    yearCount: 10,
    currentStreakLen: 3,
    maxStreakLen: 7,
  };

  const mockMonthlyAverages = [
    { year: 2025, month: 1, average: 10.5 },
    { year: 2025, month: 2, average: 12.3 },
  ];

  const mockMonthlyCounts = [
    { year: 2025, month: 1, count: 5 },
    { year: 2025, month: 2, count: 8 },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoalEntriesController],
      providers: [
        {
          provide: GoalEntriesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findMany: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            getStatistics: jest.fn(),
            getMonthlyAverages: jest.fn(),
            getMonthlyCounts: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<GoalEntriesController>(GoalEntriesController);
    goalEntriesService = module.get(GoalEntriesService) as jest.Mocked<GoalEntriesService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getStatistics', () => {
    it('should return statistics when user is authenticated', async () => {
      const req = { user: mockUser };

      goalEntriesService.getStatistics.mockResolvedValue(mockStatistics as any);

      const result = await controller.getStatistics(req, 1, 2025);

      expect(result).toEqual(mockStatistics);
      expect(goalEntriesService.getStatistics).toHaveBeenCalledWith(1, 2025, 1);
    });

    it('should pass correct goalId and year to service', async () => {
      const req = { user: mockUser };

      goalEntriesService.getStatistics.mockResolvedValue(mockStatistics as any);

      await controller.getStatistics(req, 5, 2024);

      expect(goalEntriesService.getStatistics).toHaveBeenCalledWith(5, 2024, 1);
    });

    it('should extract userId from request object', async () => {
      const customUser = { id: 42, email: 'other@example.com', username: 'otheruser' };
      const req = { user: customUser };

      goalEntriesService.getStatistics.mockResolvedValue(mockStatistics as any);

      await controller.getStatistics(req, 1, 2025);

      expect(goalEntriesService.getStatistics).toHaveBeenCalledWith(1, 2025, 42);
    });

    it('should throw error when service returns error', async () => {
      const req = { user: mockUser };

      goalEntriesService.getStatistics.mockRejectedValue(
        new BadRequestException('Goal not found'),
      );

      await expect(
        controller.getStatistics(req, 999, 2025),
      ).rejects.toThrow();
    });
  });

  describe('getMonthlyAverages', () => {
    it('should return monthly averages when user is authenticated', async () => {
      const req = { user: mockUser };

      goalEntriesService.getMonthlyAverages.mockResolvedValue(
        mockMonthlyAverages as any,
      );

      const result = await controller.getMonthlyAverages(req, 1, 2025);

      expect(result).toEqual(mockMonthlyAverages);
      expect(goalEntriesService.getMonthlyAverages).toHaveBeenCalledWith(
        1,
        2025,
        1,
      );
    });

    it('should pass correct parameters to service', async () => {
      const req = { user: mockUser };

      goalEntriesService.getMonthlyAverages.mockResolvedValue(
        mockMonthlyAverages as any,
      );

      await controller.getMonthlyAverages(req, 10, 2023);

      expect(goalEntriesService.getMonthlyAverages).toHaveBeenCalledWith(
        10,
        2023,
        1,
      );
    });

    it('should throw error for non-numeric goal', async () => {
      const req = { user: mockUser };

      goalEntriesService.getMonthlyAverages.mockRejectedValue(
        new BadRequestException('Goal type must be NUMERIC'),
      );

      await expect(
        controller.getMonthlyAverages(req, 1, 2025),
      ).rejects.toThrow('Goal type must be NUMERIC');
    });
  });

  describe('getMonthlyCounts', () => {
    it('should return monthly counts when user is authenticated', async () => {
      const req = { user: mockUser };

      goalEntriesService.getMonthlyCounts.mockResolvedValue(
        mockMonthlyCounts as any,
      );

      const result = await controller.getMonthlyCounts(req, 1, 2025);

      expect(result).toEqual(mockMonthlyCounts);
      expect(goalEntriesService.getMonthlyCounts).toHaveBeenCalledWith(
        1,
        2025,
        1,
      );
    });

    it('should pass correct parameters to service', async () => {
      const req = { user: mockUser };

      goalEntriesService.getMonthlyCounts.mockResolvedValue(
        mockMonthlyCounts as any,
      );

      await controller.getMonthlyCounts(req, 15, 2024);

      expect(goalEntriesService.getMonthlyCounts).toHaveBeenCalledWith(
        15,
        2024,
        1,
      );
    });

    it('should throw error when goal not found', async () => {
      const req = { user: mockUser };

      goalEntriesService.getMonthlyCounts.mockRejectedValue(
        new BadRequestException('Goal not found'),
      );

      await expect(
        controller.getMonthlyCounts(req, 999, 2025),
      ).rejects.toThrow();
    });
  });

  describe('findManyBySearchParams', () => {
    it('should return entries when search params are valid', async () => {
      const req = { user: mockUser };
      const searchParams: SearchParamsGoalEntryDto = { goalId: 1, year: 2025 };
      const mockEntries = [mockGoalEntry];

      goalEntriesService.findMany.mockResolvedValue(mockEntries as any);

      const result = await controller.findManyBySearchParams(req, searchParams);

      expect(result).toEqual(mockEntries);
      expect(goalEntriesService.findMany).toHaveBeenCalledWith(searchParams, 1);
    });

    it('should handle undefined year in search params', async () => {
      const req = { user: mockUser };
      const searchParams: SearchParamsGoalEntryDto = { goalId: 1, year: undefined };
      const mockEntries = [mockGoalEntry];

      goalEntriesService.findMany.mockResolvedValue(mockEntries as any);

      const result = await controller.findManyBySearchParams(req, searchParams);

      expect(result).toEqual(mockEntries);
      expect(goalEntriesService.findMany).toHaveBeenCalledWith(searchParams, 1);
    });

    it('should throw error when service returns error', async () => {
      const req = { user: mockUser };
      const searchParams: SearchParamsGoalEntryDto = { goalId: 999, year: 2025 };

      goalEntriesService.findMany.mockRejectedValue(
        new BadRequestException('Goal not found'),
      );

      await expect(
        controller.findManyBySearchParams(req, searchParams),
      ).rejects.toThrow();
    });

    it('should pass userId from authenticated user', async () => {
      const customUser = { id: 99, email: 'custom@example.com', username: 'customuser' };
      const req = { user: customUser };
      const searchParams: SearchParamsGoalEntryDto = { goalId: 1, year: 2025 };

      goalEntriesService.findMany.mockResolvedValue([mockGoalEntry] as any);

      await controller.findManyBySearchParams(req, searchParams);

      expect(goalEntriesService.findMany).toHaveBeenCalledWith(searchParams, 99);
    });
  });

  describe('findOne', () => {
    it('should return a single goal entry by id', async () => {
      const req = { user: mockUser };

      goalEntriesService.findOne.mockResolvedValue(mockGoalEntry as any);

      const result = await controller.findOne(req, 1);

      expect(result).toEqual(mockGoalEntry);
      expect(goalEntriesService.findOne).toHaveBeenCalledWith(1, 1);
    });

    it('should use userId from request', async () => {
      const customUser = { id: 25, email: 'test@test.com', username: 'user25' };
      const req = { user: customUser };

      goalEntriesService.findOne.mockResolvedValue(mockGoalEntry as any);

      await controller.findOne(req, 1);

      expect(goalEntriesService.findOne).toHaveBeenCalledWith(1, 25);
    });

    it('should throw error when entry not found', async () => {
      const req = { user: mockUser };

      goalEntriesService.findOne.mockRejectedValue(
        new BadRequestException('Goal entry not found'),
      );

      await expect(controller.findOne(req, 999)).rejects.toThrow();
    });
  });

  describe('findManyByGoalId', () => {
    it('should return all entries for a goal', async () => {
      const req = { user: mockUser };
      const mockEntries = [mockGoalEntry];

      goalEntriesService.findMany.mockResolvedValue(mockEntries as any);

      const result = await controller.findManyByGoalId(req, 1);

      expect(result).toEqual(mockEntries);
      expect(goalEntriesService.findMany).toHaveBeenCalledWith(
        { goalId: 1, year: undefined },
        1,
      );
    });

    it('should use userId from request', async () => {
      const customUser = { id: 50, email: 'custom@test.com', username: 'user50' };
      const req = { user: customUser };

      goalEntriesService.findMany.mockResolvedValue([mockGoalEntry] as any);

      await controller.findManyByGoalId(req, 5);

      expect(goalEntriesService.findMany).toHaveBeenCalledWith(
        { goalId: 5, year: undefined },
        50,
      );
    });

    it('should throw error when goal not found', async () => {
      const req = { user: mockUser };

      goalEntriesService.findMany.mockRejectedValue(
        new BadRequestException('Goal not found'),
      );

      await expect(controller.findManyByGoalId(req, 999)).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create a goal entry with valid data', async () => {
      const req = { user: mockUser };
      const createGoalEntryDto: CreateGoalEntryDto = {
        entryDate: new Date('2025-01-15'),
        note: 'Test entry',
      };

      goalEntriesService.create.mockResolvedValue(mockGoalEntry as any);

      const result = await controller.create(req, 1, createGoalEntryDto);

      expect(result).toEqual(mockGoalEntry);
      expect(goalEntriesService.create).toHaveBeenCalledWith(
        1,
        createGoalEntryDto,
        1,
      );
    });

    it('should create numeric goal entry with value', async () => {
      const req = { user: mockUser };
      const createGoalEntryDto: CreateGoalEntryDto = {
        entryDate: new Date('2025-01-15'),
        note: 'Numeric entry',
        numericValue: 50,
      };

      const mockNumericEntry = { ...mockGoalEntry, numericValue: 50 };
      goalEntriesService.create.mockResolvedValue(mockNumericEntry as any);

      const result = await controller.create(req, 2, createGoalEntryDto);

      expect(result).toEqual(mockNumericEntry);
      expect(goalEntriesService.create).toHaveBeenCalledWith(
        2,
        createGoalEntryDto,
        1,
      );
    });

    it('should use userId from authenticated request', async () => {
      const customUser = { id: 100, email: 'auth@test.com', username: 'user100' };
      const req = { user: customUser };
      const createGoalEntryDto: CreateGoalEntryDto = {
        entryDate: new Date('2025-01-15'),
        note: 'Test',
      };

      goalEntriesService.create.mockResolvedValue(mockGoalEntry as any);

      await controller.create(req, 1, createGoalEntryDto);

      expect(goalEntriesService.create).toHaveBeenCalledWith(
        1,
        createGoalEntryDto,
        100,
      );
    });

    it('should throw error when goal not found', async () => {
      const req = { user: mockUser };
      const createGoalEntryDto: CreateGoalEntryDto = {
        entryDate: new Date('2025-01-15'),
        note: 'Test',
      };

      goalEntriesService.create.mockRejectedValue(
        new BadRequestException('Goal not found'),
      );

      await expect(
        controller.create(req, 999, createGoalEntryDto),
      ).rejects.toThrow();
    });

    it('should throw error when user does not own the goal', async () => {
      const req = { user: mockUser };
      const createGoalEntryDto: CreateGoalEntryDto = {
        entryDate: new Date('2025-01-15'),
        note: 'Test',
      };

      goalEntriesService.create.mockRejectedValue(
        new BadRequestException('Unauthorized'),
      );

      await expect(
        controller.create(req, 1, createGoalEntryDto),
      ).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update a goal entry with valid data', async () => {
      const req = { user: mockUser };
      const updateGoalEntryDto: UpdateGoalEntryDto = {
        entryDate: new Date('2025-01-20'),
        note: 'Updated note',
      };

      const updatedEntry = { ...mockGoalEntry, ...updateGoalEntryDto };
      goalEntriesService.update.mockResolvedValue(updatedEntry as any);

      const result = await controller.update(req, 1, 1, updateGoalEntryDto);

      expect(result).toEqual(updatedEntry);
      expect(goalEntriesService.update).toHaveBeenCalledWith(
        1,
        1,
        updateGoalEntryDto,
        1,
      );
    });

    it('should update numeric goal entry with value', async () => {
      const req = { user: mockUser };
      const updateGoalEntryDto: UpdateGoalEntryDto = {
        entryDate: new Date('2025-01-20'),
        note: 'Updated',
        numericValue: 75,
      };

      const mockNumericEntry = { ...mockGoalEntry, ...updateGoalEntryDto, goalId: 2 };
      goalEntriesService.update.mockResolvedValue(mockNumericEntry as any);

      const result = await controller.update(req, 2, 2, updateGoalEntryDto);

      expect(result).toBeDefined();
      expect(goalEntriesService.update).toHaveBeenCalledWith(
        2,
        2,
        updateGoalEntryDto,
        1,
      );
    });

    it('should use userId from authenticated request', async () => {
      const customUser = { id: 75, email: 'auth2@test.com', username: 'user75' };
      const req = { user: customUser };
      const updateGoalEntryDto: UpdateGoalEntryDto = {
        entryDate: new Date('2025-01-20'),
        note: 'Updated',
      };

      goalEntriesService.update.mockResolvedValue(mockGoalEntry as any);

      await controller.update(req, 1, 1, updateGoalEntryDto);

      expect(goalEntriesService.update).toHaveBeenCalledWith(
        1,
        1,
        updateGoalEntryDto,
        75,
      );
    });

    it('should throw error when entry not found', async () => {
      const req = { user: mockUser };
      const updateGoalEntryDto: UpdateGoalEntryDto = {
        entryDate: new Date('2025-01-20'),
        note: 'Updated',
      };

      goalEntriesService.update.mockRejectedValue(
        new BadRequestException('Goal entry not found'),
      );

      await expect(
        controller.update(req, 1, 999, updateGoalEntryDto),
      ).rejects.toThrow();
    });

    it('should throw error when user does not own the goal', async () => {
      const req = { user: mockUser };
      const updateGoalEntryDto: UpdateGoalEntryDto = {
        entryDate: new Date('2025-01-20'),
        note: 'Updated',
      };

      goalEntriesService.update.mockRejectedValue(
        new BadRequestException('Unauthorized'),
      );

      await expect(
        controller.update(req, 1, 1, updateGoalEntryDto),
      ).rejects.toThrow();
    });
  });

  describe('remove', () => {
    it('should delete a goal entry', async () => {
      const req = { user: mockUser };

      goalEntriesService.remove.mockResolvedValue(mockGoalEntry as any);

      const result = await controller.remove(req, 1, 1);

      expect(result).toEqual(mockGoalEntry);
      expect(goalEntriesService.remove).toHaveBeenCalledWith(1, 1, 1);
    });

    it('should use userId from authenticated request', async () => {
      const customUser = { id: 33, email: 'delete@test.com', username: 'user33' };
      const req = { user: customUser };

      goalEntriesService.remove.mockResolvedValue(mockGoalEntry as any);

      await controller.remove(req, 5, 10);

      expect(goalEntriesService.remove).toHaveBeenCalledWith(5, 10, 33);
    });

    it('should throw error when entry not found', async () => {
      const req = { user: mockUser };

      goalEntriesService.remove.mockRejectedValue(
        new BadRequestException('Goal entry not found'),
      );

      await expect(controller.remove(req, 1, 999)).rejects.toThrow();
    });

    it('should throw error when user does not own the goal', async () => {
      const req = { user: mockUser };

      goalEntriesService.remove.mockRejectedValue(
        new BadRequestException('Unauthorized'),
      );

      await expect(controller.remove(req, 1, 1)).rejects.toThrow();
    });
  });

  describe('Authorization and Guard Integration', () => {
    it('statistics endpoint should require JWT authentication', () => {
      const route = Reflect.getMetadata(
        '__guards__',
        GoalEntriesController.prototype.getStatistics,
      );
      expect(route).toBeDefined();
    });

    it('monthly averages endpoint should require JWT authentication', () => {
      const route = Reflect.getMetadata(
        '__guards__',
        GoalEntriesController.prototype.getMonthlyAverages,
      );
      expect(route).toBeDefined();
    });

    it('monthly counts endpoint should require JWT authentication', () => {
      const route = Reflect.getMetadata(
        '__guards__',
        GoalEntriesController.prototype.getMonthlyCounts,
      );
      expect(route).toBeDefined();
    });

    it('create endpoint should require JWT authentication', () => {
      const route = Reflect.getMetadata(
        '__guards__',
        GoalEntriesController.prototype.create,
      );
      expect(route).toBeDefined();
    });

    it('update endpoint should require JWT authentication', () => {
      const route = Reflect.getMetadata(
        '__guards__',
        GoalEntriesController.prototype.update,
      );
      expect(route).toBeDefined();
    });

    it('remove endpoint should require JWT authentication', () => {
      const route = Reflect.getMetadata(
        '__guards__',
        GoalEntriesController.prototype.remove,
      );
      expect(route).toBeDefined();
    });

    it('findOne endpoint should require JWT authentication', () => {
      const route = Reflect.getMetadata(
        '__guards__',
        GoalEntriesController.prototype.findOne,
      );
      expect(route).toBeDefined();
    });

    it('should extract user ID from authenticated request user object', async () => {
      const testUser = { id: 123, email: 'testuser@example.com', username: 'testuser123' };
      const req = { user: testUser };

      goalEntriesService.findOne.mockResolvedValue(mockGoalEntry as any);

      await controller.findOne(req, 1);

      expect(goalEntriesService.findOne).toHaveBeenCalledWith(1, 123);
    });

    it('should handle multiple users independently', async () => {
      const user1 = { id: 1, email: 'user1@example.com', username: 'user1' };
      const user2 = { id: 2, email: 'user2@example.com', username: 'user2' };

      goalEntriesService.findOne.mockResolvedValue(mockGoalEntry as any);

      await controller.findOne({ user: user1 }, 1);
      await controller.findOne({ user: user2 }, 1);

      expect(goalEntriesService.findOne).toHaveBeenNthCalledWith(1, 1, 1);
      expect(goalEntriesService.findOne).toHaveBeenNthCalledWith(2, 1, 2);
    });
  });

  describe('Error Handling', () => {
    it('should propagate BadRequestException from service', async () => {
      const req = { user: mockUser };
      const error = new BadRequestException('Invalid goal entry');

      goalEntriesService.findOne.mockRejectedValue(error);

      await expect(controller.findOne(req, 1)).rejects.toThrow(BadRequestException);
    });

    it('should propagate service errors with appropriate context', async () => {
      const req = { user: mockUser };
      const error = new BadRequestException('Goal not found');

      goalEntriesService.create.mockRejectedValue(error);

      const createDto: CreateGoalEntryDto = {
        entryDate: new Date(),
        note: 'Test',
      };

      await expect(controller.create(req, 999, createDto)).rejects.toMatchObject({
        message: 'Goal not found',
      });
    });
  });
});
