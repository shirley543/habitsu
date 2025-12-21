import { useEffect, useMemo, useState } from 'react'
import { useCanGoBack, useNavigate, useRouter } from '@tanstack/react-router'
import {
  DndContext,
  
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import {
  
  
  ReorderGoalSchema
} from '@habit-tracker/validation-schemas'
import { useGoals, useReorderGoalsMutation } from '../../apis/GoalApi'
import type {GoalResponse, ReorderGoalDto} from '@habit-tracker/validation-schemas';
import type {DragEndEvent} from '@dnd-kit/core';
import IconButton from '@/components/custom/IconButton'
import { TopBarClose } from '@/components/custom/TopBar'
import { ErrorBodyComponent } from '@/components/custom/ErrorComponents'
import { Button } from '@/components/ui/button'
import { EmptyStateBodyComponent } from '@/components/custom/EmptyStateComponents'

interface GoalOrderCardProps {
  goal: GoalResponse
  onUpClick: () => void
  onDownClick: () => void
}

export function GoalOrderCard({
  goal,
  onUpClick,
  onDownClick,
}: GoalOrderCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: goal.id,
      animateLayoutChanges: ({ wasDragging }) => !wasDragging,
    })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      className="orderItem bg-white rounded-md flex flex-row overflow-hidden shadow-sm"
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <div
        className="tab w-2"
        style={{ backgroundColor: `#${goal.colour}` }}
      ></div>
      <div className="titleButtons w-full px-2.5 py-2 flex flex-row gap-2 items-center">
        <h2 className="title w-full text-sm font-semibold">{goal.title}</h2>
        <div className="buttons flex flex-row gap-1">
          <IconButton
            iconName="arrow-up"
            tooltip="Move Up"
            onClickCallback={onUpClick}
          />
          <IconButton
            iconName="arrow-down"
            tooltip="Move Down"
            onClickCallback={onDownClick}
          />
        </div>
      </div>
    </div>
  )
}

export function GoalOrderPage() {
  const navigate = useNavigate()

  const { data: goalsRaw, isLoading, error } = useGoals()
  const { mutate: reorderGoalsMutateFn } = useReorderGoalsMutation()

  const [goals, setGoals] = useState<Array<GoalResponse> | undefined>(undefined)

  const router = useRouter()
  const canGoBack = useCanGoBack()

  const navigateBack = () => {
    if (canGoBack) {
      router.history.back()
    } else {
      navigate({ to: '/settings' })
    }
  }

  // Update displayed goals data from goals raw
  // (from backend) data once available
  useEffect(() => {
    // TODOs #9: Fix bug where upon pressing save, flicker of old order
    setGoals(goalsRaw?.sort((a, b) => a.order - b.order))
  }, [goalsRaw])

  const goalsIds = useMemo(() => {
    return goals?.map((goal) => goal.id)
  }, [goals])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {}),
  )

  function handleDragEnd(event: DragEndEvent): void {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setGoals((items) => {
        if (items === undefined) {
          return
        }

        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        const newArray = arrayMove(items, oldIndex, newIndex)
        console.log(newArray)
        return newArray
      })
    }
  }

  function handleUpClick(goalId: number): void {
    setGoals((items) => {
      if (items === undefined) {
        return
      }

      const oldIndex = items.findIndex((item) => item.id === goalId)
      const newIndex = oldIndex === 0 ? items.length - 1 : oldIndex - 1
      const newArray = arrayMove(items, oldIndex, newIndex)
      return newArray
    })
  }

  function handleDownClick(goalId: number): void {
    setGoals((items) => {
      if (items === undefined) {
        return
      }

      const oldIndex = items.findIndex((item) => item.id === goalId)
      const newIndex = oldIndex === items.length - 1 ? 0 : oldIndex + 1
      const newArray = arrayMove(items, oldIndex, newIndex)
      return newArray
    })
  }

  function handleSave(): void {
    if (goals === undefined) {
      return
    }

    const reorderData: ReorderGoalDto = goals.map((goal, idx) => ({
      id: goal.id,
      order: idx + 1,
    }))
    const result = ReorderGoalSchema.safeParse(reorderData)
    if (result.error?.issues) {
      console.log('Error on validation', result.error?.issues)
      // TODOs #8 Display validation error
    } else {
      // No issues during parsing, hence send to backend
      reorderGoalsMutateFn(reorderData, {
        onSuccess: navigateBack,
        onError: (error) => console.log('Error on reordering', error),
        // TODOs #8 toast? Error modal?
        // TODOs #12 Improve loading display + error display
      })
    }
  }

  // TODOs #6 Fix DnD bug where goal order card can be dragged out of bounds and resizes entire window
  // TODOs #7 Add drag-item styling to show which item is currently being dragged (darker bg)

  return (
    <div className="flex flex-col gap-3">
      {/* Topbar config */}
      <TopBarClose
        title="Goal Order"
        closeCallback={() => {
          navigate({ to: '/settings' })
        }}
      />
      {/* Error component */}
      {error && (
        <ErrorBodyComponent
          error={error}
          onRefreshClick={() => {
            console.log('on refresh click')
          }}
        />
      )}
      {/* Order controls container */}
      {goals && goals.length > 0 && goalsIds && goalsIds.length > 0 && (
        <>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={goalsIds}
              strategy={verticalListSortingStrategy}
            >
              {goals.map((goal) => (
                <GoalOrderCard
                  key={goal.id}
                  goal={goal}
                  onUpClick={() => handleUpClick(goal.id)}
                  onDownClick={() => handleDownClick(goal.id)}
                />
              ))}
            </SortableContext>
          </DndContext>
          <Button onClick={handleSave}>Save</Button>
        </>
      )}
      {goals && goals.length === 0 && (
        <EmptyStateBodyComponent
          onButtonClick={() => {
            navigate({ to: '/goals/create' })
          }}
          headerText="No goals to reorder"
          descriptionText="Tip: Once you have multiple goals, you can drag and drop them to change their home-screen order."
        />
      )}
    </div>
  )
}
