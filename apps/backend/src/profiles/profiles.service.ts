import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoalPublicity, ProfilePublicity } from '@prisma/client';
import { assertFound } from '../common/assert/assertions';
import { ProfileEntity } from './profiles.entity';

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
    assertFound(user, 'User not found');

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

    // +-----------------+-----------+--------------+---------------------------+
    // | Profile Privacy | Viewer    | Goal Privacy | Result                    |
    // +-----------------+-----------+--------------+---------------------------+
    // | private         | not owner | any          | No goals returned + profile limited, don't calculate days tracked |
    // | public          | not owner | public       | Goal is visible + profile full           |
    // | public          | not owner | private      | Goal is hidden + profile full but days tracked only on public goals            |
    // | any             | owner     | any          | All goals are visible + profile full     |
    // +-----------------+-----------+--------------+---------------------------+

    // TODOs #30 need to update goals endpoint to have check for profile visibility.
    // If public:
    // - All profile data (username, join date, days tracked)
    // - Some goal data (some goals can still be private)
    // If private:
    // - Some profile data (username, join date, but NOT days tracked)\
    // - No goal data (ALL goals hidden)
  }
}
