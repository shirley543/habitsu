import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useAppForm } from '../../hooks/form'

export function GoalCreatePage() {
  const form = useAppForm({
    defaultValues: {
      title: '',
      description: '',
      target: {
        targetValue: '',
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

  return (
    <div className="flex flex-col gap-3">
      {/* Topbar container */}
      <div className="topbar-container flex flex-row justify-between items-center">
        <h1 className="text-base font-extrabold">Create Goal</h1>
        <div className="buttons-container flex flex-row gap-1.5">
          <Button variant="secondary" size="icon">
            <X />
          </Button>
        </div>
      </div>
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
          {(field) => <field.TextField label="Title" />}
        </form.AppField>

        <form.AppField name="description">
          {(field) => <field.TextField label="Description" />}
        </form.AppField>

        <form.AppField
          name="target.targetValue"
          validators={{
            onBlur: ({ value }) => {
              if (!value || value.trim().length === 0) {
                return 'Target value is required'
              }
              return undefined
            },
          }}
        >
          {(field) => <field.TextField label="Daily Target" />}
        </form.AppField>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            {(field) => <field.TextField label="Units" />}
          </form.AppField>
        </div>

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