import { Goal, GoalPublicity, GoalQuantify } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class GoalEntity implements Goal {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false, nullable: true })
  description: string | null;

  @ApiProperty()
  icon: string;

  @ApiProperty()
  colour: string;

  @ApiProperty()
  publicity: GoalPublicity;

  @ApiProperty()
  goalType: GoalQuantify;

  @ApiProperty({ required: false, nullable: true })
  numericTarget: number | null;

  @ApiProperty({ required: false, nullable: true })
  numericUnit: string | null;

  @ApiProperty()
  visibility: boolean;

  @ApiProperty()
  order: number;

  @ApiProperty()
  userId: number;
}
