import { useForm, type AnyFieldApi } from '@tanstack/react-form'
import { useStore } from '@tanstack/react-store'
import { z } from "zod";

// Form for creating a new goal or editing an existing goal.
// Goal comprises of a:
// - Title: string
// - Description: string
// - Colour: hex code, hence string?
// - Emoji: hex code, hence string?
// - Private/ Public: whether private (only visible to them), or public (visible to everyone)
// - Type: discrete (count) or continuous (measured value) [number] or checkbox (yes/ no) [boolean] (used by frontend for determining colour intensity)
//   - Numerical goal:
//     - Unit: string
//     - target: number
//   - Boolean goal:
//     - Value: boolean

export enum GoalPublicityType {
  Public = 'public',
  Private = 'private',
}

export enum GoalQuantifyType {
  Numerical = 'numerical',
  Boolean = 'boolean',
}

const GoalPublicityTypeSchema = z.nativeEnum(GoalPublicityType);

// TODOs: define schemas in shared folder/ lib/ package for use on both client and server-side.
// To investigate setting up monorepo and/ or package, or workspaces
export const typeDiscriminatorSchema = z.discriminatedUnion("type", [
  // Numerical goal schema
  z.object({
    type: z.literal(GoalQuantifyType.Numerical),
    targetValue: z.number({ required_error: "Target value is required" }),
  }),
  // Boolean goal schema
  z.object({
    type: z.literal(GoalQuantifyType.Boolean),
    targetValue: z.undefined(),
  }),
]);

const goalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  colour: z.string()
    .min(1, "Colour is required")
    .regex(/^#[a-fA-F0-9]+$/, "Colour must be a valid hex string"),
  publicity: GoalPublicityTypeSchema,
}).and(typeDiscriminatorSchema);


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

interface GoalSchemaInterface
{
  title: string;
  description: string;
  colour: string;
  type: string;
  targetValue?: number | undefined;
}

export default function GoalForm() {
  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      colour: "",
      // publicity: 'private' as GoalPublicity,
      // goalType: undefined,
      type: "numerical",
      targetValue: "" as unknown as number,
    } as GoalSchemaInterface,
    validators: {
      onChange: goalSchema,
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
