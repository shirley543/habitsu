import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  UseGuards,
  Req,
  UseFilters,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  CreateUserSchema,
  UpdateUserSchema,
  UserResponseDto,
  ProfilePublicityType,
} from '@habit-tracker/validation-schemas';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { ZodValidationPipe } from '../common/zod/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserExceptionFilter } from './filters/user.exceptionFilter';

/**
 * Private types
 */

class UserResponseDtoClass implements UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'alice' })
  username: string;

  @ApiProperty({ example: 'alice@alice.com' })
  email: string;

  @ApiProperty({ example: ProfilePublicityType.Public })
  profilePublicity: ProfilePublicityType;
}

class CreateUserDtoClass implements CreateUserDto {
  @ApiProperty({ example: 'alice' })
  username: string;

  @ApiProperty({ example: 'alice@example.com' })
  email: string;

  @ApiProperty({ example: 'strongpassword123' })
  password: string;
}

/**
 * Public controller
 */

@Controller('users')
@UseFilters(UserExceptionFilter)
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiCreatedResponse({ type: UserResponseDtoClass })
  @ApiBody({ type: CreateUserDtoClass })
  create(
    @Body(new ZodValidationPipe(CreateUserSchema)) createUserDto: CreateUserDto,
  ) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserResponseDtoClass })
  findMe(@Req() req) {
    const userId = req.user.id;
    return this.usersService.findOne(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/me')
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserResponseDtoClass })
  update(
    @Req() req,
    @Body(new ZodValidationPipe(UpdateUserSchema)) updateUserDto: UpdateUserDto,
  ) {
    const userId = req.user.id;
    return this.usersService.update(userId, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/me')
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserResponseDtoClass })
  remove(@Req() req) {
    const userId = req.user.id;
    return this.usersService.remove(userId);
  }

  // TODOs #34 Check swagger doc generation, and include more descriptive endpoint explanations
}
