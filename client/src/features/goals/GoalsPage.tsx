import { GoalCardDescriptive, SkeletonGoalCard } from "./components/GoalCard";
import type { IconName } from "lucide-react/dynamic";
import { TopBarSlotted } from "@/components/custom/TopBar";
import { useNavigate } from "@tanstack/react-router";
import IconButton from "@/components/custom/IconButton";
import { YearDropdown } from "./components/YearDropdown";
import { useState } from "react";
import { useGoals } from '../../apis/GoalApi';
import { ErrorBodyComponent } from "@/components/custom/ErrorComponents";


// TODOss: Error display (fetch retry button?). Oops! Something went wrong. Please try again
// TODOss: lazy loading/ infinite scroll results
export const GoalsPage = () => {
  const navigate = useNavigate()
  const [selectedYear, setSelectedYear] = useState<number>(2025)

  const { data, isLoading, error } = useGoals();
  const displayedData = data?.filter((d) => d.visibility).sort((a, b) => a.order - b.order);
  // TODOsss: handle filtering on backend? how to fit with infinite scroll vs. pagination?

  return (
    <div className="flex flex-col gap-3">
      {/* Topbar slotted */}
      <TopBarSlotted
        title="Goals List"
        rightSlotItems={
          <>
            <YearDropdown selectedYear={selectedYear} onSelect={(year) => {
              setSelectedYear(year)
            }} />
            <IconButton iconName="settings" tooltip="Settings" onClickCallback={() => {
              navigate({ to: '/settings' })
            }} />
            <IconButton iconName="plus" tooltip="Create Goal" onClickCallback={() => {
              navigate({ to: '/goals/create' })
            }} />
          </>
        }
      />
      {/* Heatmaps container */}
      {(displayedData || isLoading) && <div className="flex flex-col gap-3">
        {displayedData && displayedData.map((d) => {
          return <GoalCardDescriptive
            key={`goalCard_${d.id}`}
            title={d.title}
            description={d.description}
            iconName={d.icon as IconName}
            goalData={d}
            selectedYear={selectedYear}
          />
        })}
        {isLoading && [...Array(3)].map((_, idx) => {
          return <SkeletonGoalCard key={`skeletonGoalCard_${idx}`}/>
        })}
      </div>}
      {/* Error component */}
      {(error) && <ErrorBodyComponent
        error={error}
        onRefreshClick={() => { console.log("TODOsss have refresh do something") }}
      />}
    </div>
  );
};
