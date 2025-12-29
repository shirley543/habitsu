import { GoalEntry } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class GoalEntryEntity implements GoalEntry {
  @ApiProperty()
  id: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  entryDate: Date;

  @ApiProperty()
  goalId: number;

  @ApiProperty({ required: false, nullable: true })
  numericValue: number | null;

  @ApiProperty({ required: false, nullable: true })
  booleanValue: boolean | null;

  @ApiProperty({ required: false, nullable: true })
  note: string | null;
}
