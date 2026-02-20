import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { DynamicIcon } from 'lucide-react/dynamic'
import { useState } from 'react'
import { YearDropdown } from '../goals/components/YearDropdown'
import {
  GoalCardDescriptive,
  SkeletonGoalCard,
} from '../goals/components/GoalCard'
import type { IconName } from 'lucide-react/dynamic'
import { useProfileGoals } from '@/apis/ProfileApi'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useProfile } from '@/apis/ProfileApi'
import { TopBarConfig } from '@/components/custom/TopBar'

export const ProfilePage = () => {
  const navigate = useNavigate()
  const route = getRouteApi('/profile_/$profileName')

  const [selectedYear, setSelectedYear] = useState<number>(2025)

  const { profileName } = route.useParams()

  // Un-used variables to be addressed in #12
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const {
    data: profileData,
    isLoading: profileIsLoading,
    error: profileError,
  } = useProfile(profileName)
  const isProfilePrivate =
    profileData?.joinedAt === undefined &&
    profileData?.daysTrackedTotal === undefined

  const {
    data: goalsData,
    isLoading: goalsIsLoading,
    error: goalsError,
  } = useProfileGoals(profileName)
  /* eslint-enable @typescript-eslint/no-unused-vars */
  // TODOs #30: don't bother calling useGoals if profile is private, pass in to hook as disabled

  const formatDateToString = (date: Date | undefined) => {
    return date ? `${date}` : undefined
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Topbar config */}
      <TopBarConfig
        title="Profile"
        rightConfig={[
          {
            iconName: 'home',
            tooltip: 'Home',
            clickCallback: () => {
              navigate({ to: '/goals' })
            },
          },
          {
            iconName: 'settings',
            tooltip: 'Settings',
            clickCallback: () => {
              navigate({ to: '/settings' })
            },
          },
          // TODOs #30: Avatar
        ]}
      />

      {/* Profile data */}
      {profileData && (
        <div className="bg-white rounded-xl p-2.5 flex flex-row gap-3">
          <Avatar className="size-20">
            <AvatarFallback className="text-2xl">CN</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1.5">
            <h2>{profileData.username}</h2>
            <div className="flex flex-col gap-1">
              <div className="flex flex-row gap-1.5">
                <DynamicIcon name="clock" />
                {/* <p>Joined <b>25 May 2025</b></p> */}
                <p>
                  Joined{' '}
                  <b>{formatDateToString(profileData.joinedAt) || '-'}</b>
                </p>
              </div>
              <div className="flex flex-row gap-1.5">
                <DynamicIcon name="calendar-days" />
                <p>
                  <b>{profileData.daysTrackedTotal || '-'}</b> days tracked
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Year selection */}
      {!isProfilePrivate && (
        <YearDropdown
          selectedYear={selectedYear}
          onSelect={(year) => {
            setSelectedYear(year)
          }}
        />
      )}

      {/* Goals data/ heatmaps container */}
      {(goalsData || goalsIsLoading) && (
        <div className="flex flex-col gap-3">
          {goalsData &&
            goalsData.map((d) => {
              return (
                <GoalCardDescriptive
                  key={`goalCard_${d.id}`}
                  title={d.title}
                  description={d.description}
                  iconName={d.icon as IconName}
                  goalData={d}
                  selectedYear={selectedYear}
                />
              )
            })}
          {goalsIsLoading &&
            [...Array(3)].map((_, idx) => {
              return <SkeletonGoalCard key={`skeletonGoalCard_${idx}`} />
            })}
        </div>
      )}
    </div>
  )
}
