import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { GoalsService } from '../goals/goals.service';
import { GoalPublicity, GoalQuantify, ProfilePublicity } from '@prisma/client';

describe('ProfilesController', () => {
  let controller: ProfilesController;
  let profilesService: jest.Mocked<ProfilesService>;
  let goalsService: jest.Mocked<GoalsService>;

  const mockProfileEntity = {
    username: 'testuser',
    joinedAt: new Date('2025-01-01'),
    daysTrackedTotal: 25,
  };

  const mockProfileEntityPrivate = {
    username: 'privateuser',
    joinedAt: undefined,
    daysTrackedTotal: undefined,
  };

  const mockGoals = [
    {
      id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      title: 'Morning Exercise',
      description: 'Daily exercise routine',
      colour: 'FF5733',
      icon: 'heart',
      publicity: GoalPublicity.PUBLIC,
      goalType: GoalQuantify.BOOLEAN,
      numericTarget: null,
      numericUnit: null,
      userId: 1,
      visibility: true,
      order: 1,
    },
    {
      id: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
      title: 'Water Intake',
      description: 'Drink 8 cups of water',
      colour: '0099FF',
      icon: 'droplet',
      publicity: GoalPublicity.PUBLIC,
      goalType: GoalQuantify.NUMERIC,
      numericTarget: 8,
      numericUnit: 'cups',
      userId: 1,
      visibility: true,
      order: 2,
    },
  ];

  const mockPrivateGoals = [
    {
      id: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
      title: 'Meditation',
      description: 'Daily meditation',
      colour: 'AA00FF',
      icon: 'zen',
      publicity: GoalPublicity.PRIVATE,
      goalType: GoalQuantify.BOOLEAN,
      numericTarget: null,
      numericUnit: null,
      userId: 2,
      visibility: true,
      order: 1,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfilesController],
      providers: [
        {
          provide: ProfilesService,
          useValue: {
            findByUsername: jest.fn(),
          },
        },
        {
          provide: GoalsService,
          useValue: {
            findManyByUsername: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProfilesController>(ProfilesController);
    profilesService = module.get(ProfilesService) as jest.Mocked<ProfilesService>;
    goalsService = module.get(GoalsService) as jest.Mocked<GoalsService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findByUsername', () => {
    it('should return profile for authenticated user', async () => {
      const req = { user: { id: 1, username: 'testuser', email: 'test@example.com' } };

      profilesService.findByUsername.mockResolvedValue(mockProfileEntity as any);

      const result = await controller.findByUsername(req, 'testuser');

      expect(result).toEqual(mockProfileEntity);
      expect(profilesService.findByUsername).toHaveBeenCalledWith('testuser', 1);
    });

    it('should return profile for unauthenticated user (OptionalJwtAuthGuard)', async () => {
      const req = { user: undefined };

      profilesService.findByUsername.mockResolvedValue(mockProfileEntity as any);

      const result = await controller.findByUsername(req, 'testuser');

      expect(result).toEqual(mockProfileEntity);
      expect(profilesService.findByUsername).toHaveBeenCalledWith('testuser', undefined);
    });

    it('should extract userId from authenticated user', async () => {
      const req = { user: { id: 42, username: 'otheruser', email: 'other@example.com' } };

      profilesService.findByUsername.mockResolvedValue(mockProfileEntity as any);

      await controller.findByUsername(req, 'testuser');

      expect(profilesService.findByUsername).toHaveBeenCalledWith('testuser', 42);
    });

    it('should return limited profile data for non-owner of private profile', async () => {
      const req = { user: { id: 99, username: 'viewer', email: 'viewer@example.com' } };

      profilesService.findByUsername.mockResolvedValue(mockProfileEntityPrivate as any);

      const result = await controller.findByUsername(req, 'privateuser');

      expect(result.username).toEqual('privateuser');
      expect(result.joinedAt).toBeUndefined();
      expect(result.daysTrackedTotal).toBeUndefined();
    });

    it('should return full profile data for owner', async () => {
      const req = { user: { id: 1, username: 'testuser', email: 'test@example.com' } };

      profilesService.findByUsername.mockResolvedValue(mockProfileEntity as any);

      const result = await controller.findByUsername(req, 'testuser');

      expect(result.joinedAt).toBeDefined();
      expect(result.daysTrackedTotal).toBeDefined();
    });

    it('should throw error when user not found', async () => {
      const req = { user: { id: 1, username: 'testuser', email: 'test@example.com' } };

      profilesService.findByUsername.mockRejectedValue(
        new Error('User not found'),
      );

      await expect(
        controller.findByUsername(req, 'nonexistent'),
      ).rejects.toThrow('User not found');
    });

    it('should handle different usernames', async () => {
      const req = { user: { id: 1, username: 'testuser', email: 'test@example.com' } };

      profilesService.findByUsername.mockResolvedValue(mockProfileEntity as any);

      await controller.findByUsername(req, 'alice');

      expect(profilesService.findByUsername).toHaveBeenCalledWith('alice', 1);
    });

    it('should support public profile access without authentication', async () => {
      const req = { user: undefined };

      profilesService.findByUsername.mockResolvedValue(mockProfileEntity as any);

      const result = await controller.findByUsername(req, 'publicuser');

      expect(result).toBeDefined();
      expect(profilesService.findByUsername).toHaveBeenCalledWith('publicuser', undefined);
    });

    it('should return ProfileEntity with correct properties', async () => {
      const req = { user: { id: 1, username: 'testuser', email: 'test@example.com' } };

      profilesService.findByUsername.mockResolvedValue(mockProfileEntity as any);

      const result = await controller.findByUsername(req, 'testuser');

      expect(result).toHaveProperty('username');
      expect(result).toHaveProperty('joinedAt');
      expect(result).toHaveProperty('daysTrackedTotal');
    });
  });

  describe('findManyByUsername', () => {
    it('should return goals for authenticated user', async () => {
      const req = { user: { id: 1, username: 'testuser', email: 'test@example.com' } };

      goalsService.findManyByUsername.mockResolvedValue(mockGoals as any);

      const result = await controller.findManyByUsername(req, 'testuser');

      expect(result).toEqual(mockGoals);
      expect(goalsService.findManyByUsername).toHaveBeenCalledWith('testuser', 1);
    });

    it('should return only public goals for non-owner', async () => {
      const req = { user: { id: 99, username: 'viewer', email: 'viewer@example.com' } };

      const publicGoalsOnly = mockGoals.filter(g => g.publicity === GoalPublicity.PUBLIC);
      goalsService.findManyByUsername.mockResolvedValue(publicGoalsOnly as any);

      const result = await controller.findManyByUsername(req, 'testuser');

      expect(result).toEqual(publicGoalsOnly);
      expect(result.every(g => g.publicity === GoalPublicity.PUBLIC)).toBe(true);
    });

    it('should return all goals including private for owner', async () => {
      const req = { user: { id: 1, username: 'testuser', email: 'test@example.com' } };

      const allGoals = [...mockGoals, mockPrivateGoals[0]];
      goalsService.findManyByUsername.mockResolvedValue(allGoals as any);

      const result = await controller.findManyByUsername(req, 'testuser');

      expect(result).toEqual(allGoals);
      expect(result.length).toBe(3);
    });

    it('should extract userId from authenticated user', async () => {
      const req = { user: { id: 42, username: 'otheruser', email: 'other@example.com' } };

      goalsService.findManyByUsername.mockResolvedValue(mockGoals as any);

      await controller.findManyByUsername(req, 'testuser');

      expect(goalsService.findManyByUsername).toHaveBeenCalledWith('testuser', 42);
    });

    it('should return empty array when user has no goals', async () => {
      const req = { user: { id: 1, username: 'testuser', email: 'test@example.com' } };

      goalsService.findManyByUsername.mockResolvedValue([]);

      const result = await controller.findManyByUsername(req, 'newuser');

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it('should handle unauthenticated user access with OptionalJwtAuthGuard', async () => {
      const req = { user: undefined };

      goalsService.findManyByUsername.mockResolvedValue(mockGoals as any);

      const result = await controller.findManyByUsername(req, 'publicuser');

      expect(result).toBeDefined();
      expect(goalsService.findManyByUsername).toHaveBeenCalledWith('publicuser', undefined);
    });

    it('should throw error when user not found', async () => {
      const req = { user: { id: 1, username: 'testuser', email: 'test@example.com' } };

      goalsService.findManyByUsername.mockRejectedValue(
        new Error('User not found'),
      );

      await expect(
        controller.findManyByUsername(req, 'nonexistent'),
      ).rejects.toThrow('User not found');
    });

    it('should handle different goal types in response', async () => {
      const req = { user: { id: 1, username: 'testuser', email: 'test@example.com' } };

      goalsService.findManyByUsername.mockResolvedValue(mockGoals as any);

      const result = await controller.findManyByUsername(req, 'testuser');

      const booleanGoal = result.find(g => g.goalType === GoalQuantify.BOOLEAN);
      const numericGoal = result.find(g => g.goalType === GoalQuantify.NUMERIC);

      expect(booleanGoal).toBeDefined();
      expect(numericGoal).toBeDefined();
    });

    it('should return goals with correct properties', async () => {
      const req = { user: { id: 1, username: 'testuser', email: 'test@example.com' } };

      goalsService.findManyByUsername.mockResolvedValue(mockGoals as any);

      const result = await controller.findManyByUsername(req, 'testuser');

      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('title');
      expect(result[0]).toHaveProperty('description');
      expect(result[0]).toHaveProperty('colour');
      expect(result[0]).toHaveProperty('icon');
      expect(result[0]).toHaveProperty('publicity');
      expect(result[0]).toHaveProperty('goalType');
      expect(result[0]).toHaveProperty('userId');
      expect(result[0]).toHaveProperty('visibility');
      expect(result[0]).toHaveProperty('order');
    });

    it('should return goals for multiple different users', async () => {
      const req1 = { user: { id: 1, username: 'user1', email: 'user1@example.com' } };
      const req2 = { user: { id: 2, username: 'user2', email: 'user2@example.com' } };

      goalsService.findManyByUsername.mockResolvedValue(mockGoals as any);

      await controller.findManyByUsername(req1, 'testuser');
      await controller.findManyByUsername(req2, 'testuser');

      expect(goalsService.findManyByUsername).toHaveBeenNthCalledWith(
        1,
        'testuser',
        1,
      );
      expect(goalsService.findManyByUsername).toHaveBeenNthCalledWith(
        2,
        'testuser',
        2,
      );
    });

    it('should return goals ordered by order property', async () => {
      const req = { user: { id: 1, username: 'testuser', email: 'test@example.com' } };

      goalsService.findManyByUsername.mockResolvedValue(mockGoals as any);

      const result = await controller.findManyByUsername(req, 'testuser');

      expect(result[0].order).toBeLessThan(result[1].order);
    });

    it('should return visible goals only', async () => {
      const req = { user: { id: 1, username: 'testuser', email: 'test@example.com' } };

      goalsService.findManyByUsername.mockResolvedValue(mockGoals as any);

      const result = await controller.findManyByUsername(req, 'testuser');

      expect(result.every(g => g.visibility === true)).toBe(true);
    });
  });

  describe('authorization with OptionalJwtAuthGuard', () => {
    it('should allow unauthenticated access to public profiles', async () => {
      const req = { user: undefined };

      profilesService.findByUsername.mockResolvedValue(mockProfileEntity as any);

      const result = await controller.findByUsername(req, 'publicuser');

      expect(result).toBeDefined();
    });

    it('should allow authenticated access with valid token', async () => {
      const req = { user: { id: 1, username: 'testuser', email: 'test@example.com' } };

      profilesService.findByUsername.mockResolvedValue(mockProfileEntity as any);

      const result = await controller.findByUsername(req, 'testuser');

      expect(result).toBeDefined();
    });

    it('should differentiate between owner and non-owner for private profiles', async () => {
      const ownerReq = { user: { id: 2, username: 'privateuser', email: 'private@example.com' } };
      const viewerReq = { user: { id: 1, username: 'testuser', email: 'test@example.com' } };

      profilesService.findByUsername.mockResolvedValue(mockProfileEntity as any);
      profilesService.findByUsername.mockResolvedValueOnce(mockProfileEntityPrivate as any);

      const ownerResult = await controller.findByUsername(ownerReq, 'privateuser');
      const viewerResult = await controller.findByUsername(viewerReq, 'privateuser');

      expect(ownerResult.joinedAt).toBeUndefined();
      expect(viewerResult.joinedAt).toBeDefined();
    });
  });
});
