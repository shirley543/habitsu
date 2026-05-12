import { useState } from 'react'
import {
  getRouteApi,
  useNavigate,
  useRouterState,
} from '@tanstack/react-router'
import {
  CreateGoalEntrySchema,
  GoalQuantifyType,
} from '@habit-tracker/validation-schemas'
import { useAppForm } from '../../hooks/form'
import {
  useCreateGoalEntryMutation,
  useDeleteGoalEntryMutation,
  useGoal,
  useGoalEntry,
  useUpdateGoalEntryMutation,
} from '../../apis/GoalApi'
import type { GoalEntryResponse } from '@habit-tracker/validation-schemas'
import { TopBarClose } from '@/components/custom/TopBar'
import { capitalizeFirstLetter } from '@/lib/stringUtils'
import { Button } from '@/components/ui/button'
import { useCurrentYear } from '@/hooks/useCurrentDate'
import { ErrorBodyComponent, ErrorBodyComponentPosition, ErrorBodyComponentSize } from '@/components/custom/ErrorComponents'
import { Spinner } from '@/components/ui/spinner'

interface EntryFormProps {
  isCreate: boolean
  goalId: number
  goalType: GoalQuantifyType
  goalUnit: string
  entryDate?: Date
  defaultValues?: GoalEntryResponse
  closeCallback: () => void;
}

const EntryForm: React.FC<EntryFormProps> = ({
  isCreate,
  goalId,
  goalType,
  goalUnit,
  entryDate,
  defaultValues,
  closeCallback,
}) => {
  const currentYear = useCurrentYear()
  const entryDatePlaceholder = `e.g. 01 January ${currentYear}`

  const initialValues = defaultValues
    ? {
        ...defaultValues,
        entryDate: new Date(defaultValues.entryDate)
          .toISOString()
          .split('T')[0],
      }
    : ({
        entryDate: (entryDate || new Date()).toISOString().split('T')[0],
        note: '',
      } as {
        entryDate: string
        note: string | null
        numericValue?: number | null
      })

  const { mutate: createGoalEntryMutateFn } = useCreateGoalEntryMutation()
  const { mutate: updateGoalEntryMutateFn } = useUpdateGoalEntryMutation()
  const { mutate: deleteGoalEntryMutateFn } = useDeleteGoalEntryMutation()

  const handleDelete = () => {
    if (defaultValues?.id) {
      deleteGoalEntryMutateFn(
        {
          goalId: goalId,
          entryId: defaultValues.id,
        },
        {
          onSuccess: closeCallback
        },
      )
    }
  }

  const form = useAppForm({
    defaultValues: initialValues,
    validators: {
      onChange: CreateGoalEntrySchema,
    },
    onSubmit: ({ value }) => {
      const result = CreateGoalEntrySchema.safeParse(value)
      if (!result.success) {
        console.error(result.error)
        return
      }
      const parsed = result.data
      if (isCreate) {
        createGoalEntryMutateFn(
          { goalId: goalId, createDto: parsed },
          {
            onSuccess: closeCallback
          },
        )
      } else {
        if (defaultValues?.id) {
          updateGoalEntryMutateFn(
            { goalId: goalId, entryId: defaultValues.id, updateDto: parsed },
            {
              onSuccess: closeCallback
            },
          )
        }
      }
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-6"
    >
      <form.AppField name="entryDate">
        {(field) => (
          <field.DateField label="Date" placeholder={entryDatePlaceholder} />
        )}
      </form.AppField>

      <form.AppField name="note">
        {(field) => (
          <field.TextField
            label="Notes"
            placeholder="Optional. Add more details if needed"
          />
        )}
      </form.AppField>

      {goalType === GoalQuantifyType.Numeric && (
        <form.AppField name="numericValue">
          {(field) => (
            <field.NumberField
              label={capitalizeFirstLetter(goalUnit)}
              placeholder="e.g. 30"
            />
          )}
        </form.AppField>
      )}

      <div className="flex justify-end">
        <form.AppForm>
          {!isCreate && (
            <Button
              type="button"
              variant={'ghostDestructive'}
              onClick={handleDelete}
            >
              Delete
            </Button>
          )}
          <form.SubscribeButton label={isCreate ? 'Create' : 'Save'} />
        </form.AppForm>
      </div>
    </form>
  )
}

export function EntryCreatePage() {
  const navigate = useNavigate()
  const route = getRouteApi('/goals_/$goalId_/entries/create')
  const { goalId: goalId } = route.useParams()

  const locationState = useRouterState({ select: (s) => s.location.state })
  const dateStr = locationState.date
  const date = dateStr ? new Date(dateStr) : undefined

  const {
    data,
    isLoading,
    error,
    refetch: goalRefetch
  } = useGoal(goalId)

  const navigateToGoals = () => {
    navigate({ to: '/goals' })
  }

  return (
    <div className="flex flex-col gap-3">
      <TopBarClose title='Create Entry' closeCallback={navigateToGoals} />
      {isLoading && <div className="flex justify-center items-center w-full h-full">
        <Spinner className="size-28" />
      </div>}
      {error && <ErrorBodyComponent error={error} size={ErrorBodyComponentSize.Small} position={ErrorBodyComponentPosition.Centered} onRefreshClick={() => goalRefetch()} />}
      {!isLoading && !error && data && <EntryForm
        isCreate={true}
        goalId={data.id}
        goalType={data.goalType}
        goalUnit={
          data.goalType === GoalQuantifyType.Numeric
            ? data.numericUnit
            : ''
        }
        entryDate={date}
        closeCallback={navigateToGoals}
      />}
    </div>
  )
}

export function EntryEditPage() {
  const navigate = useNavigate()
  const route = getRouteApi('/goals_/$goalId_/entries_/$entryId/edit')

  const { goalId: goalId, entryId: entryId } = route.useParams()
  const {
    data: goalData,
    isLoading: goalIsLoading,
    error: goalError,
  } = useGoal(goalId)
  const {
    data: entryData,
    isLoading: entryIsLoading,
    error: entryError,
  } = useGoalEntry(entryId)

  const navigateToGoals = () => {
    navigate({ to: '/goals' })
  }

  const isLoading = goalIsLoading || entryIsLoading;
  const error = goalError || entryError;
  const displayForm =
    !goalIsLoading &&
    !goalError &&
    goalData &&
    !entryIsLoading &&
    !entryError &&
    entryData

  return (
    <div className="flex flex-col gap-3">
      <TopBarClose title='Edit Entry' closeCallback={navigateToGoals} />
      {isLoading && <div className="flex justify-center items-center w-full h-full">
        <Spinner className="size-28" />
      </div>}
      {error && <ErrorBodyComponent error={error} size={ErrorBodyComponentSize.Small} position={ErrorBodyComponentPosition.Centered} onRefreshClick={() => goalRefetch()} />}
      {displayForm && <EntryForm
        isCreate={false}
        goalId={Number(goalId)}
        goalType={goalData.goalType}
        goalUnit={
          goalData.goalType === GoalQuantifyType.Numeric
            ? goalData.numericUnit
            : ''
        }
        defaultValues={entryData}
        closeCallback={navigateToGoals}
      />}
    </div>
  )
}
