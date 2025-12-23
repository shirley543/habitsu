import { useState } from 'react'
import {
  getRouteApi,
  useCanGoBack,
  useNavigate,
  useRouter,
} from '@tanstack/react-router'
import {
  CreateGoalSchema,
  GoalPublicityType,
  GoalQuantifyType,
} from '@habit-tracker/validation-schemas'
import { useAppForm } from '../../hooks/form'
import {
  useCreateGoalMutation,
  useDeleteGoalMutation,
  useGoal,
  useUpdateGoalMutation,
} from '../../apis/GoalApi'
import type {
  CreateGoalDto,
  GoalResponse,
} from '@habit-tracker/validation-schemas'
import { TopBarClose } from '@/components/custom/TopBar'
import {
  ErrorDialogCategory,
  ErrorDialogComponent,
} from '@/components/custom/ErrorComponents'
import { Button } from '@/components/ui/button'
import { DeleteDialog } from '@/components/custom/DialogComponents'

// TODOs #11:
// - Fix `value` prop on `input` should not be null. Consider using an empty string to clear the component or `undefined` for uncontrolled components.

interface GoalFormProps {
  isCreate: boolean
  defaultValues?: GoalResponse
}

const GoalForm: React.FC<GoalFormProps> = ({ isCreate, defaultValues }) => {
  const navigate = useNavigate()
  const router = useRouter()
  const canGoBack = useCanGoBack()

  const initialValues =
    defaultValues ||
    ({
      title: '',
      description: '',
      goalType: GoalQuantifyType.Numeric,
      numericTarget: null as unknown as number,
      numericUnit: '',
      publicity: GoalPublicityType.Private,
      colour: '',
      icon: '',
    } as CreateGoalDto)

  const { mutate: createGoalMutateFn } = useCreateGoalMutation()
  const { mutate: updateGoalMutateFn } = useUpdateGoalMutation()
  const { mutate: deleteGoalMutateFn } = useDeleteGoalMutation()

  const [displayedError, setDisplayedError] = useState<
    { category: ErrorDialogCategory; error: Error } | undefined
  >(undefined)

  const navigateBack = () => {
    if (canGoBack) {
      router.history.back()
    } else {
      navigate({ to: '/goals' })
    }
  }

  const form = useAppForm({
    defaultValues: initialValues,
    validators: {
      onChange: CreateGoalSchema,
    },
    onSubmit: ({ value }) => {
      if (isCreate) {
        createGoalMutateFn(value, {
          onSuccess: navigateBack,
          onError: (error) =>
            setDisplayedError({
              error: error,
              category: ErrorDialogCategory.FormSubmissionFailed,
            }),
        })
      } else {
        if (defaultValues?.id) {
          updateGoalMutateFn(
            { id: defaultValues.id, update: value },
            {
              onSuccess: navigateBack,
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

  const handleDelete = () => {
    if (defaultValues?.id) {
      deleteGoalMutateFn(defaultValues.id, {
        onSuccess: () => navigate({ to: '/goals' }),
        onError: (error) =>
          setDisplayedError({
            error: error,
            category: ErrorDialogCategory.DeleteFailed,
          }),
      })
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Topbar config */}
      <TopBarClose
        title={isCreate ? 'Create Goal' : 'Edit Goal'}
        closeCallback={navigateBack}
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
        <form.AppField name="title">
          {(field) => (
            <field.TextField
              label="Title"
              placeholder="e.g. Run a half marathon"
            />
          )}
        </form.AppField>

        <form.AppField name="description">
          {(field) => (
            <field.TextField
              label="Description"
              placeholder="Optional. Add more details if needed"
            />
          )}
        </form.AppField>

        {/* Goal type. Note: hiding when editing goal, as cannot convert goal entries between the two types */}
        {isCreate && (
          <form.AppField name="goalType">
            {(field) => (
              <field.RadioGroup
                label="Goal Type"
                values={[
                  { label: 'Numeric', value: GoalQuantifyType.Numeric },
                  { label: 'Boolean', value: GoalQuantifyType.Boolean },
                ]}
              />
            )}
          </form.AppField>
        )}

        <form.Subscribe selector={(state) => state.values.goalType}>
          {(goalType) => {
            if (goalType === GoalQuantifyType.Numeric) {
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <form.AppField name="numericTarget">
                    {(field) => (
                      <field.NumberField
                        label="Daily Target"
                        placeholder="e.g. 30"
                      />
                    )}
                  </form.AppField>
                  <form.AppField name="numericUnit">
                    {(field) => (
                      <field.TextField
                        label="Units"
                        placeholder="e.g. km, hours, sessions"
                      />
                    )}
                  </form.AppField>
                </div>
              )
            } else {
              return null
            }
          }}
        </form.Subscribe>

        <form.AppField name="publicity">
          {(field) => (
            <field.Select
              label="Privacy"
              values={[
                { label: 'Public', value: GoalPublicityType.Public },
                { label: 'Private', value: GoalPublicityType.Private },
              ]}
              placeholder="Select a publicity type"
            />
          )}
        </form.AppField>

        {/* Color selection */}
        <form.AppField name="colour">
          {(field) => <field.ColourSelect label="Colour" />}
        </form.AppField>

        {/* Icon selection */}
        <form.AppField name="icon">
          {(field) => <field.IconSelect label="Icon" />}
        </form.AppField>

        <div className="flex flex-row gap-1.5 justify-end">
          <form.AppForm>
            {!isCreate && (
              <DeleteDialog
                title="Delete Goal"
                description="Deleting a goal is permanent. This will also delete any associated entries. Are you sure you want to delete this goal?"
                onDelete={handleDelete}
              >
                <Button type="button" variant={'ghostDestructive'}>
                  Delete
                </Button>
              </DeleteDialog>
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

export function GoalCreatePage() {
  return <GoalForm isCreate={true} />
}

export function GoalEditPage() {
  const route = getRouteApi('/goals_/$goalId_/edit')
  const { goalId: goalId } = route.useParams()
  const { data, isLoading, error } = useGoal(goalId)

  return (
    <>
      {isLoading && <div>Loading...</div>}
      {error && <div>{error.message}</div>}
      {!isLoading && !error && (
        <GoalForm isCreate={false} defaultValues={data} />
      )}
    </>
  )
}
