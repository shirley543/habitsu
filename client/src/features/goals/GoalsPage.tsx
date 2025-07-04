import { GoalCardDescriptive } from "./components/GoalCard";
import type { IconName } from "lucide-react/dynamic";
import { TopBarSlotted } from "@/components/custom/TopBar";
import { useNavigate } from "@tanstack/react-router";
import IconButton from "@/components/custom/IconButton";
import { YearDropdown } from "./components/YearDropdown";
import { useEffect, useState } from "react";
import { useGoals } from "./GoalApi";
import { GoalQuantifyType } from "@habit-tracker/shared";


export const GoalsPage = () => {
  const navigate = useNavigate()
  const [selectedYear, setSelectedYear] = useState<number>(2025)

  const { data, isLoading, error } = useGoals();

  // Scroll into view today's cell
  useEffect(() => {
    console.log("data", data)
  }, [data])

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
      <div className="flex flex-col gap-3">
        {data && data.map((d) => {
          return <GoalCardDescriptive
            title={d.title}
            description={d.description}
            iconName={d.icon as IconName}
            goalData={d}
            selectedYear={selectedYear}
          />
        })}
      </div>
    </div>
  );
};
