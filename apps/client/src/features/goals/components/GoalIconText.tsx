import { Skeleton } from '@/components/ui/skeleton'
import { DynamicIcon, type IconName } from 'lucide-react/dynamic'

interface GoalIconTextProps {
  title: string
  description: string
  baseColour: string
  iconName: IconName
}

/**
 * Goal icon text: displays goal header (with icon, title, description)
 * @returns
 */
const GoalIconText: React.FC<GoalIconTextProps> = ({
  title,
  description,
  baseColour,
  iconName,
}) => {
  return (
    <div className="icon-text-container flex flex-row gap-2 items-center">
      <div
        className="icon-container w-9 h-9 rounded-md flex items-center justify-center text-white opacity-70"
        style={{
          backgroundColor: `#${baseColour}`,
        }}
      >
        <DynamicIcon name={iconName} />
      </div>
      <div className="header-container flex flex-col gap-0">
        <h2 className="text-base font-semibold">{title}</h2>
        <h2 className="text-xs font-regular">{description}</h2>
      </div>
    </div>
  )
}

const SkeletonGoalIconText: React.FC = () => {
  return (
    <div className="icon-text-container flex flex-row gap-2 items-center">
      <Skeleton className="w-9 h-9 rounded-md" />
      <div className="header-container flex flex-col gap-0">
        <Skeleton className="h-4 w-[230px]" />
        <Skeleton className="h-4 w-[230px]" />
      </div>
    </div>
  )
}

export { GoalIconText, SkeletonGoalIconText }
