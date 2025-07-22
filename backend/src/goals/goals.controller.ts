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
} from '@nestjs/common';
import { GoalsService } from './goals.service';
import { CreateGoalDto, CreateGoalSchema, ReorderGoalDto, ReorderGoalSchema, UpdateGoalDto, UpdateGoalSchema } from './goals.dtos';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GoalEntity } from './goal.entity';
import { ZodValidationPipe } from 'src/common/zod/zod-validation.pipe';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Controller('goals')
@ApiTags('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  @ApiCreatedResponse({ type: GoalEntity })
  // @ApiBody({}) // TODOs: update to format API body properly with Swagger/ OpenAPI.
  create(@Body(new ZodValidationPipe(CreateGoalSchema)) createGoalDto: CreateGoalDto) {
    return this.goalsService.create(createGoalDto);
  }

  @Get()
  @ApiOkResponse({ type: GoalEntity, isArray: true })
  // TODOssss how to align this with zod schema to avoid mismatches? zod schema implements goal entity?
  findAll() {
    return this.goalsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: GoalEntity })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.goalsService.findOne(id).catch((error) => {
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

  @Patch(':id')
  @ApiCreatedResponse({ type: GoalEntity })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateGoalSchema)) updateGoalDto: UpdateGoalDto,
  ) {
    return this.goalsService.update(id, updateGoalDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: GoalEntity })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.goalsService.remove(id);
  }

  @Post('/reorder')
  @ApiOkResponse()
  reorder(@Body(new ZodValidationPipe(ReorderGoalSchema)) reorderGoalDto: ReorderGoalDto)
  {
    return this.goalsService.reorder(reorderGoalDto);
  }
}
