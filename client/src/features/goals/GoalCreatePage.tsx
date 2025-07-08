import { useAppForm } from '../../hooks/form'
import { useEffect, useState } from "react";
import { TopBarClose } from "@/components/custom/TopBar";
import { getRouteApi, useMatch, useNavigate, useParams } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { GoalPublicityType, type GoalResponse, GoalQuantifyType } from '@habit-tracker/shared';
import { useGoal } from './GoalApi';
import { Button } from '@/components/ui/button';
import { ErrorDialogCategory, ErrorDialogComponent } from '@/components/custom/ErrorComponents';

// TODOss:
// - Zod validation
// - Fix bug where boolean goal type selected and values placed, but submit not working

// TODOs: move this + create new useGoal hook and place in GoalApi file

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
  } as GoalResponse;
  const initialIsDisplayNumerical = initialValues.goalType === GoalQuantifyType.Numeric;

  const formSubmitError: Error | undefined = new Error("Form Submit Error");
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);

  // Scroll into view today's cell
  useEffect(() => {
    if (formSubmitError && !isErrorDialogOpen) {
      setIsErrorDialogOpen(true);
    }
  }, [formSubmitError])

  const form = useAppForm({
    defaultValues: initialValues,
    validators: {
      onBlur: ({ value }) => {
        const errors = {
          fields: {},
        } as {
          fields: Record<string, string>
        }
        if (value.title.trim().length === 0) {
          errors.fields.title = 'Title is required'
        }
        return errors
      },
    },
    onSubmit: ({ value }) => {
      console.log(value)
      // Show success message
      alert('Form submitted successfully!')
    },
  })

  const [isDisplayNumericControls, setIsDisplayNumericControls] = useState<boolean>(initialIsDisplayNumerical);

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
          validators={{
            onChange: ({ value }) => {
              setIsDisplayNumericControls(value === GoalQuantifyType.Numeric);

              if (!value || value.trim().length === 0) {
                return 'Goal type is required'
              }
              
              return undefined
            },
          }}
        >
          {(field) => (
            <field.RadioGroup
              label="Goal Type"
              values={[
                { label: 'Numeric', value: 'numeric' },
                { label: 'Boolean', value: 'boolean' },
              ]}
            />
          )}
        </form.AppField>}

        {isDisplayNumericControls && <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <form.AppField
            name="numericTarget"
            validators={{
              onBlur: ({ value }) => {
                if (!value) {
                  return 'Target value is required'
                }
                return undefined
              },
            }}
          >
            {(field) => <field.NumberField label="Daily Target" placeholder="e.g. 30" />}
          </form.AppField>
          <form.AppField
            name="numericUnit"
            validators={{
              onBlur: ({ value }) => {
                if (!value || value.trim().length === 0) {
                  return 'Units are required'
                }
                return undefined
              },
            }}
          >
            {(field) => <field.TextField label="Units" placeholder="e.g. km, hours, sessions" />}
          </form.AppField>
        </div>}

        <form.AppField
          name="publicity"
          validators={{
            onChange: ({ value }) => {
              if (!value || value.trim().length === 0) {
                return 'Privacy type is required'
              }
              return undefined
            },
          }}
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
          validators={{
            onChange: ({ value }) => {
              if (!value || value.trim().length === 0) {
                return 'Colour is required'
              }
              return undefined
            },
          }}
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
          validators={{
            onChange: ({ value }) => {
              if (!value || value.trim().length === 0) {
                return 'Icon is required'
              }
              return undefined
            },
          }}
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
      <ErrorDialogComponent
        error={formSubmitError}
        category={ErrorDialogCategory.FormSubmissionFailed}
        isShow={isErrorDialogOpen}
        onClose={() => { 
          setIsErrorDialogOpen(false) 
        }}
      />
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
  const { goalId: goalIdStr } = route.useParams();
  const goalId = Number.parseInt(goalIdStr);

  const { data, isLoading, error } = useGoal(goalId);

  return (
    <>
      {isLoading && <div>Loading...</div>}
      {error && <div>{error.message}</div>}
      {!isLoading && !error && <GoalForm isCreate={false} defaultValues={data}/>}
    </>
  )
}
