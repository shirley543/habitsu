import { GoalCardDescriptive, SkeletonGoalCard } from "./components/GoalCard";
import type { IconName } from "lucide-react/dynamic";
import { TopBarSlotted } from "@/components/custom/TopBar";
import { useNavigate } from "@tanstack/react-router";
import IconButton from "@/components/custom/IconButton";
import { YearDropdown } from "./components/YearDropdown";
import { useEffect, useState } from "react";
import { useGoals } from "./GoalApi";
import { GoalQuantifyType } from "@habit-tracker/shared";
import { CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

// TODOss: Error display (fetch retry button?). Oops! Something went wrong. Please try again
// TODOss: lazy loading/ infinite scroll results
export const GoalsPage = () => {
  const navigate = useNavigate()
  const [selectedYear, setSelectedYear] = useState<number>(2025)

  const { data, isLoading, error } = useGoals();

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
            <IconButton iconName="settings" onClickCallback={() => {
              navigate({ to: '/settings' })
            }} />
            <IconButton iconName="plus" onClickCallback={() => {
              navigate({ to: '/goals/create' })
            }} />
          </>
        }
      />
      {/* Heatmaps container */}
      {(data || isLoading) && <div className="flex flex-col gap-3">
        {data && data.map((d) => {
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
      {(error) && <div className="flex flex-col gap-4 pt-18 items-center">
          <CircleAlert size={`64px`} strokeWidth={2.5} />
          <div>
            <h2 className="text-base font-black">Oops! Something went wrong</h2>
            <p className="text-sm font-normal text-center">{error.message}.<br/> Refresh the page and try again.</p>
          </div>
          <Button onClick={() => { console.log("Refresh button clicked") }}>Refresh</Button>
      </div>}
    </div>
  );
};
