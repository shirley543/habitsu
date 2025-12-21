import { useState } from 'react'
import { useCanGoBack, useNavigate, useRouter } from '@tanstack/react-router'
import {
  CreateUserSchema
  
} from '@habit-tracker/validation-schemas'
import z from 'zod'
import { useAppForm } from '../../hooks/form'
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
  useUser,
} from '../../apis/UserApi'
import type {UserResponseDto} from '@habit-tracker/validation-schemas';
import { TopBarClose } from '@/components/custom/TopBar'
import {
  ErrorDialogCategory,
  ErrorDialogComponent,
} from '@/components/custom/ErrorComponents'
import { Button } from '@/components/ui/button'
import { DeleteDialog } from '@/components/custom/DialogComponents'

// TODOs #11:
// - Fix `value` prop on `input` should not be null. Consider using an empty string to clear the component or `undefined` for uncontrolled components.

interface DeleteAccountFormProps {
  user: UserResponseDto | null | undefined
}

const DeleteAccountForm: React.FC<DeleteAccountFormProps> = ({ user }) => {
  const navigate = useNavigate()
  const router = useRouter()
  const canGoBack = useCanGoBack()

  const DeleteFormSchema = z
    .object({
      username: z.string(),
    })
    .refine(
      (data) =>
        // If form username matches current-user's username
        user && data.username === user.username,
      {
        message: 'You must type your username to confirm account deletion',
        path: ['username'],
      },
    )

  const { mutate: deleteUserMutateFn } = useDeleteUserMutation()

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
    defaultValues: {
      username: '',
    },
    validators: {
      onSubmit: DeleteFormSchema,
    },
    onSubmit: ({ value }) => {
      deleteUserMutateFn(undefined, {
        onSuccess: () => {
          // TODOs #10: Fix ERROR [ExceptionsHandler] TypeError: Converting circular structure to JSON, upon successful delete function (deleted in DB, but errors out)
          navigate({ to: '/' }) // /< Navigate to landing upon successful delete
        },
        onError: (error) =>
          setDisplayedError({
            error: error,
            category: ErrorDialogCategory.DeleteFailed,
          }),
      })
    },
  })

  return (
    <div className="flex flex-col gap-3">
      {/* Topbar config */}
      <TopBarClose title="Delete Account" closeCallback={navigateBack} />
      {/* Form controls container */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="space-y-6"
      >
        <div className="flex flex-col gap-2.5">
          <h2 className="text-red-700 text-base font-semibold">
            This action is permanent.
          </h2>
          <p className="text-sm font-normal [&>b]:text-red-700 [&>b]:font-semibold">
            Deleting your account will <b>remove</b> all your data and{' '}
            <b>cannot</b> be undone.
          </p>
          <p className="text-sm font-normal">
            To confirm, type your username below:
          </p>
        </div>

        <form.AppField name="username">
          {(field) => (
            <field.TextField
              label="Username"
              placeholder={`Type your username: ${user?.username}`}
            />
          )}
        </form.AppField>

        <div className="flex justify-end">
          <form.AppForm>
            <Button type="button" variant={'ghost'} onClick={navigateBack}>
              Cancel
            </Button>
            <form.SubscribeButton variant={'destructive'} label={'Delete'} />
          </form.AppForm>
        </div>
      </form>
      {displayedError && (
        <ErrorDialogComponent
          error={displayedError.error}
          category={displayedError.category}
          isShow={displayedError !== undefined}
          onClose={() => {
            setDisplayedError(undefined)
          }}
        />
      )}
    </div>
  )
}

export function DeleteAccountPage() {
  const { data, isLoading, error } = useUser()

  return (
    <>
      {isLoading && <div>Loading...</div>}
      {error && <div>{error.message}</div>}
      {!isLoading && !error && <DeleteAccountForm user={data} />}
    </>
  )
}
