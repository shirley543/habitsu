import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useAppForm } from '../../hooks/form'
import { useState } from "react";
import IconButton from "@/components/custom/IconButton";
import { TopBarClose } from "@/components/custom/TopBar";

// TODOss:
// - Zod validation
// - Date and units passed in
// - Date not changeable (read only)

export function EntryCreatePage() {
  const goalUnits = "Hours";
  const date = new Date(2025, 1, 1);
  const dateStr = date.toDateString();

  const form = useAppForm({
    defaultValues: {
      date: '',
      progressValue: null,
      notes: '',
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
      <TopBarClose title="Create Entry" closeCallback={() => { console.log("Close create entry clicked") }} />
      {/* Form controls container */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="space-y-6"
      >
        <form.AppField name="date">
          {(field) => <field.TextField label="Date" placeholder="Date" />}
        </form.AppField>

        <form.AppField
          name="progressValue"
          validators={{
            onBlur: ({ value }) => {
              if (!value) {
                return `${goalUnits} is required`
              }
              return undefined
            },
          }}
        >
          {(field) => <field.NumberField label={goalUnits} placeholder={goalUnits} />}
        </form.AppField>

        <form.AppField
          name="notes"
        >
          {(field) => <field.TextArea label="Notes" placeholder="Type your notes here" />}
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