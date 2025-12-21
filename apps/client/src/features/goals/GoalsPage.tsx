import { GoalCardDescriptive, SkeletonGoalCard } from './components/GoalCard'
import type { IconName } from 'lucide-react/dynamic'
import { TopBarSlotted } from '@/components/custom/TopBar'
import { useNavigate } from '@tanstack/react-router'
import IconButton from '@/components/custom/IconButton'
import { YearDropdown } from './components/YearDropdown'
import { useState } from 'react'
import { useGoals } from '../../apis/GoalApi'
import { ErrorBodyComponent } from '@/components/custom/ErrorComponents'
import { EmptyStateBodyComponent } from '@/components/custom/EmptyStateComponents'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import DropdownMenuOptions, {
  type DropdownMenuOptionsItemConfig,
} from '@/components/custom/DropdownMenuOptions'
import { useLogoutUserMutation } from '@/apis/UserApi'
import { HTTPError } from 'ky'

// TODOs #17: investigate if lazy loading will help with initial render speed of goals page
export const GoalsPage = () => {
  const navigate = useNavigate()
  const [selectedYear, setSelectedYear] = useState<number>(2025)

  const { data, isLoading, error } = useGoals()
  const displayedData = data
    ?.filter((d) => d.visibility)
    .sort((a, b) => a.order - b.order)
  // TODOs #16: handle filtering on backend? how to fit with infinite scroll vs. pagination?

  const { mutate: logoutUserMutateFn } = useLogoutUserMutation()

  const profileMenuItems: DropdownMenuOptionsItemConfig[] = [
    { label: 'Settings', onClick: () => navigate({ to: '/settings' }) },
    {
      label: 'Log Out',
      onClick: () => {
        console.log('Log out requested')
        logoutUserMutateFn(undefined, {
          onSuccess: () => navigate({ to: '/' }),
          onError: (error: Error) => {
            if (error instanceof HTTPError) {
              // Open generic error component
              // TODOs #12 Improve loading display + error display
              console.log('Error on logout')
            }
          },
        })
      },
    },
  ]

  return (
    <div className="flex flex-col gap-3">
      {/* Topbar slotted */}
      <TopBarSlotted
        title="Goals List"
        rightSlotItems={
          <>
            <YearDropdown
              selectedYear={selectedYear}
              onSelect={(year) => {
                setSelectedYear(year)
              }}
            />
            <IconButton
              iconName="settings"
              tooltip="Settings"
              onClickCallback={() => {
                navigate({ to: '/settings' })
              }}
            />
            <IconButton
              iconName="plus"
              tooltip="Create Goal"
              onClickCallback={() => {
                navigate({ to: '/goals/create' })
              }}
            />

            <DropdownMenuOptions
              title="Profile Options"
              itemsConfig={profileMenuItems}
            >
              <Avatar>
                {/* <AvatarImage src="https://github.com/shadcn.pn" alt="@shadcn" /> */}
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </DropdownMenuOptions>
          </>
        }
      />
      {/* Heatmaps container */}
      {(displayedData || isLoading) && (
        <div className="flex flex-col gap-3">
          {displayedData &&
            displayedData.map((d) => {
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
          {isLoading &&
            [...Array(3)].map((_, idx) => {
              return <SkeletonGoalCard key={`skeletonGoalCard_${idx}`} />
            })}
        </div>
      )}
      {displayedData && displayedData.length === 0 && (
        <EmptyStateBodyComponent
          onButtonClick={() => {
            navigate({ to: '/goals/create' })
          }}
        />
      )}
      {/* Error component */}
      {error && (
        <ErrorBodyComponent
          error={error}
          // TODOs #15: Have refresh click do something across all error body components
          onRefreshClick={() => {
            console.log('Have refresh do something')
          }}
        />
      )}
    </div>
  )
}
