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
import { CreateGoalDto, CreateGoalSchema, ReorderGoalDto, ReorderGoalSchema, UpdateGoalDto, UpdateGoalSchema } from './goals.dtos';
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
  findAll(
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.goalsService.findAll(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOkResponse({ type: GoalEntity })
  findOne(
    @Req() req,
    @Param('id', ParseIntPipe) id: number
  ) {
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
