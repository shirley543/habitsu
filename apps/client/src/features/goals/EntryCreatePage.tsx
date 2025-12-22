import { useState } from 'react'
import {
  getRouteApi,
  useNavigate,
  useRouterState,
} from '@tanstack/react-router'
import {
  CreateGoalEntrySchema,
  
  GoalQuantifyType
} from '@habit-tracker/validation-schemas'
import { useAppForm } from '../../hooks/form'
import {
  useCreateGoalEntryMutation,
  useDeleteGoalEntryMutation,
  useGoal,
  useGoalEntry,
  useUpdateGoalEntryMutation,
} from '../../apis/GoalApi'
import type {GoalEntryResponse} from '@habit-tracker/validation-schemas';
import { TopBarClose } from '@/components/custom/TopBar'
import {
  ErrorDialogCategory,
  ErrorDialogComponent,
} from '@/components/custom/ErrorComponents'
import { capitalizeFirstLetter } from '@/lib/stringUtils'
import { Button } from '@/components/ui/button'

interface EntryFormProps {
  isCreate: boolean
  goalId: number
  goalType: GoalQuantifyType
  goalUnit: string
  entryDate?: Date
  defaultValues?: GoalEntryResponse
}

const EntryForm: React.FC<EntryFormProps> = ({
  isCreate,
  goalId,
  goalType,
  goalUnit,
  entryDate,
  defaultValues,
}) => {
  const navigate = useNavigate()

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

  const [displayedError, setDisplayedError] = useState<
    { category: ErrorDialogCategory; error: Error } | undefined
  >(undefined)

  const handleDelete = () => {
    if (defaultValues?.id) {
      deleteGoalEntryMutateFn(
        {
          goalId: goalId,
          entryId: defaultValues.id,
        },
        {
          onSuccess: () => navigate({ to: '/goals' }),
          onError: (error) => {
            setDisplayedError({
              error: error,
              category: ErrorDialogCategory.DeleteFailed,
            })
          },
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
            onSuccess: () => navigate({ to: '/goals' }),
            onError: (error) =>
              setDisplayedError({
                error: error,
                category: ErrorDialogCategory.FormSubmissionFailed,
              }),
          },
        )
      } else {
        if (defaultValues?.id) {
          updateGoalEntryMutateFn(
            { goalId: goalId, entryId: defaultValues.id, updateDto: parsed },
            {
              onSuccess: () => navigate({ to: '/goals' }),
              onError: (error) =>
                setDisplayedError({
                  error: error,
                  category: ErrorDialogCategory.FormSubmissionFailed,
                }),
            },
          )
        }
      }
    },
  })

  return (
    <div className="flex flex-col gap-3">
      {/* Topbar config */}
      <TopBarClose
        title={isCreate ? 'Create Entry' : 'Edit Entry'}
        closeCallback={() => {
          navigate({ to: '/goals' })
        }}
      />
      {/* Form controls container */}
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
            <field.DateField label="Date" placeholder="e.g. 11 July 2025" />
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
      {displayedError && (
        <ErrorDialogComponent
          error={displayedError.error}
          category={displayedError.category}
          onClose={() => {
            setDisplayedError(undefined)
          }}
        />
      )}
    </div>
  )
}

export function EntryCreatePage() {
  const route = getRouteApi('/goals_/$goalId_/entries/create')
  const { goalId: goalId } = route.useParams()

  const locationState = useRouterState({ select: (s) => s.location.state })
  const dateStr = locationState.date
  const date = dateStr ? new Date(dateStr) : undefined

  const {
    data: goalData,
    isLoading: goalIsLoading,
    error: goalError,
  } = useGoal(goalId)

  return (
    <>
      {!goalIsLoading && goalData && (
        <EntryForm
          isCreate={true}
          goalId={goalData.id}
          goalType={goalData.goalType}
          goalUnit={
            goalData.goalType === GoalQuantifyType.Numeric
              ? goalData.numericUnit
              : ''
          }
          entryDate={date}
        />
      )}
    </>
  )
}

export function EntryEditPage() {
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

  const displayEntryForm =
    !goalIsLoading &&
    !goalError &&
    goalData &&
    !entryIsLoading &&
    !entryError &&
    entryData

  return (
    <>
      {goalIsLoading && <div>Loading...</div>}
      {goalError && <div>{goalError.message}</div>}
      {displayEntryForm && (
        <EntryForm
          isCreate={false}
          goalId={Number(goalId)}
          goalType={goalData.goalType}
          goalUnit={
            goalData.goalType === GoalQuantifyType.Numeric
              ? goalData.numericUnit
              : ''
          }
          defaultValues={entryData}
        />
      )}
    </>
  )
}
