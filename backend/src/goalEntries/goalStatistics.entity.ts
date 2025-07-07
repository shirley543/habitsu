import { ApiProperty } from '@nestjs/swagger';
import { GoalStatisticsReponse } from './goalEntries.dtos';

export class GoalStatisticsEntity implements GoalStatisticsReponse {
  @ApiProperty()
  yearAvg: number | null;

  @ApiProperty()
  yearCount: number | null;

  @ApiProperty()
  currentStreakLen: number | null;

  @ApiProperty()
  maxStreakLen: number | null;
}
