import { ApiProperty } from '@nestjs/swagger';
import { GoalStatisticsReponse } from '@habit-tracker/validation-schemas';

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
