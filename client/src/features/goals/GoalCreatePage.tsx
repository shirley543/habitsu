import { useAppForm } from '../../hooks/form'
import { useState } from "react";
import { TopBarClose } from "@/components/custom/TopBar";

// TODOss:
// - Zod validation
// - Fix bug where boolean goal type selected and values placed, but submit not working

export function GoalCreatePage() {
  const form = useAppForm({
    defaultValues: {
      title: '',
      description: '',
      goalType: 'numeric',
      target: {
        targetValue: null,
        targetUnit: '',
      },
      privacy: '',
      colour: '',
      icon: '',
    },
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

  const [isDisplayNumericControls, setIsDisplayNumericControls] = useState<boolean>(true);

  return (
    <div className="flex flex-col gap-3">
      {/* Topbar config */}
      <TopBarClose title="Create Goal" closeCallback={() => { console.log("Close create goal clicked") }} />
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

        <form.AppField
          name="goalType"
          validators={{
            onChange: ({ value }) => {
              setIsDisplayNumericControls(value === 'numeric');

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
        </form.AppField>

        {isDisplayNumericControls && <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <form.AppField
            name="target.targetValue"
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
            name="target.targetUnit"
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
          name="privacy"
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
                { label: 'Public', value: 'public' },
                { label: 'Private', value: 'private' },
              ]}
              placeholder="Select a privacy type"
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
            <form.SubscribeButton label="Submit" />
          </form.AppForm>
        </div>
      </form>
    </div>
  )
}