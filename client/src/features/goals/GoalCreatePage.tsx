import { useAppForm } from '../../hooks/form'
import { useState } from "react";
import { TopBarClose } from "@/components/custom/TopBar";
import { getRouteApi, useNavigate } from '@tanstack/react-router';
import { GoalPublicityType, type GoalResponse, GoalQuantifyType, CreateGoalSchema, type CreateGoalDto } from '@habit-tracker/shared';
import { useCreateGoalMutation, useGoal, useUpdateGoalMutation } from './GoalApi';
import { ErrorDialogCategory, ErrorDialogComponent } from '@/components/custom/ErrorComponents';

// TODOss:
// - Fix `value` prop on `input` should not be null. Consider using an empty string to clear the component or `undefined` for uncontrolled components.

interface GoalFormProps {
  isCreate: boolean;
  defaultValues?: GoalResponse;
}

const GoalForm: React.FC<GoalFormProps> = ({ isCreate, defaultValues }) => {
  const navigate = useNavigate();
  const initialValues = defaultValues || {
    title: '',
    description: '',
    goalType: GoalQuantifyType.Numeric,
    numericTarget: null as unknown as number,
    numericUnit: '',
    publicity: GoalPublicityType.Private,
    colour: '',
    icon: '',
  } as CreateGoalDto;

  const { error: createError, mutate: createGoalMutateFn } = useCreateGoalMutation();
  const { error: editError, mutate: updateGoalMutateFn } = useUpdateGoalMutation();

  const [displayedError, setDisplayedError] = useState<Error | undefined>(undefined);

  const form = useAppForm({
    defaultValues: initialValues,
    validators: {
      onChange: CreateGoalSchema,
    },
    onSubmit: ({ value }) => {
      if (isCreate) {
        createGoalMutateFn(value, 
          {
            onSuccess: () => navigate({ to: "/goals"}),
            onError: (error) => setDisplayedError(error),
          }
        );
      } else {
        if (defaultValues?.id) {
          updateGoalMutateFn({ id: defaultValues?.id, update: value }, {
            onSuccess: () => navigate({ to: "/goals"}),
            onError: (error) => setDisplayedError(error),
          })
        }
      }
    },
  });

  return (
    <div className="flex flex-col gap-3">
      {/* Topbar config */}
      <TopBarClose title={isCreate ? "Create Goal" : "Edit Goal"} 
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
        <form.AppField name="title">
          {(field) => <field.TextField label="Title" placeholder="e.g. Run a half marathon" />}
        </form.AppField>

        <form.AppField name="description">
          {(field) => <field.TextField label="Description" placeholder="Optional. Add more details if needed" />}
        </form.AppField>

        {/* Goal type. Note: hiding when editing goal, as cannot convert goal entries between the two types */}
        {isCreate && <form.AppField
          name="goalType"
        >
          {(field) => (
            <field.RadioGroup
              label="Goal Type"
              values={[
                { label: 'Numeric', value: GoalQuantifyType.Numeric },
                { label: 'Boolean', value: GoalQuantifyType.Boolean },
              ]}
            />
          )}
        </form.AppField>}

        <form.Subscribe selector={(state) => state.values.goalType}>
          {
            (goalType) => {
              if (goalType === GoalQuantifyType.Numeric){
                return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <form.AppField
                    name="numericTarget"
                  >
                    {(field) => <field.NumberField label="Daily Target" placeholder="e.g. 30" />}
                  </form.AppField>
                  <form.AppField
                    name="numericUnit"
                  >
                    {(field) => <field.TextField label="Units" placeholder="e.g. km, hours, sessions" />}
                  </form.AppField>
              </div>
              } else {
                return null
              }
            }
          }
        </form.Subscribe>

        <form.AppField
          name="publicity"
        >
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
        <form.AppField
          name="colour"
        >
          {(field) => (
            <field.ColourSelect
              label="Colour"
            />
          )}
        </form.AppField>

        {/* Icon selection */}
        <form.AppField
          name="icon"
        >
          {(field) => (
            <field.IconSelect
              label="Icon"
            />
          )}
        </form.AppField>

        <div className="flex justify-end">
          <form.AppForm>
            <form.SubscribeButton label={isCreate ? "Create" : "Save"} />
          </form.AppForm>
        </div>
      </form>
      {(displayedError) && <ErrorDialogComponent
        error={displayedError}
        category={ErrorDialogCategory.FormSubmissionFailed}
        isShow={displayedError !== undefined}
        onClose={() => { 
          setDisplayedError(undefined) 
        }}
      />}
    </div>
  )
}

export function GoalCreatePage() {
  return (
    <GoalForm isCreate={true}/>
  )
}


export function GoalEditPage() {
  const route = getRouteApi('/goals_/$goalId_/edit')
  const { goalId: goalId } = route.useParams();
  const { data, isLoading, error } = useGoal(goalId);

  return (
    <>
      {isLoading && <div>Loading...</div>}
      {error && <div>{error.message}</div>}
      {!isLoading && !error && <GoalForm isCreate={false} defaultValues={data}/>}
    </>
  )
}
