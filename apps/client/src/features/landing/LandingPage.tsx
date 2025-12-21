import { Link, useNavigate } from '@tanstack/react-router';
import { GoalCardStatic } from '../goals/components/GoalCard';
import { DynamicIcon, type IconName } from 'lucide-react/dynamic';
import { GoalPublicityType, GoalQuantifyType, type GoalEntryResponse, type GoalResponse } from '@habit-tracker/validation-schemas';
import IconButton from '@/components/custom/IconButton';
import { TopBarSlotted } from '@/components/custom/TopBar';
import { fakeGoalEntriesData } from './fakeGoalEntriesData';
import { ColourEnum } from '@/components/custom/FormComponents';
import { Button } from '@/components/ui/button';
import { ArrowDown, ArrowRight } from 'lucide-react';


interface InfoCardEntry {
  icon: IconName;
  title: string;
  description: string;
  colour: ColourEnum;
}

interface LandingPageProps {
}

export const LandingPage: React.FC<LandingPageProps> = () => {
  const navigate = useNavigate();

  const homeGoalIcon: IconName = "palette"
  const homeGoalData: GoalResponse = {
    id: 1,
    title: "Read daily",
    description: "Read at least 30 pages of a book per day",
    icon: homeGoalIcon,
    colour: ColourEnum.Violet,
    publicity: GoalPublicityType.Public,
    visibility: true,
    order: 0,
    goalType: GoalQuantifyType.Numeric,
    numericTarget: 30,
    numericUnit: "pages",
  };
  const homeEntriesData: GoalEntryResponse[] = fakeGoalEntriesData;

  const infoCardEntriesData: InfoCardEntry[] = [
    {
      icon: "calendar-days",
      title: "Habit Heatmaps",
      description: "Track your habits through clear, contribution-style heatmaps that show your consistency over time. Completing each day builds a visual rhythm that keeps you motivated to stay on track.",
      colour: ColourEnum.Violet,
    },
    {
      icon: "pencil",
      title: "Goal Customization",
      description: "Create habits that match your routine and priorities. Add a title, description, color, icon, and choose whether the habit is a simple yes/no check (\"Meditate\") or a numeric daily target (\"Read 30 pages\")",
      colour: ColourEnum.Violet,
    },
    {
      icon: "line-chart",
      title: "Streaks & Stats",
      description: "Monitor your consistency with at-a-glance insights, including current streak, longest streak, daily averages, and month-to-month trends. Understand not just what you did, but how consistently you did it.",
      colour: ColourEnum.Violet,
    },
    {
      icon: "home",
      title: "Dashboard Control",
      description: "Organize your home view to fit how you work. Reorder habits, adjust visibility, and focus on the goals that matter most right now.",
      colour: ColourEnum.Violet,
    },
    {
      icon: "notepad-text",
      title: "Daily Notes",
      description: "Add optional notes to any day to record context, thoughts, or progress details. Look back later and understand patterns behind your streaks and habits.",
      colour: ColourEnum.Violet,
    },
    {
      icon: "lock-open",
      title: "Privacy Options",
      description: "Control the visibility of habits and personal profile details. Keep everything private or share it - it's entirely your choice.",
      colour: ColourEnum.Violet,
    },
  ]

  return (
    <div className="flex flex-col gap-10 items-center w-full">
      {/* Topbar slotted */}
      <div className="flex flex-row justify-between w-full">
        <h1 className="text-2xl font-extrabold w-full">Habitsu</h1>
        <div className="flex flex-row gap-1.5">
          <Button asChild type="button" variant="secondary">
            <Link to="/sign-up">Sign Up</Link>
          </Button> 
          <Button asChild type="button" variant="default">
            <Link to="/login">Login</Link>
          </Button>
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-4 items-center">
        <div>
          <h2 className="text-2xl font-extrabold">
            Habit tracking made visual —
          </h2>
          <p className="text-2xl font-semibold">heatmaps that help you stay consistent.</p>
        </div>
        <Button asChild type="button" variant="default" className="w-fit" size="lg">
          <Link to="/login">
            <ArrowRight/>
            Get Started
          </Link>
        </Button>
      </div>

      {/* Heatmap example */}
      <div className="flex flex-col gap-3 w-full">
        <GoalCardStatic
          key={`goalCard_${homeGoalData.id}`}
          title={homeGoalData.title}
          description={homeGoalData.description}
          iconName={homeGoalData.icon as IconName}
          goalData={homeGoalData}
          selectedYear={2025}
          entriesData={homeEntriesData}
        />
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {
        infoCardEntriesData.map((infoCardEntry) => {
          // TODOs card styling refactor to shared
          return <div className="bg-white rounded-lg p-2.5 flex flex-row gap-3">
            <div className="min-w-9 min-h-9 w-9 h-9 rounded-lg flex items-center justify-center bg-violet-100 text-violet-400">
              <DynamicIcon name={infoCardEntry.icon} />
            </div>
            <div className="flex flex-col gap-1.5">
              <h2 className="text-base font-semibold">{infoCardEntry.title}</h2>
              <h2 className="text-xs font-regular">{infoCardEntry.description}</h2>
            </div>
          </div>
        })
      }
      </div>
    </div>
  )
}
