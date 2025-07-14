import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import type { GoalResponse } from "@habit-tracker/shared";
import { useGoals, useUpdateGoalMutation } from "../goals/GoalApi";
import IconButton from "@/components/custom/IconButton";
import { TopBarClose } from "@/components/custom/TopBar";
import { ErrorBodyComponent } from "@/components/custom/ErrorComponents";

interface GoalVisibilityCardProps {
  goal: GoalResponse,
}

export function GoalVisibilityCard({ goal }: GoalVisibilityCardProps) {  
  const { data, mutate: updateGoalMutateFn } = useUpdateGoalMutation();

  const onEyeButtonClick = () => {
    // TODOss: uncomment once visibility field added to goal in db/ backend
    // updateGoalMutateFn({ id: goal.id, update: { visibility: data.visibility || goal.visibility } }, {
    //   onError: (error) => console.log(error),
    // })
  }

  return (
    <div className="orderItem bg-white rounded-md flex flex-row overflow-hidden shadow-sm" >
      <div className="w-full px-2.5 py-2 flex flex-row gap-2.5 items-center">
        <div className="circle w-[12px] h-[12px] shrink-0 rounded-4xl" style={{backgroundColor: `#${goal.colour}`}}></div>
        <h2 className="title w-full text-sm font-semibold">{goal.title}</h2>
        <div className="buttons flex flex-row gap-1">
          <IconButton iconName={true ? "eye" : "eye-off" } tooltip={true ? "Show" : "Hide"} onClickCallback={onEyeButtonClick}/>
        </div>
      </div>
    </div>
  )
}

export function GoalVisibilityPage() {
  const navigate = useNavigate();
  const { data: goalsRaw, isLoading, error } = useGoals();

  const [goals, setGoals] = useState<GoalResponse[] | undefined>(undefined);

  // Update displayed goals data from goals raw 
  // (from backend) data once available
  useEffect(() => {
    setGoals(goalsRaw)
  }, [goalsRaw])

  return (
    <div className="flex flex-col gap-3">
      {/* Topbar config */}
      <TopBarClose title="Goal Visibility" closeCallback={() => { navigate({ to: "/settings" })}} />
      {/* Error component */}
      {error && <ErrorBodyComponent error={error} onRefreshClick={() => { console.log("on refresh click" )}}/>}
      {/* Visibility controls container */}
      {goals && goals.map((goal) => (
        <GoalVisibilityCard key={goal.id} goal={goal} />
      ))}
    </div>
  )
}