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
  Req,
  UseGuards,
} from '@nestjs/common';
import { GoalEntriesService } from './goalEntries.service';
import {
  CreateGoalEntryDto,
  CreateGoalEntrySchema,
  SearchParamsGoalEntryDto,
  SearchParamsGoalEntrySchema,
  UpdateGoalEntryDto,
  UpdateGoalEntrySchema,
  GoalStatisticsReponse,
} from '@habit-tracker/shared';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GoalEntryEntity } from './goalEntry.entity';
import { ZodValidationPipe } from 'src/common/zod/zod-validation.pipe';
import { GoalStatisticsEntity } from './goalStatistics.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from 'src/auth/optional-jwt-auth.guard';

@Controller()
@ApiTags('Entries')
export class GoalEntriesController {
  constructor(private readonly goalEntriesService: GoalEntriesService) {}

  /**
   * Statistics-specific
   */
  @UseGuards(JwtAuthGuard)
  @Get('entries/statistics')
  @ApiOkResponse({ type: GoalStatisticsEntity })
  getStatistics(
    @Req() req,
    @Query('goalId', ParseIntPipe) goalId: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    const userId = req.user.id;
    return this.goalEntriesService.getStatistics(goalId, year, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('entries/monthly-averages')
  @ApiOkResponse({ type: GoalStatisticsEntity })
  getMonthlyAverages(
    @Req() req,
    @Query('goalId', ParseIntPipe) goalId: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    const userId = req.user.id;
    return this.goalEntriesService.getMonthlyAverages(goalId, year, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('entries/monthly-counts')
  @ApiOkResponse({ type: GoalStatisticsEntity })
  getMonthlyCounts(
    @Req() req,
    @Query('goalId', ParseIntPipe) goalId: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    const userId = req.user.id;
    return this.goalEntriesService.getMonthlyCounts(goalId, year, userId);
  }

  /**
   * General
   */

  /**
   * Get entries from search params (goal ID and year)
   * @param searchParamsGoalEntryDto
   * @returns
   */
  @UseGuards(OptionalJwtAuthGuard)
  @Get('entries')
  @ApiOkResponse({ type: GoalEntryEntity, isArray: true })
  findManyBySearchParams(
    @Req() req,
    @Query() searchParamsGoalEntryDto: SearchParamsGoalEntryDto,
  ) {
    const userId = req.user.id;

    // TODOs #30: Need to ensure findMany respects profile publicity (all other places also need to respect profile publicity)
    // TODOs #32: refactor this to use Zod validation pipe instead of manual call to .safeParse
    const parsed = SearchParamsGoalEntrySchema.safeParse(
      searchParamsGoalEntryDto,
    );
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    return this.goalEntriesService.findMany(parsed.data, userId);
  }

  /**
   * Get entries from goal ID (year undefined)
   * @param searchParamsGoalEntryDto
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @Get('entries/:entryId')
  @ApiOkResponse({ type: GoalEntryEntity })
  findOne(@Req() req, @Param('entryId', ParseIntPipe) entryId: number) {
    const userId = req.user.id;
    return this.goalEntriesService.findOne(entryId, userId);
  }

  /**
   * Get entries from goal ID (year undefined)
   * @param searchParamsGoalEntryDto
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @Get('goals/:goalId/entries')
  @ApiOkResponse({ type: GoalEntryEntity, isArray: true })
  findManyByGoalId(@Req() req, @Param('goalId', ParseIntPipe) goalId: number) {
    const userId = req.user.id;
    return this.goalEntriesService.findMany(
      { goalId: goalId, year: undefined },
      userId,
    );
  }

  /**
   * Create a goal entry for a given goal
   * @param goalId
   * @param createGoalEntryDto
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @Post('goals/:goalId/entries')
  @ApiCreatedResponse({ type: GoalEntryEntity })
  create(
    @Req() req,
    @Param('goalId', ParseIntPipe) goalId: number,
    @Body(new ZodValidationPipe(CreateGoalEntrySchema))
    createGoalEntryDto: CreateGoalEntryDto,
  ) {
    const userId = req.user.id;
    return this.goalEntriesService.create(goalId, createGoalEntryDto, userId);
  }

  /**
   * Edit a goal entry
   * @param id
   * @param updateGoalEntryDto
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @Patch('goals/:goalId/entries/:entryId')
  @ApiCreatedResponse({ type: GoalEntryEntity })
  update(
    @Req() req,
    @Param('goalId', ParseIntPipe) goalId: number,
    @Param('entryId', ParseIntPipe) entryId: number,
    @Body(new ZodValidationPipe(UpdateGoalEntrySchema))
    updateGoalEntryDto: UpdateGoalEntryDto,
  ) {
    const userId = req.user.id;
    return this.goalEntriesService.update(
      goalId,
      entryId,
      updateGoalEntryDto,
      userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('goals/:goalId/entries/:entryId')
  @ApiOkResponse({ type: GoalEntryEntity })
  remove(
    @Req() req,
    @Param('goalId', ParseIntPipe) goalId: number,
    @Param('entryId', ParseIntPipe) entryId: number,
  ) {
    const userId = req.user.id;
    return this.goalEntriesService.remove(goalId, entryId, userId);
  }
}
