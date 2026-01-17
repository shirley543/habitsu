import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesService } from './profiles.service';
import { PrismaService } from '../prisma/prisma.service';
import { GoalPublicity, ProfilePublicity } from '@prisma/client';
import { ProfileEntity } from './profiles.entity';

describe('ProfilesService', () => {
  let service: ProfilesService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedpassword',
    createdAt: new Date('2025-01-01'),
    profilePublicity: ProfilePublicity.PUBLIC,
  };

  const mockPrivateUser = {
    id: 2,
    username: 'privateuser',
    email: 'private@example.com',
    password: 'hashedpassword',
    createdAt: new Date('2024-06-15'),
    profilePublicity: ProfilePublicity.PRIVATE,
  };

  const mockGoalEntries = [
    { entryDate: new Date('2025-01-15'), goalId: 1 },
    { entryDate: new Date('2025-01-20'), goalId: 1 },
    { entryDate: new Date('2025-02-10'), goalId: 2 },
    { entryDate: new Date('2025-02-15'), goalId: 2 },
    { entryDate: new Date('2025-02-20'), goalId: 2 },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfilesService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
            goalEntry: {
              groupBy: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ProfilesService>(ProfilesService);
    prismaService = module.get(PrismaService) as jest.Mocked<PrismaService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByUsername', () => {
    describe('when user is owner and profile is private', () => {
      it('should return all profile data for owner', async () => {
        prismaService.user.findUnique.mockResolvedValue(mockPrivateUser as any);
        prismaService.goalEntry.groupBy.mockResolvedValue(
          mockGoalEntries.slice(0, 3) as any,
        );

        const result = await service.findByUsername('privateuser', 2);

        expect(result).toHaveProperty('username', 'privateuser');
        expect(result).toHaveProperty('joinedAt', mockPrivateUser.createdAt);
        expect(result).toHaveProperty('daysTrackedTotal', 3);
        expect(prismaService.goalEntry.groupBy).toHaveBeenCalled();
      });

      it('should include private goals in days tracked calculation', async () => {
        prismaService.user.findUnique.mockResolvedValue(mockPrivateUser as any);
        prismaService.goalEntry.groupBy.mockResolvedValue(
          mockGoalEntries as any,
        );

        const result = await service.findByUsername('privateuser', 2);

        expect(result.daysTrackedTotal).toBe(5);
        expect(prismaService.goalEntry.groupBy).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              goal: expect.objectContaining({
                user: { username: 'privateuser' },
              }),
            }),
          }),
        );
      });
    });

    describe('when user is owner and profile is public', () => {
      it('should return all profile data including private goals for owner', async () => {
        prismaService.user.findUnique.mockResolvedValue(mockUser as any);
        prismaService.goalEntry.groupBy.mockResolvedValue(
          mockGoalEntries as any,
        );

        const result = await service.findByUsername('testuser', 1);

        expect(result).toHaveProperty('username', 'testuser');
        expect(result).toHaveProperty('joinedAt', mockUser.createdAt);
        expect(result).toHaveProperty('daysTrackedTotal', 5);
      });
    });

    describe('when user is not owner and target profile is public', () => {
      it('should return limited profile data', async () => {
        prismaService.user.findUnique.mockResolvedValue(mockUser as any);
        prismaService.goalEntry.groupBy.mockResolvedValue(
          mockGoalEntries.slice(0, 2) as any,
        );

        const result = await service.findByUsername('testuser', 99);

        expect(result).toHaveProperty('username', 'testuser');
        expect(result).toHaveProperty('joinedAt', mockUser.createdAt);
        expect(result.daysTrackedTotal).toBe(2);
      });

      it('should only count public goals in days tracked', async () => {
        prismaService.user.findUnique.mockResolvedValue(mockUser as any);
        prismaService.goalEntry.groupBy.mockResolvedValue(
          mockGoalEntries.slice(0, 2) as any,
        );

        await service.findByUsername('testuser', 99);

        expect(prismaService.goalEntry.groupBy).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              goal: expect.objectContaining({
                publicity: GoalPublicity.PUBLIC,
              }),
            }),
          }),
        );
      });
    });

    describe('when user is not owner and target profile is private', () => {
      it('should return only username without dates and days tracked', async () => {
        prismaService.user.findUnique.mockResolvedValue(mockPrivateUser as any);
        prismaService.goalEntry.groupBy.mockResolvedValue([]);

        const result = await service.findByUsername('privateuser', 99);

        expect(result).toHaveProperty('username', 'privateuser');
        expect(result.joinedAt).toBeUndefined();
        expect(result.daysTrackedTotal).toBeUndefined();
        // goalEntry.groupBy should not be called for private profiles viewed by non-owners
      });

      it('should not calculate days tracked for non-owners of private profiles', async () => {
        prismaService.user.findUnique.mockResolvedValue(mockPrivateUser as any);

        await service.findByUsername('privateuser', 99);

        // Should not call groupBy since profile is private and user is not owner
        expect(prismaService.goalEntry.groupBy).not.toHaveBeenCalled();
      });
    });

    describe('error handling', () => {
      it('should throw error when user not found', async () => {
        prismaService.user.findUnique.mockResolvedValue(null);

        await expect(
          service.findByUsername('nonexistent', 1),
        ).rejects.toThrow('User not found');
      });

      it('should handle Prisma query errors', async () => {
        prismaService.user.findUnique.mockRejectedValue(
          new Error('Database connection error'),
        );

        await expect(
          service.findByUsername('testuser', 1),
        ).rejects.toThrow('Database connection error');
      });
    });

    describe('days tracked calculation', () => {
      it('should count unique entry dates only once per day', async () => {
        const entriesPerDay = [
          { entryDate: new Date('2025-01-15'), goalId: 1 },
          { entryDate: new Date('2025-01-15'), goalId: 2 }, // same date, different goal
          { entryDate: new Date('2025-01-20'), goalId: 1 },
        ];

        prismaService.user.findUnique.mockResolvedValue(mockUser as any);
        prismaService.goalEntry.groupBy.mockResolvedValue(
          entriesPerDay as any,
        );

        const result = await service.findByUsername('testuser', 1);

        expect(result.daysTrackedTotal).toBe(3);
      });

      it('should return 0 days tracked when user has no entries', async () => {
        prismaService.user.findUnique.mockResolvedValue(mockUser as any);
        prismaService.goalEntry.groupBy.mockResolvedValue([]);

        const result = await service.findByUsername('testuser', 1);

        expect(result.daysTrackedTotal).toBe(0);
      });

      it('should return correct days tracked across multiple months', async () => {
        const multiMonthEntries = [
          { entryDate: new Date('2024-12-31'), goalId: 1 },
          { entryDate: new Date('2025-01-01'), goalId: 1 },
          { entryDate: new Date('2025-02-15'), goalId: 1 },
          { entryDate: new Date('2025-03-10'), goalId: 1 },
        ];

        prismaService.user.findUnique.mockResolvedValue(mockUser as any);
        prismaService.goalEntry.groupBy.mockResolvedValue(
          multiMonthEntries as any,
        );

        const result = await service.findByUsername('testuser', 1);

        expect(result.daysTrackedTotal).toBe(4);
      });
    });

    describe('profile publicity transitions', () => {
      it('should handle user with PUBLIC profile visibility', async () => {
        const publicUser = { ...mockUser, profilePublicity: ProfilePublicity.PUBLIC };
        prismaService.user.findUnique.mockResolvedValue(publicUser as any);
        prismaService.goalEntry.groupBy.mockResolvedValue(
          mockGoalEntries as any,
        );

        const result = await service.findByUsername('testuser', 1);

        expect(result.joinedAt).toBeDefined();
        expect(result.daysTrackedTotal).toBeDefined();
      });

      it('should handle user with PRIVATE profile visibility', async () => {
        const privateUser = { ...mockUser, profilePublicity: ProfilePublicity.PRIVATE };
        prismaService.user.findUnique.mockResolvedValue(privateUser as any);

        const result = await service.findByUsername('testuser', 99);

        expect(result.joinedAt).toBeUndefined();
        expect(result.daysTrackedTotal).toBeUndefined();
      });
    });

    describe('username case sensitivity', () => {
      it('should lookup username with exact case match', async () => {
        prismaService.user.findUnique.mockResolvedValue(mockUser as any);
        prismaService.goalEntry.groupBy.mockResolvedValue(
          mockGoalEntries as any,
        );

        await service.findByUsername('testuser', 1);

        expect(prismaService.user.findUnique).toHaveBeenCalledWith({
          where: { username: 'testuser' },
        });
      });

      it('should handle different username cases in lookup', async () => {
        prismaService.user.findUnique.mockResolvedValue(mockUser as any);
        prismaService.goalEntry.groupBy.mockResolvedValue(
          mockGoalEntries as any,
        );

        await service.findByUsername('TestUser', 1);

        expect(prismaService.user.findUnique).toHaveBeenCalledWith({
          where: { username: 'TestUser' },
        });
      });
    });

    describe('edge cases', () => {
      it('should handle user with creation date in far past', async () => {
        const oldUser = {
          ...mockUser,
          createdAt: new Date('2020-01-01'),
        };

        prismaService.user.findUnique.mockResolvedValue(oldUser as any);
        prismaService.goalEntry.groupBy.mockResolvedValue(
          mockGoalEntries as any,
        );

        const result = await service.findByUsername('testuser', 1);

        expect(result.joinedAt).toEqual(oldUser.createdAt);
      });

      it('should handle requesting user with same id as target user (owner case)', async () => {
        prismaService.user.findUnique.mockResolvedValue(mockUser as any);
        prismaService.goalEntry.groupBy.mockResolvedValue(
          mockGoalEntries as any,
        );

        const result = await service.findByUsername('testuser', 1);

        expect(result.joinedAt).toBeDefined();
        expect(result.daysTrackedTotal).toBeDefined();
      });

      it('should return ProfileEntity with correct type', async () => {
        prismaService.user.findUnique.mockResolvedValue(mockUser as any);
        prismaService.goalEntry.groupBy.mockResolvedValue(
          mockGoalEntries.slice(0, 2) as any,
        );

        const result = await service.findByUsername('testuser', 1);

        expect(result).toHaveProperty('username');
        expect(result).toHaveProperty('joinedAt');
        expect(result).toHaveProperty('daysTrackedTotal');
      });
    });
  });
});
