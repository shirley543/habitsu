import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoalPublicity, ProfilePublicity } from '@prisma/client';
import { ProfileEntity } from './profiles.entity';
import { assertUserFound } from '../users/errors/userAssertions';

enum TrackedDaysType {
  AllGoals = 'all-goals',
  PublicGoalsOnly = 'public-goals-only',
}

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  private async computeDaysTracked(
    username: string,
    trackedDaysType: TrackedDaysType,
  ) {
    const trackedDays = await this.prisma.goalEntry.groupBy({
      by: ['entryDate'],
      where: {
        goal: {
          user: { username: username },
          ...(trackedDaysType === TrackedDaysType.AllGoals
            ? {}
            : { publicity: GoalPublicity.PUBLIC }),
        },
      },
      _count: true,
    });
    const daysTracked = trackedDays.length;
    return daysTracked;
  }

  async findByUsername(
    targetUsername: string,
    requestingUserId: number,
  ): Promise<ProfileEntity> {
    // Fetch user to get their userId
    const user = await this.prisma.user.findUnique({
      where: { username: targetUsername },
    });
    assertUserFound(user, targetUsername);

    const isOwner = requestingUserId === user.id;
    const isProfilePublic = user.profilePublicity === ProfilePublicity.PUBLIC;

    const profileEntity: ProfileEntity = await (async () => {
      if (isOwner) {
        // Return all data, with days tracked based on ALL goals regardless of goal-publicity
        const daysTracked = await this.computeDaysTracked(
          targetUsername,
          TrackedDaysType.AllGoals,
        );
        return {
          username: user.username,
          joinedAt: user.createdAt,
          daysTrackedTotal: daysTracked,
        };
      } else {
        // Non-owner
        if (isProfilePublic) {
          // Return all data, with days tracked based off all public goals
          const daysTracked = await this.computeDaysTracked(
            targetUsername,
            TrackedDaysType.PublicGoalsOnly,
          );
          return {
            username: user.username,
            joinedAt: user.createdAt,
            daysTrackedTotal: daysTracked,
          };
        } else {
          // Return minimal data (username only)
          return {
            username: user.username,
            joinedAt: undefined,
            daysTrackedTotal: undefined,
          };
        }
      }
    })();

    return profileEntity;
  }
}
