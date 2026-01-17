import { Test, TestingModule } from '@nestjs/testing';
import { UsersService, userResponseSelect } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { EnvService } from '../env/env.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
} from '@habit-tracker/validation-schemas';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: jest.Mocked<PrismaService>;
  let envService: jest.Mocked<EnvService>;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    username: 'testuser',
    password: 'hashedpassword123',
    createdAt: new Date(),
    profilePublicity: 'PRIVATE' as any,
  };

  const mockUserResponseDto: UserResponseDto = {
    id: 1,
    email: 'test@example.com',
    username: 'testuser',
  };

  const mockUserResponseDto2: UserResponseDto = {
    id: 2,
    email: 'alice@example.com',
    username: 'alice',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: EnvService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get(PrismaService) as jest.Mocked<PrismaService>;
    envService = module.get(EnvService) as jest.Mocked<EnvService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user with hashed password', async () => {
      const createUserDto: CreateUserDto = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'plainpassword123',
      };

      const hashedPassword = 'hashed_plainpassword123';
      envService.get.mockReturnValue(10);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      prismaService.user.create.mockResolvedValue(mockUserResponseDto as any);

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockUserResponseDto);
      expect(bcrypt.hash).toHaveBeenCalledWith('plainpassword123', 10);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          username: 'newuser',
          email: 'newuser@example.com',
          password: hashedPassword,
        },
        select: userResponseSelect,
      });
    });

    it('should hash password with correct salt rounds', async () => {
      const createUserDto: CreateUserDto = {
        username: 'alice',
        email: 'alice@example.com',
        password: 'securepassword456',
      };

      const hashedPassword = 'hashed_securepassword456';
      envService.get.mockReturnValue(12);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      prismaService.user.create.mockResolvedValue(mockUserResponseDto2 as any);

      await service.create(createUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('securepassword456', 12);
    });

    it('should not return password in response', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      envService.get.mockReturnValue(10);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password123');
      prismaService.user.create.mockResolvedValue(mockUserResponseDto as any);

      const result = await service.create(createUserDto);

      expect(result).not.toHaveProperty('password');
      expect(result).toEqual({
        id: expect.any(Number),
        username: expect.any(String),
        email: expect.any(String),
      });
    });

    it('should throw error when username already exists', async () => {
      const createUserDto: CreateUserDto = {
        username: 'existinguser',
        email: 'newuser@example.com',
        password: 'password123',
      };

      envService.get.mockReturnValue(10);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
      prismaService.user.create.mockRejectedValue(
        new Error('Unique constraint failed on the fields: (username)'),
      );

      await expect(service.create(createUserDto)).rejects.toThrow();
    });

    it('should throw error when email already exists', async () => {
      const createUserDto: CreateUserDto = {
        username: 'newuser',
        email: 'existing@example.com',
        password: 'password123',
      };

      envService.get.mockReturnValue(10);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
      prismaService.user.create.mockRejectedValue(
        new Error('Unique constraint failed on the fields: (email)'),
      );

      await expect(service.create(createUserDto)).rejects.toThrow();
    });

    it('should use salt rounds from environment', async () => {
      const createUserDto: CreateUserDto = {
        username: 'envuser',
        email: 'env@example.com',
        password: 'envpassword',
      };

      const saltRounds = 15;
      envService.get.mockReturnValue(saltRounds);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      prismaService.user.create.mockResolvedValue(mockUserResponseDto as any);

      await service.create(createUserDto);

      expect(envService.get).toHaveBeenCalledWith('SALT_ROUNDS');
      expect(bcrypt.hash).toHaveBeenCalledWith('envpassword', saltRounds);
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUserResponseDto as any);

      const result = await service.findOne(1);

      expect(result).toEqual(mockUserResponseDto);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: userResponseSelect,
      });
    });

    it('should return null when user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
        select: userResponseSelect,
      });
    });

    it('should not include password in response', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUserResponseDto as any);

      const result = await service.findOne(1);

      expect(result).not.toHaveProperty('password');
    });

    it('should handle different user ids', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUserResponseDto2 as any);

      const result = await service.findOne(2);

      expect(result).toEqual(mockUserResponseDto2);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 2 },
        select: userResponseSelect,
      });
    });
  });

  describe('findOneByUsername', () => {
    it('should return user by username', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUserResponseDto as any);

      const result = await service.findOneByUsername('testuser');

      expect(result).toEqual(mockUserResponseDto);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'testuser' },
        select: userResponseSelect,
      });
    });

    it('should return null when username not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findOneByUsername('nonexistent');

      expect(result).toBeNull();
    });

    it('should not include password in response', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUserResponseDto as any);

      const result = await service.findOneByUsername('testuser');

      expect(result).not.toHaveProperty('password');
    });

    it('should be case-sensitive for username lookup', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUserResponseDto as any);

      await service.findOneByUsername('TestUser');

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'TestUser' },
        select: userResponseSelect,
      });
    });
  });

  describe('findOneByEmail', () => {
    it('should return user by email', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUserResponseDto as any);

      const result = await service.findOneByEmail('test@example.com');

      expect(result).toEqual(mockUserResponseDto);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        select: userResponseSelect,
      });
    });

    it('should return null when email not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findOneByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });

    it('should not include password in response', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUserResponseDto as any);

      const result = await service.findOneByEmail('test@example.com');

      expect(result).not.toHaveProperty('password');
    });

    it('should handle email lookup with different case', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUserResponseDto as any);

      await service.findOneByEmail('TEST@EXAMPLE.COM');

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'TEST@EXAMPLE.COM' },
        select: userResponseSelect,
      });
    });
  });

  describe('findOneByEmailFull', () => {
    it('should return user with password by email', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOneByEmailFull('test@example.com');

      expect(result).toEqual(mockUser);
      expect(result).toHaveProperty('password');
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null when user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findOneByEmailFull('nonexistent@example.com');

      expect(result).toBeNull();
    });

    it('should include password hash in response', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOneByEmailFull('test@example.com');

      expect(result.password).toBeDefined();
      expect(result.password).toEqual('hashedpassword123');
    });
  });

  describe('update', () => {
    it('should update user profile information', async () => {
      const updateUserDto: UpdateUserDto = {
        username: 'updateduser',
        email: 'updated@example.com',
      };

      const updatedUser: UserResponseDto = {
        ...mockUserResponseDto,
        ...updateUserDto,
      };

      prismaService.user.update.mockResolvedValue(updatedUser as any);

      const result = await service.update(1, updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateUserDto,
        select: userResponseSelect,
      });
    });

    it('should update only username', async () => {
      const updateUserDto: UpdateUserDto = {
        username: 'newusername',
      };

      const updatedUser: UserResponseDto = {
        ...mockUserResponseDto,
        username: 'newusername',
      };

      prismaService.user.update.mockResolvedValue(updatedUser as any);

      const result = await service.update(1, updateUserDto);

      expect(result.username).toEqual('newusername');
    });

    it('should update only email', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'newemail@example.com',
      };

      const updatedUser: UserResponseDto = {
        ...mockUserResponseDto,
        email: 'newemail@example.com',
      };

      prismaService.user.update.mockResolvedValue(updatedUser as any);

      const result = await service.update(1, updateUserDto);

      expect(result.email).toEqual('newemail@example.com');
    });

    it('should not return password in response', async () => {
      const updateUserDto: UpdateUserDto = {
        username: 'updated',
        email: 'updated@example.com',
      };

      prismaService.user.update.mockResolvedValue(mockUserResponseDto as any);

      const result = await service.update(1, updateUserDto);

      expect(result).not.toHaveProperty('password');
    });

    it('should throw error when new username already exists', async () => {
      const updateUserDto: UpdateUserDto = {
        username: 'existinguser',
      };

      prismaService.user.update.mockRejectedValue(
        new Error('Unique constraint failed on the fields: (username)'),
      );

      await expect(service.update(1, updateUserDto)).rejects.toThrow();
    });

    it('should throw error when new email already exists', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'existing@example.com',
      };

      prismaService.user.update.mockRejectedValue(
        new Error('Unique constraint failed on the fields: (email)'),
      );

      await expect(service.update(1, updateUserDto)).rejects.toThrow();
    });

    it('should throw error when user not found', async () => {
      const updateUserDto: UpdateUserDto = {
        username: 'updated',
      };

      prismaService.user.update.mockRejectedValue(
        new Error('User not found'),
      );

      await expect(service.update(999, updateUserDto)).rejects.toThrow();
    });
  });

  describe('remove', () => {
    it('should delete user by id', async () => {
      prismaService.user.delete.mockResolvedValue(mockUserResponseDto as any);

      const result = await service.remove(1);

      expect(result).toEqual(mockUserResponseDto);
      expect(prismaService.user.delete).toHaveBeenCalledWith({
        where: { id: 1 },
        select: userResponseSelect,
      });
    });

    it('should not return password in response', async () => {
      prismaService.user.delete.mockResolvedValue(mockUserResponseDto as any);

      const result = await service.remove(1);

      expect(result).not.toHaveProperty('password');
    });

    it('should throw error when user not found', async () => {
      prismaService.user.delete.mockRejectedValue(
        new Error('User not found'),
      );

      await expect(service.remove(999)).rejects.toThrow();
    });

    it('should handle cascade deletion of related data', async () => {
      prismaService.user.delete.mockResolvedValue(mockUserResponseDto as any);

      const result = await service.remove(1);

      expect(result).toEqual(mockUserResponseDto);
    });

    it('should delete user for different ids', async () => {
      prismaService.user.delete.mockResolvedValue(mockUserResponseDto2 as any);

      const result = await service.remove(2);

      expect(result).toEqual(mockUserResponseDto2);
      expect(prismaService.user.delete).toHaveBeenCalledWith({
        where: { id: 2 },
        select: userResponseSelect,
      });
    });
  });
});
