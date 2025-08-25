import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  NotFoundException,
  InternalServerErrorException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { GoalsService } from './goals.service';
import { CreateGoalDto, CreateGoalSchema, ReorderGoalDto, ReorderGoalSchema, UpdateGoalDto, UpdateGoalSchema } from '@habit-tracker/shared';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GoalEntity } from './goal.entity';
import { ZodValidationPipe } from 'src/common/zod/zod-validation.pipe';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('goals')
@ApiTags('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiCreatedResponse({ type: GoalEntity })
  // @ApiBody({}) // TODOs: update to format API body properly with Swagger/ OpenAPI.
  create(
    @Req() req,
    @Body(new ZodValidationPipe(CreateGoalSchema)) createGoalDto: CreateGoalDto
  ) {
    const userId = req.user.id;
    return this.goalsService.create(createGoalDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOkResponse({ type: GoalEntity, isArray: true })
  // TODOssss how to align this with zod schema to avoid mismatches? zod schema implements goal entity?
  // No, should keep decoupled and have mapper functions between DTOs (zod) and Prisma entities.
  // Reason: decoupling (what if change Prisma to another ORM or do DB normalization so schema changes, but want DTOs/ contract between FE and BE to remain the same?)
  findAll(
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.goalsService.findAll(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:username')
  @ApiOkResponse({ type: GoalEntity, isArray: true })
  findManyByUsername(
    @Req() req,
    @Param('username') username: string
  ) {
    const userId = req.user.id;
    return this.goalsService.findManyByUsername(username, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOkResponse({ type: GoalEntity })
  findOne(
    @Req() req,
    @Param('id', ParseIntPipe) id: number
  ) {
    // TODOs: more error catching and mapping prisma errors to other errors.
    // if instance of error is other generic exception, keep error type the same.
    // TODOs: revisit. feels stinky; handling of a mixture of both prisma client errors + own thrown errors.
    const userId = req.user.id;
    return this.goalsService.findOne(id, userId).catch((error) => {
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2025':
            console.error(error);
            throw new NotFoundException(error);
          default:
            throw new InternalServerErrorException(error);
        }
      }
    });
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiCreatedResponse({ type: GoalEntity })
  update(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateGoalSchema)) updateGoalDto: UpdateGoalDto,
  ) {
    const userId = req.user.id;
    return this.goalsService.update(id, updateGoalDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOkResponse({ type: GoalEntity })
  remove(
    @Req() req,
    @Param('id', ParseIntPipe) id: number
  ) {
    const userId = req.user.id;
    return this.goalsService.remove(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/reorder')
  @ApiOkResponse()
  reorder(
    @Req() req,
    @Body(new ZodValidationPipe(ReorderGoalSchema)) reorderGoalDto: ReorderGoalDto)
  {
    const userId = req.user.id;
    return this.goalsService.reorder(reorderGoalDto, userId);
  }
}
