import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GoalEntity } from './entities/goal.entity';

@Controller('goals')
@ApiTags('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  @ApiCreatedResponse({ type: GoalEntity })
  create(@Body() createGoalDto: CreateGoalDto) {
    return this.goalsService.create(createGoalDto);
  }

  @Get()
  @ApiOkResponse({ type: GoalEntity, isArray: true })
  findAll() {
    return this.goalsService.findAll();
  }

  @Get('drafts')
  @ApiOkResponse({ type: GoalEntity, isArray: true })
  findDrafts() {
    return this.goalsService.findDrafts();
  }

  @Get(':id')
  @ApiOkResponse({ type: GoalEntity })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.goalsService.findOne(id);
  }

  @Patch(':id')
  @ApiCreatedResponse({ type: GoalEntity })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGoalDto: UpdateGoalDto,
  ) {
    return this.goalsService.update(id, updateGoalDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: GoalEntity })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.goalsService.remove(id);
  }
}
