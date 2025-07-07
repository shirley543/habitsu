import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { GoalEntriesService } from './goalEntries.service';
import { CreateGoalEntryDto, CreateGoalEntrySchema, SearchParamsGoalEntryDto, SearchParamsGoalEntrySchema, UpdateGoalEntryDto, UpdateGoalEntrySchema, GoalStatisticsReponse } from './goalEntries.dtos';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GoalEntryEntity } from './goalEntry.entity';
import { ZodValidationPipe } from 'src/common/zod/zod-validation.pipe';
import { GoalStatisticsEntity } from './goalStatistics.entity';

@Controller('goalEntries')
@ApiTags('goalEntries')
export class GoalEntriesController {
  constructor(private readonly goalEntriesService: GoalEntriesService) {}

  /**
   * Statistics-specific
   */

  @Get('statistics')
  @ApiOkResponse({ type: GoalStatisticsEntity })
  getStatistics(
    @Query('goalId', ParseIntPipe) goalId: number,
    @Query('year', ParseIntPipe) year: number
  ) {
    return this.goalEntriesService.getStatistics(goalId, year);
  }

  @Get('monthly-averages')
  @ApiOkResponse({ type: GoalStatisticsEntity })
  getMonthlyAverages(
    @Query('goalId', ParseIntPipe) goalId: number,
    @Query('year', ParseIntPipe) year: number
  ) {
    return this.goalEntriesService.getMonthlyAverages(goalId, year);
  }


  /**
   * General
   */

  @Post()
  @ApiCreatedResponse({ type: GoalEntryEntity })
  // @ApiBody({}) // TODOs: update to format API body properly with Swagger/ OpenAPI.
  create(@Body(new ZodValidationPipe(CreateGoalEntrySchema)) createGoalEntryDto: CreateGoalEntryDto) {
    return this.goalEntriesService.create(createGoalEntryDto);
  }

  // @Get()
  // @ApiOkResponse({ type: GoalEntryEntity, isArray: true })
  // findAll() {
  //   return this.goalEntriesService.findAll();
  // }

  @Get()
  @ApiOkResponse({ type: GoalEntryEntity, isArray: true })
  findMany(@Query() searchParamsGoalEntryDto: SearchParamsGoalEntryDto) {
    const parsed = SearchParamsGoalEntrySchema.safeParse(searchParamsGoalEntryDto);

    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    return this.goalEntriesService.findMany(parsed.data);
  }

  @Get(':id')
  @ApiOkResponse({ type: GoalEntryEntity })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.goalEntriesService.findOne(id);
  }

  @Patch(':id')
  @ApiCreatedResponse({ type: GoalEntryEntity })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateGoalEntrySchema)) updateGoalEntryDto: UpdateGoalEntryDto,
  ) {
    return this.goalEntriesService.update(id, updateGoalEntryDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: GoalEntryEntity })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.goalEntriesService.remove(id);
  }
}
