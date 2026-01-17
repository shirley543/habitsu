import { Test, TestingModule } from '@nestjs/testing';
import { GoalsController } from './goals.controller';
import { GoalsService } from './goals.service';
import {
  CreateGoalDto,
  UpdateGoalDto,
  ReorderGoalDto,
  GoalQuantifyType,
} from '@habit-tracker/validation-schemas';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { GoalPublicity, GoalQuantify, ProfilePublicity } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

describe('GoalsController', () => {
  let controller: GoalsController;
  let goalsService: jest.Mocked<GoalsService>;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    username: 'testuser',
  };

  const mockGoal = {
    id: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    title: 'Morning Exercise',
    description: 'Do 30 minutes of exercise',
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
    title: 'Water Intake',
    goalType: GoalQuantify.NUMERIC,
    numericTarget: 8,
    numericUnit: 'cups',
    order: 2,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoalsController],
      providers: [
        {
          provide: GoalsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            reorder: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<GoalsController>(GoalsController);
    goalsService = module.get(GoalsService) as jest.Mocked<GoalsService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a goal with valid data', async () => {
      const req = { user: mockUser };
      const createGoalDto: CreateGoalDto = {
        title: 'New Goal',
        description: 'Test Description',
        colour: 'FF5733',
        icon: 'star',
        publicity: GoalPublicity.PRIVATE,
        goalType: GoalQuantifyType.Boolean,
      };

      goalsService.create.mockResolvedValue(mockGoal as any);

      const result = await controller.create(req, createGoalDto);

      expect(result).toEqual(mockGoal);
      expect(goalsService.create).toHaveBeenCalledWith(createGoalDto, 1);
    });

    it('should create a numeric goal with target and unit', async () => {
      const req = { user: mockUser };
      const createGoalDto: CreateGoalDto = {
        title: 'Water Intake',
        description: 'Drink water',
        colour: '0099FF',
        icon: 'droplet',
        publicity: GoalPublicity.PRIVATE,
        goalType: GoalQuantifyType.Numeric,
        numericTarget: 8,
        numericUnit: 'cups',
      };

      goalsService.create.mockResolvedValue(mockNumericGoal as any);

      const result = await controller.create(req, createGoalDto);

      expect(result).toEqual(mockNumericGoal);
      expect(goalsService.create).toHaveBeenCalledWith(createGoalDto, 1);
    });

    it('should create a public goal', async () => {
      const req = { user: mockUser };
      const createGoalDto: CreateGoalDto = {
        title: 'Publish Book',
        description: 'Finish and publish my book',
        colour: 'AA00FF',
        icon: 'book',
        publicity: GoalPublicity.PUBLIC,
        goalType: GoalQuantifyType.Boolean,
      };

      const publicGoal = { ...mockGoal, publicity: GoalPublicity.PUBLIC };
      goalsService.create.mockResolvedValue(publicGoal as any);

      const result = await controller.create(req, createGoalDto);

      expect(result.publicity).toEqual(GoalPublicity.PUBLIC);
      expect(goalsService.create).toHaveBeenCalledWith(createGoalDto, 1);
    });

    it('should use userId from authenticated user', async () => {
      const customUser = { id: 42, email: 'custom@test.com', username: 'customuser' };
      const req = { user: customUser };
      const createGoalDto: CreateGoalDto = {
        title: 'Custom Goal',
        description: 'Test',
        colour: 'FF0000',
        icon: 'check',
        publicity: GoalPublicity.PRIVATE,
        goalType: GoalQuantifyType.Boolean,
      };

      goalsService.create.mockResolvedValue(mockGoal as any);

      await controller.create(req, createGoalDto);

      expect(goalsService.create).toHaveBeenCalledWith(createGoalDto, 42);
    });

    it('should throw error when service fails', async () => {
      const req = { user: mockUser };
      const createGoalDto: CreateGoalDto = {
        title: 'New Goal',
        description: 'Test',
        colour: 'FF0000',
        icon: 'star',
        publicity: GoalPublicity.PRIVATE,
        goalType: GoalQuantifyType.Boolean,
      };

      goalsService.create.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(controller.create(req, createGoalDto)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return all goals for authenticated user', async () => {
      const req = { user: mockUser };
      const mockGoals = [mockGoal, mockNumericGoal];

      goalsService.findAll.mockResolvedValue(mockGoals as any);

      const result = await controller.findAll(req);

      expect(result).toEqual(mockGoals);
      expect(goalsService.findAll).toHaveBeenCalledWith(1);
    });

    it('should return empty array when user has no goals', async () => {
      const req = { user: mockUser };

      goalsService.findAll.mockResolvedValue([]);

      const result = await controller.findAll(req);

      expect(result).toEqual([]);
      expect(goalsService.findAll).toHaveBeenCalledWith(1);
    });

    it('should use userId from different authenticated user', async () => {
      const customUser = { id: 99, email: 'other@test.com', username: 'otheruser' };
      const req = { user: customUser };

      goalsService.findAll.mockResolvedValue([mockGoal] as any);

      await controller.findAll(req);

      expect(goalsService.findAll).toHaveBeenCalledWith(99);
    });

    it('should throw error when service fails', async () => {
      const req = { user: mockUser };

      goalsService.findAll.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(controller.findAll(req)).rejects.toThrow();
    });
  });

  describe('findOne', () => {
    it('should return a single goal by id', async () => {
      const req = { user: mockUser };

      goalsService.findOne.mockResolvedValue(mockGoal as any);

      const result = await controller.findOne(req, 1);

      expect(result).toEqual(mockGoal);
      expect(goalsService.findOne).toHaveBeenCalledWith(1, 1);
    });

    it('should use userId from authenticated user', async () => {
      const customUser = { id: 50, email: 'custom@test.com', username: 'user50' };
      const req = { user: customUser };

      goalsService.findOne.mockResolvedValue(mockGoal as any);

      await controller.findOne(req, 5);

      expect(goalsService.findOne).toHaveBeenCalledWith(5, 50);
    });

    it('should throw NotFoundException when goal not found', async () => {
      const req = { user: mockUser };
      const prismaError = new PrismaClientKnownRequestError(
        'Goal not found',
        {
          code: 'P2025',
          clientVersion: '5.0.0',
        },
      );

      goalsService.findOne.mockRejectedValue(prismaError);

      await expect(controller.findOne(req, 999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException for other Prisma errors', async () => {
      const req = { user: mockUser };
      const prismaError = new PrismaClientKnownRequestError(
        'Unexpected error',
        {
          code: 'P2002',
          clientVersion: '5.0.0',
        },
      );

      goalsService.findOne.mockRejectedValue(prismaError);

      await expect(controller.findOne(req, 1)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should handle undefined user id gracefully', async () => {
      const req = { user: undefined };

      goalsService.findOne.mockResolvedValue(mockGoal as any);

      await controller.findOne(req, 1);

      expect(goalsService.findOne).toHaveBeenCalledWith(1, undefined);
    });
  });

  describe('update', () => {
    it('should update a goal with valid data', async () => {
      const req = { user: mockUser };
      const updateGoalDto: UpdateGoalDto = {
        title: 'Updated Goal',
        description: 'Updated Description',
        colour: '00FF00',
        icon: 'star',
        publicity: GoalPublicity.PUBLIC,
        goalType: GoalQuantifyType.Boolean,
        visibility: true,
      };

      const updatedGoal = { ...mockGoal, ...updateGoalDto };
      goalsService.update.mockResolvedValue(updatedGoal as any);

      const result = await controller.update(req, 1, updateGoalDto);

      expect(result).toEqual(updatedGoal);
      expect(goalsService.update).toHaveBeenCalledWith(1, updateGoalDto, 1);
    });

    it('should update numeric goal with new target', async () => {
      const req = { user: mockUser };
      const updateGoalDto: UpdateGoalDto = {
        title: 'Updated Water Goal',
        description: 'Updated',
        colour: '0099FF',
        icon: 'droplet',
        publicity: GoalPublicity.PRIVATE,
        goalType: GoalQuantifyType.Numeric,
        numericTarget: 10,
        numericUnit: 'cups',
        visibility: true,
      };

      const updatedGoal = { ...mockNumericGoal, ...updateGoalDto };
      goalsService.update.mockResolvedValue(updatedGoal as any);

      const result = await controller.update(req, 2, updateGoalDto);

      expect(result.numericTarget).toEqual(10);
      expect(goalsService.update).toHaveBeenCalledWith(2, updateGoalDto, 1);
    });

    it('should hide goal visibility', async () => {
      const req = { user: mockUser };
      const updateGoalDto: UpdateGoalDto = {
        title: mockGoal.title,
        description: mockGoal.description,
        colour: mockGoal.colour,
        icon: mockGoal.icon,
        publicity: GoalPublicity.PRIVATE,
        goalType: GoalQuantifyType.Boolean,
        visibility: false,
      };

      const hiddenGoal = { ...mockGoal, visibility: false };
      goalsService.update.mockResolvedValue(hiddenGoal as any);

      const result = await controller.update(req, 1, updateGoalDto);

      expect(result.visibility).toBeFalsy();
      expect(goalsService.update).toHaveBeenCalledWith(1, updateGoalDto, 1);
    });

    it('should use userId from authenticated user', async () => {
      const customUser = { id: 25, email: 'test@test.com', username: 'user25' };
      const req = { user: customUser };
      const updateGoalDto: UpdateGoalDto = {
        title: 'Updated',
        description: 'Test',
        colour: 'FF0000',
        icon: 'check',
        publicity: GoalPublicity.PRIVATE,
        goalType: GoalQuantifyType.Boolean,
        visibility: true,
      };

      goalsService.update.mockResolvedValue(mockGoal as any);

      await controller.update(req, 1, updateGoalDto);

      expect(goalsService.update).toHaveBeenCalledWith(1, updateGoalDto, 25);
    });

    it('should throw error when goal not found', async () => {
      const req = { user: mockUser };
      const updateGoalDto: UpdateGoalDto = {
        title: 'Updated',
        description: 'Test',
        colour: 'FF0000',
        icon: 'check',
        publicity: GoalPublicity.PRIVATE,
        goalType: GoalQuantifyType.Boolean,
        visibility: true,
      };

      goalsService.update.mockRejectedValue(
        new Error('Goal not found'),
      );

      await expect(
        controller.update(req, 999, updateGoalDto),
      ).rejects.toThrow();
    });

    it('should throw error when user is not owner', async () => {
      const req = { user: mockUser };
      const updateGoalDto: UpdateGoalDto = {
        title: 'Updated',
        description: 'Test',
        colour: 'FF0000',
        icon: 'check',
        publicity: GoalPublicity.PRIVATE,
        goalType: GoalQuantifyType.Boolean,
        visibility: true,
      };

      goalsService.update.mockRejectedValue(
        new Error('Cannot modify goal'),
      );

      await expect(
        controller.update(req, 1, updateGoalDto),
      ).rejects.toThrow('Cannot modify goal');
    });
  });

  describe('remove', () => {
    it('should delete a goal', async () => {
      const req = { user: mockUser };

      goalsService.remove.mockResolvedValue(mockGoal as any);

      const result = await controller.remove(req, 1);

      expect(result).toEqual(mockGoal);
      expect(goalsService.remove).toHaveBeenCalledWith(1, 1);
    });

    it('should use userId from authenticated user', async () => {
      const customUser = { id: 33, email: 'custom@test.com', username: 'user33' };
      const req = { user: customUser };

      goalsService.remove.mockResolvedValue(mockGoal as any);

      await controller.remove(req, 5);

      expect(goalsService.remove).toHaveBeenCalledWith(5, 33);
    });

    it('should throw error when goal not found', async () => {
      const req = { user: mockUser };

      goalsService.remove.mockRejectedValue(
        new Error('Goal not found'),
      );

      await expect(controller.remove(req, 999)).rejects.toThrow();
    });

    it('should throw error when user is not owner', async () => {
      const req = { user: mockUser };

      goalsService.remove.mockRejectedValue(
        new Error('Cannot delete goal'),
      );

      await expect(controller.remove(req, 1)).rejects.toThrow(
        'Cannot delete goal',
      );
    });

    it('should throw error during transaction failure', async () => {
      const req = { user: mockUser };

      goalsService.remove.mockRejectedValue(
        new Error('Transaction failed'),
      );

      await expect(controller.remove(req, 1)).rejects.toThrow(
        'Transaction failed',
      );
    });
  });

  describe('reorder', () => {
    it('should reorder goals successfully', async () => {
      const req = { user: mockUser };
      const reorderGoalDto: ReorderGoalDto = {
        goalId: 1,
        newOrder: 2,
      };

      goalsService.reorder.mockResolvedValue(undefined);

      await controller.reorder(req, reorderGoalDto);

      expect(goalsService.reorder).toHaveBeenCalledWith(reorderGoalDto, 1);
    });

    it('should use userId from authenticated user', async () => {
      const customUser = { id: 77, email: 'custom@test.com', username: 'user77' };
      const req = { user: customUser };
      const reorderGoalDto: ReorderGoalDto = {
        goalId: 5,
        newOrder: 3,
      };

      goalsService.reorder.mockResolvedValue(undefined);

      await controller.reorder(req, reorderGoalDto);

      expect(goalsService.reorder).toHaveBeenCalledWith(reorderGoalDto, 77);
    });

    it('should throw error when goal not found', async () => {
      const req = { user: mockUser };
      const reorderGoalDto: ReorderGoalDto = {
        goalId: 999,
        newOrder: 2,
      };

      goalsService.reorder.mockRejectedValue(
        new Error('Goal not found'),
      );

      await expect(
        controller.reorder(req, reorderGoalDto),
      ).rejects.toThrow('Goal not found');
    });

    it('should throw error when user is not owner', async () => {
      const req = { user: mockUser };
      const reorderGoalDto: ReorderGoalDto = {
        goalId: 1,
        newOrder: 2,
      };

      goalsService.reorder.mockRejectedValue(
        new Error('Cannot reorder goal'),
      );

      await expect(
        controller.reorder(req, reorderGoalDto),
      ).rejects.toThrow('Cannot reorder goal');
    });

    it('should throw error when reorder index is invalid', async () => {
      const req = { user: mockUser };
      const reorderGoalDto: ReorderGoalDto = {
        goalId: 1,
        newOrder: 0,
      };

      goalsService.reorder.mockRejectedValue(
        new Error('Invalid order'),
      );

      await expect(
        controller.reorder(req, reorderGoalDto),
      ).rejects.toThrow('Invalid order');
    });
  });
});
