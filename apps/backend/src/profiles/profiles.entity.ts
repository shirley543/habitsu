import { ApiProperty } from '@nestjs/swagger';

export class ProfileEntity {
  @ApiProperty()
  username: string;

  @ApiProperty()
  joinedAt: Date | undefined;

  @ApiProperty()
  daysTrackedTotal: number | undefined;
}