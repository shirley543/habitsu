import { Test, TestingModule } from '@nestjs/testing';
import { GoalsService } from './goals.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import {
  CreateGoalDto,
  UpdateGoalDto,
  ReorderGoalDto,
  GoalQuantifyType,
} from '@habit-tracker/validation-schemas';
import { GoalPublicity, GoalQuantify } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

describe('GoalsService', () => {
  let service: GoalsService;
  let prismaService: jest.Mocked<PrismaService>;
  let usersService: jest.Mocked<UsersService>;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    username: 'testuser',
    password: 'hashedpassword',
    createdAt: new Date(),
    profilePublicity: 'PRIVATE' as const,
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

  const mockNumericGoal = {
    ...mockGoal,
    id: 2,
    title: 'Numeric Goal',
    goalType: GoalQuantify.NUMERIC,
    numericTarget: 100,
    numericUnit: 'km',
    order: 2,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoalsService,
        {
          provide: PrismaService,
          useValue: {
            goal: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              findUniqueOrThrow: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              aggregate: jest.fn(),
            },
            user: {
              findUnique: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GoalsService>(GoalsService);
    prismaService = module.get(PrismaService) as jest.Mocked<PrismaService>;
    usersService = module.get(UsersService) as jest.Mocked<UsersService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a boolean goal with correct order', async () => {
      const createGoalDto: CreateGoalDto = {
        title: 'Test Goal',
        description: 'Test Description',
        colour: 'FF5733',
        icon: 'heart',
        publicity: GoalPublicity.PRIVATE,
        goalType: GoalQuantifyType.Boolean,
      };

      prismaService.goal.aggregate.mockResolvedValue({
        _max: { order: 5 },
      } as any);

      prismaService.goal.create.mockResolvedValue(mockGoal);

      const result = await service.create(createGoalDto, 1);

      expect(result).toEqual(mockGoal);
      expect(prismaService.goal.aggregate).toHaveBeenCalledWith({
        _max: { order: true },
        where: { userId: 1 },
      });
      expect(prismaService.goal.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Test Goal',
          description: 'Test Description',
          colour: 'FF5733',
          icon: 'heart',
          publicity: GoalPublicity.PRIVATE,
          goalType: GoalQuantify.BOOLEAN,
          order: 6,
          user: { connect: { id: 1 } },
        }),
      });
    });

    it('should create a numeric goal with target and unit', async () => {
      const createGoalDto: CreateGoalDto = {
        title: 'Numeric Goal',
        description: 'Run distance',
        colour: 'FF5733',
        icon: 'run',
        publicity: GoalPublicity.PUBLIC,
        goalType: GoalQuantifyType.Numeric,
        numericTarget: 100,
        numericUnit: 'km',
      };

      prismaService.goal.aggregate.mockResolvedValue({
        _max: { order: 1 },
      } as any);

      prismaService.goal.create.mockResolvedValue(mockNumericGoal);

      const result = await service.create(createGoalDto, 1);

      expect(result).toEqual(mockNumericGoal);
      expect(prismaService.goal.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Numeric Goal',
          goalType: GoalQuantify.NUMERIC,
          numericTarget: 100,
          numericUnit: 'km',
          order: 2,
        }),
      });
    });

    it('should set order to 1 when user has no existing goals', async () => {
      const createGoalDto: CreateGoalDto = {
        title: 'First Goal',
        description: 'First',
        colour: 'FF5733',
        icon: 'heart',
        publicity: GoalPublicity.PRIVATE,
        goalType: GoalQuantifyType.Boolean,
      };

      prismaService.goal.aggregate.mockResolvedValue({
        _max: { order: null },
      } as any);

      prismaService.goal.create.mockResolvedValue(mockGoal);

      await service.create(createGoalDto, 1);

      expect(prismaService.goal.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ order: 1 }),
      });
    });
  });

  describe('findAll', () => {
    it('should return all goals for a user', async () => {
      const mockGoals = [mockGoal, mockNumericGoal];
      prismaService.goal.findMany.mockResolvedValue(mockGoals as any);

      const result = await service.findAll(1);

      expect(result).toEqual(mockGoals);
      expect(prismaService.goal.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
    });

    it('should return empty array when user has no goals', async () => {
      prismaService.goal.findMany.mockResolvedValue([]);

      const result = await service.findAll(1);

      expect(result).toEqual([]);
    });
  });

  describe('findManyByUsername', () => {
    it('should return all goals when user is viewing their own goals', async () => {
      const mockGoals = [mockGoal, mockNumericGoal];
      prismaService.user.findUnique.mockResolvedValue(mockUser as any);
      prismaService.goal.findMany.mockResolvedValue(mockGoals as any);

      const result = await service.findManyByUsername('testuser', 1);

      expect(result).toEqual(mockGoals);
      expect(prismaService.goal.findMany).toHaveBeenCalledWith({
        where: {
          userId: 1,
        },
      });
    });

    it('should return only public goals when user is viewing another user\'s goals', async () => {
      const publicGoal = { ...mockGoal, publicity: GoalPublicity.PUBLIC };
      prismaService.user.findUnique.mockResolvedValue(mockUser as any);
      prismaService.goal.findMany.mockResolvedValue([publicGoal] as any);

      const result = await service.findManyByUsername('testuser', 2);

      expect(result).toEqual([publicGoal]);
      expect(prismaService.goal.findMany).toHaveBeenCalledWith({
        where: {
          userId: 1,
          publicity: GoalPublicity.PUBLIC,
        },
      });
    });

    it('should throw error when user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.findManyByUsername('nonexistent', 1),
      ).rejects.toThrow();
    });
  });

  describe('findOne', () => {
    it('should return a goal by id and userId', async () => {
      prismaService.goal.findUniqueOrThrow.mockResolvedValue(mockGoal as any);

      const result = await service.findOne(1, 1);

      expect(result).toEqual(mockGoal);
      expect(prismaService.goal.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
      });
    });

    it('should throw error when goal not found', async () => {
      prismaService.goal.findUniqueOrThrow.mockRejectedValue(new Error('Not found'));

      await expect(service.findOne(999, 1)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update a boolean goal', async () => {
      const updateGoalDto: UpdateGoalDto = {
        title: 'Updated Title',
        description: 'Updated Description',
        colour: 'FF0000',
        icon: 'star',
        publicity: GoalPublicity.PUBLIC,
        goalType: GoalQuantifyType.Boolean,
        visibility: true,
      };

      const updatedGoal = { ...mockGoal, ...updateGoalDto };

      prismaService.goal.findUniqueOrThrow.mockResolvedValue(mockGoal as any);
      prismaService.goal.update.mockResolvedValue(updatedGoal as any);

      const result = await service.update(1, updateGoalDto, 1);

      expect(result).toEqual(updatedGoal);
      expect(prismaService.goal.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          title: 'Updated Title',
          goalType: GoalQuantify.BOOLEAN,
        }),
      });
    });

    it('should update a numeric goal with target and unit', async () => {
      const updateGoalDto: UpdateGoalDto = {
        title: 'Updated Numeric',
        description: 'Updated',
        colour: 'FF0000',
        icon: 'star',
        publicity: GoalPublicity.PUBLIC,
        goalType: GoalQuantifyType.Numeric,
        visibility: true,
        numericTarget: 200,
        numericUnit: 'miles',
      };

      prismaService.goal.findUniqueOrThrow.mockResolvedValue(mockNumericGoal as any);
      prismaService.goal.update.mockResolvedValue({
        ...mockNumericGoal,
        ...updateGoalDto,
      } as any);

      const result = await service.update(2, updateGoalDto, 1);

      expect(prismaService.goal.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: expect.objectContaining({
          numericTarget: 200,
          numericUnit: 'miles',
        }),
      });
    });

    it('should throw error when user does not own the goal', async () => {
      const updateGoalDto: UpdateGoalDto = {
        title: 'Updated',
        description: 'Updated',
        colour: 'FF0000',
        icon: 'star',
        publicity: GoalPublicity.PUBLIC,
        goalType: GoalQuantifyType.Boolean,
        visibility: true,
      };

      prismaService.goal.findUniqueOrThrow.mockResolvedValue(mockGoal as any);

      await expect(
        service.update(1, updateGoalDto, 999),
      ).rejects.toThrow();
    });
  });

  describe('remove', () => {
    it('should delete a goal and update order of subsequent goals', async () => {
      const goal2 = { ...mockGoal, id: 2, order: 2 };
      const goal3 = { ...mockGoal, id: 3, order: 3 };
      const goalsToUpdate = [goal2, goal3];

      prismaService.goal.findUniqueOrThrow.mockResolvedValue(mockGoal as any);

      const mockTransaction = jest.fn(async (callback) => {
        const txMock = {
          goal: {
            findMany: jest.fn().mockResolvedValue(goalsToUpdate),
            update: jest.fn().mockResolvedValue({}),
            delete: jest.fn().mockResolvedValue(mockGoal),
          },
        };
        return callback(txMock);
      });

      prismaService.$transaction.mockImplementation(mockTransaction);

      const result = await service.remove(1, 1);

      expect(result).toEqual(mockGoal);
      expect(prismaService.$transaction).toHaveBeenCalled();
    });

    it('should throw error when goal not found', async () => {
      prismaService.goal.findUniqueOrThrow.mockRejectedValue(new Error('Not found'));

      await expect(service.remove(999, 1)).rejects.toThrow();
    });

    it('should throw error when user does not own the goal', async () => {
      prismaService.goal.findUniqueOrThrow.mockResolvedValue(mockGoal as any);

      await expect(service.remove(1, 999)).rejects.toThrow();
    });
  });

  describe('reorder', () => {
    it('should reorder goals when all conditions are met', async () => {
      const goal1 = { ...mockGoal, id: 1, order: 1 };
      const goal2 = { ...mockGoal, id: 2, order: 2 };
      const goal3 = { ...mockGoal, id: 3, order: 3 };

      const reorderGoalDto: ReorderGoalDto = [
        { id: 1, order: 3 },
        { id: 2, order: 1 },
        { id: 3, order: 2 },
      ];

      prismaService.goal.findMany.mockResolvedValue([goal1, goal2, goal3] as any);

      const mockTransaction = jest.fn(async (callback) => {
        const txMock = {
          goal: {
            update: jest.fn().mockResolvedValue({}),
          },
        };
        return callback(txMock);
      });

      prismaService.$transaction.mockImplementation(mockTransaction);

      await service.reorder(reorderGoalDto, 1);

      expect(prismaService.$transaction).toHaveBeenCalled();
    });

    it('should throw error when reorder length does not match goals length', async () => {
      const goal1 = { ...mockGoal, id: 1, order: 1 };

      const reorderGoalDto: ReorderGoalDto = [
        { id: 1, order: 1 },
        { id: 2, order: 2 },
      ];

      prismaService.goal.findMany.mockResolvedValue([goal1] as any);

      await expect(
        service.reorder(reorderGoalDto, 1),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error when goal IDs do not match', async () => {
      const goal1 = { ...mockGoal, id: 1, order: 1 };
      const goal2 = { ...mockGoal, id: 2, order: 2 };

      const reorderGoalDto: ReorderGoalDto = [
        { id: 1, order: 1 },
        { id: 3, order: 2 },
      ];

      prismaService.goal.findMany.mockResolvedValue([goal1, goal2] as any);

      await expect(
        service.reorder(reorderGoalDto, 1),
      ).rejects.toThrow('Invalid Goal IDs');
    });

    it('should throw error when orders are not sequential', async () => {
      const goal1 = { ...mockGoal, id: 1, order: 1 };
      const goal2 = { ...mockGoal, id: 2, order: 2 };

      const reorderGoalDto: ReorderGoalDto = [
        { id: 1, order: 1 },
        { id: 2, order: 3 },
      ];

      prismaService.goal.findMany.mockResolvedValue([goal1, goal2] as any);

      await expect(
        service.reorder(reorderGoalDto, 1),
      ).rejects.toThrow('Invalid Goal Orders');
    });

    it('should handle single goal reorder', async () => {
      const goal1 = { ...mockGoal, id: 1, order: 1 };

      const reorderGoalDto: ReorderGoalDto = [{ id: 1, order: 1 }];

      prismaService.goal.findMany.mockResolvedValue([goal1] as any);

      const mockTransaction = jest.fn(async (callback) => {
        const txMock = {
          goal: {
            update: jest.fn().mockResolvedValue({}),
          },
        };
        return callback(txMock);
      });

      prismaService.$transaction.mockImplementation(mockTransaction);

      await service.reorder(reorderGoalDto, 1);

      expect(prismaService.$transaction).toHaveBeenCalled();
    });
  });
});
