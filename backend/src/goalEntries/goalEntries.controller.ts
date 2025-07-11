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

@Controller()
@ApiTags('Entries')
export class GoalEntriesController {
  constructor(private readonly goalEntriesService: GoalEntriesService) {}

  /**
   * Statistics-specific
   */

  @Get('entries/statistics')
  @ApiOkResponse({ type: GoalStatisticsEntity })
  getStatistics(
    @Query('goalId', ParseIntPipe) goalId: number,
    @Query('year', ParseIntPipe) year: number
  ) {
    return this.goalEntriesService.getStatistics(goalId, year);
  }

  @Get('entries/monthly-averages')
  @ApiOkResponse({ type: GoalStatisticsEntity })
  getMonthlyAverages(
    @Query('goalId', ParseIntPipe) goalId: number,
    @Query('year', ParseIntPipe) year: number
  ) {
    return this.goalEntriesService.getMonthlyAverages(goalId, year);
  }

  @Get('entries/monthly-counts')
  @ApiOkResponse({ type: GoalStatisticsEntity })
  getMonthlyCounts(
    @Query('goalId', ParseIntPipe) goalId: number,
    @Query('year', ParseIntPipe) year: number
  ) {
    return this.goalEntriesService.getMonthlyCounts(goalId, year);
  }

  
  /**
   * General
   */

  /**
   * Get entries from search params (goal ID and year)
   * @param searchParamsGoalEntryDto 
   * @returns 
   */
  @Get('entries')
  @ApiOkResponse({ type: GoalEntryEntity, isArray: true })
  findManyBySearchParams(@Query() searchParamsGoalEntryDto: SearchParamsGoalEntryDto) {
    const parsed = SearchParamsGoalEntrySchema.safeParse(searchParamsGoalEntryDto);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    return this.goalEntriesService.findMany(parsed.data);
  }

  /**
   * Get entries from goal ID (year undefined)
   * @param searchParamsGoalEntryDto 
   * @returns 
   */
  @Get('entries/:entryId')
  @ApiOkResponse({ type: GoalEntryEntity })
  findOne(@Param('entryId', ParseIntPipe) entryId: number,) {
    return this.goalEntriesService.findOne(entryId);
  }

  /**
   * Get entries from goal ID (year undefined)
   * @param searchParamsGoalEntryDto 
   * @returns 
   */
  @Get('goals/:goalId/entries')
  @ApiOkResponse({ type: GoalEntryEntity, isArray: true })
  findManyByGoalId(@Param('goalId', ParseIntPipe) goalId: number,) {
    return this.goalEntriesService.findMany({ goalId: goalId, year: undefined });
  }

  /**
   * Create a goal entry for a given goal
   * @param goalId 
   * @param createGoalEntryDto 
   * @returns 
   */
  @Post('goals/:goalId/entries')
  @ApiCreatedResponse({ type: GoalEntryEntity })
  create(
    @Param('goalId', ParseIntPipe) goalId: number,
    @Body(new ZodValidationPipe(CreateGoalEntrySchema)) createGoalEntryDto: CreateGoalEntryDto
  ) {
    // TODOsss: use goal ID to determine if:
    // - said goal ID is associated with the logged in user
    return this.goalEntriesService.create(goalId, createGoalEntryDto);
  }

  /**
   * Edit a goal entry
   * @param id 
   * @param updateGoalEntryDto 
   * @returns 
   */
  @Patch('goals/:goalId/entries/:entryId')
  @ApiCreatedResponse({ type: GoalEntryEntity })
  update(
    @Param('goalId', ParseIntPipe) goalId: number,
    @Param('entryId', ParseIntPipe) entryId: number,
    @Body(new ZodValidationPipe(UpdateGoalEntrySchema)) updateGoalEntryDto: UpdateGoalEntryDto,
  ) {
    // TODOsss: use goal ID to determine if:
    // - said goal ID is associated with the logged in user OR user has set both their profile public and that goal to be public (shows up on their profile)
    return this.goalEntriesService.update(goalId, entryId, updateGoalEntryDto);
  }

  @Delete('goals/:goalId/entries/:entryId')
  @ApiOkResponse({ type: GoalEntryEntity })
  remove(
    @Param('goalId', ParseIntPipe) goalId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    // TODOsss: use goal ID to determine if:
    // - said goal ID is associated with the logged in user OR user has set both their profile public and that goal to be public (shows up on their profile)
    return this.goalEntriesService.remove(goalId, id);
  }
}
