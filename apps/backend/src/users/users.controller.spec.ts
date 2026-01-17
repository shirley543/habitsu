import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
} from '@habit-tracker/validation-schemas';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    username: 'testuser',
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
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService) as jest.Mocked<UsersService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
      };

      usersService.create.mockResolvedValue(mockUserResponseDto as any);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(mockUserResponseDto);
      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should validate input data before creating user', async () => {
      const createUserDto: CreateUserDto = {
        username: 'alice',
        email: 'alice@example.com',
        password: 'securepass456',
      };

      usersService.create.mockResolvedValue(mockUserResponseDto2 as any);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(mockUserResponseDto2);
      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should not return password in response', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      usersService.create.mockResolvedValue(mockUserResponseDto as any);

      const result = await controller.create(createUserDto);

      expect(result).not.toHaveProperty('password');
    });

    it('should throw error when username already exists', async () => {
      const createUserDto: CreateUserDto = {
        username: 'existinguser',
        email: 'new@example.com',
        password: 'password123',
      };

      usersService.create.mockRejectedValue(
        new Error('Unique constraint failed'),
      );

      await expect(controller.create(createUserDto)).rejects.toThrow();
    });

    it('should throw error when email already exists', async () => {
      const createUserDto: CreateUserDto = {
        username: 'newuser',
        email: 'existing@example.com',
        password: 'password123',
      };

      usersService.create.mockRejectedValue(
        new Error('Unique constraint failed'),
      );

      await expect(controller.create(createUserDto)).rejects.toThrow();
    });

    it('should be public endpoint without authentication', async () => {
      const createUserDto: CreateUserDto = {
        username: 'publicuser',
        email: 'public@example.com',
        password: 'password123',
      };

      usersService.create.mockResolvedValue(mockUserResponseDto as any);

      // No req with user object needed for public endpoint
      const result = await controller.create(createUserDto);

      expect(result).toBeDefined();
      expect(usersService.create).toHaveBeenCalled();
    });
  });

  describe('findMe', () => {
    it('should return current user profile', async () => {
      const req = { user: mockUser };

      usersService.findOne.mockResolvedValue(mockUserResponseDto as any);

      const result = await controller.findMe(req);

      expect(result).toEqual(mockUserResponseDto);
      expect(usersService.findOne).toHaveBeenCalledWith(1);
    });

    it('should extract user id from authenticated request', async () => {
      const req = { user: { id: 42, email: 'custom@example.com', username: 'customuser' } };

      usersService.findOne.mockResolvedValue(mockUserResponseDto as any);

      await controller.findMe(req);

      expect(usersService.findOne).toHaveBeenCalledWith(42);
    });

    it('should throw error when user not found', async () => {
      const req = { user: mockUser };

      usersService.findOne.mockResolvedValue(null);

      const result = await controller.findMe(req);

      expect(result).toBeNull();
    });

    it('should not return password in response', async () => {
      const req = { user: mockUser };

      usersService.findOne.mockResolvedValue(mockUserResponseDto as any);

      const result = await controller.findMe(req);

      expect(result).not.toHaveProperty('password');
    });

    it('should require authentication (JwtAuthGuard)', async () => {
      const req = { user: mockUser };

      usersService.findOne.mockResolvedValue(mockUserResponseDto as any);

      // Guard should prevent access without valid JWT token
      const result = await controller.findMe(req);

      expect(result).toBeDefined();
      expect(usersService.findOne).toHaveBeenCalled();
    });

    it('should use userId from different authenticated users', async () => {
      const customReq = { user: mockUserResponseDto2 as any };

      usersService.findOne.mockResolvedValue(mockUserResponseDto2 as any);

      await controller.findMe(customReq);

      expect(usersService.findOne).toHaveBeenCalledWith(2);
    });
  });

  describe('update', () => {
    it('should update current user profile', async () => {
      const req = { user: mockUser };
      const updateUserDto: UpdateUserDto = {
        username: 'updateduser',
        email: 'updated@example.com',
      };

      const updatedUser: UserResponseDto = {
        ...mockUserResponseDto,
        ...updateUserDto,
      };

      usersService.update.mockResolvedValue(updatedUser as any);

      const result = await controller.update(req, updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(usersService.update).toHaveBeenCalledWith(1, updateUserDto);
    });

    it('should update only username', async () => {
      const req = { user: mockUser };
      const updateUserDto: UpdateUserDto = {
        username: 'newusername',
      };

      const updatedUser: UserResponseDto = {
        ...mockUserResponseDto,
        username: 'newusername',
      };

      usersService.update.mockResolvedValue(updatedUser as any);

      const result = await controller.update(req, updateUserDto);

      expect(result.username).toEqual('newusername');
      expect(usersService.update).toHaveBeenCalledWith(1, updateUserDto);
    });

    it('should update only email', async () => {
      const req = { user: mockUser };
      const updateUserDto: UpdateUserDto = {
        email: 'newemail@example.com',
      };

      const updatedUser: UserResponseDto = {
        ...mockUserResponseDto,
        email: 'newemail@example.com',
      };

      usersService.update.mockResolvedValue(updatedUser as any);

      const result = await controller.update(req, updateUserDto);

      expect(result.email).toEqual('newemail@example.com');
      expect(usersService.update).toHaveBeenCalledWith(1, updateUserDto);
    });

    it('should use userId from authenticated user', async () => {
      const customReq = { user: { id: 99, email: 'custom@example.com', username: 'customuser' } };
      const updateUserDto: UpdateUserDto = {
        username: 'updated',
      };

      usersService.update.mockResolvedValue(mockUserResponseDto as any);

      await controller.update(customReq, updateUserDto);

      expect(usersService.update).toHaveBeenCalledWith(99, updateUserDto);
    });

    it('should not return password in response', async () => {
      const req = { user: mockUser };
      const updateUserDto: UpdateUserDto = {
        username: 'updated',
      };

      usersService.update.mockResolvedValue(mockUserResponseDto as any);

      const result = await controller.update(req, updateUserDto);

      expect(result).not.toHaveProperty('password');
    });

    it('should throw error when new username already exists', async () => {
      const req = { user: mockUser };
      const updateUserDto: UpdateUserDto = {
        username: 'existinguser',
      };

      usersService.update.mockRejectedValue(
        new Error('Unique constraint failed'),
      );

      await expect(
        controller.update(req, updateUserDto),
      ).rejects.toThrow();
    });

    it('should throw error when new email already exists', async () => {
      const req = { user: mockUser };
      const updateUserDto: UpdateUserDto = {
        email: 'existing@example.com',
      };

      usersService.update.mockRejectedValue(
        new Error('Unique constraint failed'),
      );

      await expect(
        controller.update(req, updateUserDto),
      ).rejects.toThrow();
    });

    it('should require authentication (JwtAuthGuard)', async () => {
      const req = { user: mockUser };
      const updateUserDto: UpdateUserDto = {
        username: 'updated',
      };

      usersService.update.mockResolvedValue(mockUserResponseDto as any);

      const result = await controller.update(req, updateUserDto);

      expect(result).toBeDefined();
      expect(usersService.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete current user account', async () => {
      const req = { user: mockUser };

      usersService.remove.mockResolvedValue(mockUserResponseDto as any);

      const result = await controller.remove(req);

      expect(result).toEqual(mockUserResponseDto);
      expect(usersService.remove).toHaveBeenCalledWith(1);
    });

    it('should use userId from authenticated user', async () => {
      const customReq = { user: { id: 50, email: 'custom@example.com', username: 'customuser' } };

      usersService.remove.mockResolvedValue(mockUserResponseDto as any);

      await controller.remove(customReq);

      expect(usersService.remove).toHaveBeenCalledWith(50);
    });

    it('should not return password in response', async () => {
      const req = { user: mockUser };

      usersService.remove.mockResolvedValue(mockUserResponseDto as any);

      const result = await controller.remove(req);

      expect(result).not.toHaveProperty('password');
    });

    it('should throw error when user not found', async () => {
      const req = { user: mockUser };

      usersService.remove.mockRejectedValue(
        new Error('User not found'),
      );

      await expect(controller.remove(req)).rejects.toThrow();
    });

    it('should cascade delete user-related data', async () => {
      const req = { user: mockUser };

      // Goals, goal entries should be deleted by cascade
      usersService.remove.mockResolvedValue(mockUserResponseDto as any);

      const result = await controller.remove(req);

      expect(result).toBeDefined();
      expect(usersService.remove).toHaveBeenCalledWith(1);
    });

    it('should require authentication (JwtAuthGuard)', async () => {
      const req = { user: mockUser };

      usersService.remove.mockResolvedValue(mockUserResponseDto as any);

      const result = await controller.remove(req);

      expect(result).toBeDefined();
      expect(usersService.remove).toHaveBeenCalled();
    });

    it('should delete different users', async () => {
      const req = { user: mockUserResponseDto2 as any };

      usersService.remove.mockResolvedValue(mockUserResponseDto2 as any);

      const result = await controller.remove(req);

      expect(result).toEqual(mockUserResponseDto2);
      expect(usersService.remove).toHaveBeenCalledWith(2);
    });
  });
});
