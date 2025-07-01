import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useAppForm } from '../../hooks/form'
import { DynamicIcon, type IconName } from "lucide-react/dynamic";


// type StandardIcons = Extract<IconName, "biceps-flexed" | "apple", >

const StandardIcons: IconName[] = [
  "biceps-flexed",
  "apple",
  "droplet",
  "book",
  "alarm-clock",
  "bed",
  "brain",
  "banknote",
  "paintbrush",
  "hourglass",
  "palette",
  "calendar",
  "pencil-line",
]

/**
 * From TailwindCSS hues for e.g. red/400
 */
enum ColourEnum {
  Red = "F87171",
  Orange = "FB923C",
  Amber = "FBBF24",
  Yellow = "FACC15",
  Lime = "A3E635",
  Green = "4ADE80",
  Emerald = "34D399",
  Teal = "2DD4BF",
  Cyan = "22D3EE",
  Sky = "38BDF8",
  Blue = "60A5FA",
  Indigo = "818CF8",
  Violet = "A78BFA",
  Purple = "C084FC",
  Fuschia = "E879F9",
  Pink = "F472B6",
  Rose = "FB7185",
}

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
            onBlur: ({ value }) => {
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
        <div className="flex flex-row flex-wrap gap-1.5">
          {Object.values(ColourEnum).map((colourEnum) => {
            // Note: wrapped with label so that whole displayed div is clickable as part of the radio button
            return <label>
              <input type="radio" name="color" value={`#${colourEnum}`} className="peer hidden" checked />
              <div className="w-9 h-9 rounded-xl shadow-xs bg-white border-2 border-white flex items-center justify-center peer-checked:border-black cursor-pointer">
                <div className="w-6 h-6 rounded-lg" style={{backgroundColor: `#${colourEnum}`}}></div>
              </div>
            </label>
            })}
        </div>

        {/* Icon selection */}
        <div className="flex flex-row flex-wrap gap-1.5">
          {StandardIcons.map((standardIcon) => {
            // Note: wrapped with label so that whole displayed div is clickable as part of the radio button
            return <label>
              <input type="radio" name="icon" value={standardIcon} className="peer hidden" checked />
              <div className="w-9 h-9 rounded-xl shadow-xs bg-white border-2 border-white flex items-center justify-center peer-checked:border-black cursor-pointer">
                <DynamicIcon name={standardIcon} />
              </div>
            </label>
            })}
        </div>

        <div className="flex justify-end">
          <form.AppForm>
            <form.SubscribeButton label="Submit" />
          </form.AppForm>
        </div>
      </form>
    </div>
  )
}