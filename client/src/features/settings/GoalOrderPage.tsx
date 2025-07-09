import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from '@dnd-kit/utilities';

import type { GoalResponse } from "@habit-tracker/shared";
import { useGoals } from "../goals/GoalApi";
import IconButton from "@/components/custom/IconButton";
import { TopBarClose } from "@/components/custom/TopBar";
import { ErrorBodyComponent } from "@/components/custom/ErrorComponents";

interface GoalOrderCardProps {
  goal: GoalResponse,
}

export function GoalOrderCard({ goal }: GoalOrderCardProps) {  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id: goal.id});
    
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <div className="orderItem bg-white rounded-md flex flex-row overflow-hidden" ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div className="tab w-2" style={{backgroundColor: `#${goal.colour}`}}></div>
      <div className="titleButtons w-full px-2.5 py-2 flex flex-row gap-2 items-center">
        <h2 className="title w-full text-sm font-semibold">{goal.title}</h2>
        <div className="buttons flex flex-row gap-1">
        <IconButton iconName="arrow-up" onClickCallback={() => { console.log("clicked up") }}/>
        <IconButton iconName="arrow-down" onClickCallback={() => { console.log("clicked down") }}/>
        </div>
      </div>
    </div>
  )
}

export function GoalOrderPage() {
  const navigate = useNavigate();
  const { data: goalsRaw, isLoading, error } = useGoals();

  const [goals, setGoals] = useState<GoalResponse[] | undefined>(undefined);

  // Update displayed goals data from goals raw 
  // (from backend) data once available
  useEffect(() => {
    setGoals(goalsRaw)
  }, [goalsRaw])

  const goalsIds = useMemo(() => {
    return goals?.map((goal) => goal.id);
  }, [goals])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent): void {
    const {active, over} = event;
    
    if (over && active.id !== over.id) {
      setGoals((items) => {
        if (items === undefined) {
          return;
        }

        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        const newArray = arrayMove(items, oldIndex, newIndex);
        console.log(newArray);
        return newArray;
      });
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Topbar config */}
      <TopBarClose title="Goal Order" closeCallback={() => { navigate({ to: "/settings" })}} />
      {/* Error component */}
      {error && <ErrorBodyComponent error={error} onRefreshClick={() => { console.log("on refresh click" )}}/>}
      {/* Order controls container */}
      {(goals && goalsIds) &&
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={goalsIds}
            strategy={verticalListSortingStrategy}
          >
            {goals.map((goal) => (
              <GoalOrderCard key={goal.id} goal={goal}/>
            ))}
          </SortableContext>
        </DndContext>
      }
    </div>
  )
}