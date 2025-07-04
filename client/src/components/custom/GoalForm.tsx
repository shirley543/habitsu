import { useForm, type AnyFieldApi } from '@tanstack/react-form'
import { useStore } from '@tanstack/react-store'
import { GoalPublicityType, GoalQuantifyType, GoalSchema, type GoalSchemaType } from '@habit-tracker/shared'
// TODOsss import shared schemas

/**
 * Components
 */

function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {field.state.meta.isTouched && !field.state.meta.isValid ? (
        <em>{field.state.meta.errors.map((err) => err.message).join(',')}</em>
      ) : null}
      {field.state.meta.isValidating ? 'Validating...' : null}
    </>
  )
}

export default function GoalForm() {
  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      colour: "",
      publicity: GoalPublicityType.Private,
      goalType: GoalQuantifyType.Numeric,
      numericTarget: null as unknown as number,
      numericUnit: "",
    } as GoalSchemaType,
    validators: {
      onChange: GoalSchema,
    },
  })

  // const formErrors = useStore(form.store, (formState) => formState.errors)


  return (
    <div>
      <h1>Standard Schema Form Example</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <div>
          <form.Field
            name="title"
            children={(field) => {
              return (
                <>
                  <label htmlFor={field.name}>Title: </label>
                  <input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldInfo field={field} />
                </>
              )
            }}
          />
        </div>
        <div>
          <form.Field
            name="description"
            children={(field) => (
              <>
                <label htmlFor={field.name}>Description: </label>
                <input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>
        <div>
          <form.Field
            name="colour"
            children={(field) => (
              <>
                <label htmlFor={field.name}>Colour: </label>
                <input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <button type="submit" disabled={!canSubmit}>
              {isSubmitting ? '...' : 'Submit'}
            </button>
          )}
        />
      </form>
    </div>
  )
}
