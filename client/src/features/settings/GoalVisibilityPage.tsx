import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import type { GoalResponse } from "@habit-tracker/shared";
import { useGoals, useUpdateGoalMutation } from '../../apis/GoalApi';
import IconButton from "@/components/custom/IconButton";
import { TopBarClose } from "@/components/custom/TopBar";
import { ErrorBodyComponent } from "@/components/custom/ErrorComponents";
import { EmptyStateBodyComponent } from "@/components/custom/EmptyStateComponents";
import { queryClient } from "@/integrations/tanstack-query/root-provider";

interface GoalVisibilityCardProps {
  goal: GoalResponse,
}

export function GoalVisibilityCard({ goal }: GoalVisibilityCardProps) {  
  const { data, mutate: updateGoalMutateFn, isPending } = useUpdateGoalMutation(queryClient);
  const isVisible = data ? data.visibility : goal.visibility;

  const onEyeButtonClick = () => {
    if (isPending) {
      // Only send update if there's no update pending.
      // TODOssss add debounce with setTimeout?
      return;
    }

    updateGoalMutateFn({ id: goal.id, update: {
      ...goal, ///< TODOsss: fix this hack (and other places where goal is updated; shouldn't need to send entire goal obj to satisfy discriminated union, just to toggle visibility... update zod schemas to try and split out common vs. discriminated update schemas)
      visibility: !isVisible, ///< Toggle visible flag
    } }, {
      onError: (error) => console.log(error),
    })
  }

  return (
    <div className="orderItem bg-white rounded-md flex flex-row overflow-hidden shadow-sm" >
      <div className="w-full px-2.5 py-2 flex flex-row gap-2.5 items-center">
        <div className="circle w-[12px] h-[12px] shrink-0 rounded-4xl" style={{backgroundColor: `#${goal.colour}`}}></div>
        <h2 className="title w-full text-sm font-semibold">{goal.title}</h2>
        <div className="buttons flex flex-row gap-1">
          <IconButton iconName={isVisible ? "eye" : "eye-off" } tooltip={isVisible ? "Show" : "Hide"} onClickCallback={onEyeButtonClick}/>
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
      {(goals && goals.length === 0) &&
        <EmptyStateBodyComponent 
          onButtonClick={() => {
            navigate({ to: '/goals/create' });
          }}
          headerText="No goals to show or hide"
          descriptionText="Tip: Once you have goals, you can toggle their home-screen visibility. This won't affect public/private status."
        />
      }
    </div>
  )
}