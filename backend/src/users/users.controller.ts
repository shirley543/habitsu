import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, CreateUserSchema, UpdateUserSchema, UserResponseDto } from '@habit-tracker/shared';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiProperty, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'src/common/zod/zod-validation.pipe';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

/**
 * Private types
 */

class UserResponseDtoClass implements UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'alice' })
  username: string;

  @ApiProperty({ example: 'alice@alice.com'})
  email: string;
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
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiCreatedResponse({ type: UserResponseDtoClass })
  @ApiBody({ type: CreateUserDtoClass })
  create(@Body(new ZodValidationPipe(CreateUserSchema)) createUserDto: CreateUserDto) {
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

  // TODOs:
  // - Check swagger doc generation, and include more descriptive endpoint explanations
  // - Add conversion of prisma errors to nest js exceptions (with nest js auto-converting said exceptions into correct HTTP status codes) in service
}
