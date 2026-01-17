import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { ProfilePublicity, User } from '@prisma/client';
import { UserResponseDto } from '@habit-tracker/validation-schemas';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    username: 'testuser',
    password: 'hashedpassword',
    createdAt: new Date(),
    profilePublicity: ProfilePublicity.PRIVATE,
  };

  const { password: _password, ...userNoPassword } = mockUser;
  const mockUserNoPassword: Omit<User, 'password'> = userNoPassword;

  const mockUserResponseDto: UserResponseDto = {
    id: mockUser.id,
    email: mockUser.email,
    username: mockUser.username,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOneByEmailFull: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService) as jest.Mocked<UsersService>;
    jwtService = module.get(JwtService) as jest.Mocked<JwtService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password when credentials are valid', async () => {
      usersService.findOneByEmailFull.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(
        'test@example.com',
        'password123',
      );

      expect(result).toEqual(mockUserNoPassword);
      expect(usersService.findOneByEmailFull).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashedpassword',
      );
    });

    it('should return null when user not found', async () => {
      usersService.findOneByEmailFull.mockResolvedValue(null);

      const result = await service.validateUser(
        'nonexistent@example.com',
        'password123',
      );

      expect(result).toBeNull();
      expect(usersService.findOneByEmailFull).toHaveBeenCalledWith(
        'nonexistent@example.com',
      );
    });

    it('should return null when password is invalid', async () => {
      usersService.findOneByEmailFull.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(
        'test@example.com',
        'wrongpassword',
      );

      expect(result).toBeNull();
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'wrongpassword',
        'hashedpassword',
      );
    });
  });

  describe('login', () => {
    it('should return access token and user', () => {
      const mockToken = 'mock.jwt.token';
      jwtService.sign.mockReturnValue(mockToken);

      const result = service.login(mockUserResponseDto);

      expect(result).toEqual({
        access_token: mockToken,
        user: mockUserResponseDto,
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: 'test@example.com',
        username: 'testuser',
        sub: 1,
      });
    });
  });
});
