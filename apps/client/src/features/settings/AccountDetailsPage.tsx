import { useState } from 'react'
import { useCanGoBack, useNavigate, useRouter } from '@tanstack/react-router'
import z from 'zod'
import { useAppForm } from '../../hooks/form'
import { useUpdateUserMutation, useUser } from '../../apis/UserApi'
import type {
  UpdateUserDto,
  UserResponseDto,
} from '@habit-tracker/validation-schemas'
import { TopBarClose } from '@/components/custom/TopBar'
import {
  ErrorBodyComponent,
  ErrorBodyComponentPosition,
  ErrorBodyComponentSize,
  ErrorDialogCategory,
  ErrorDialogComponent,
} from '@/components/custom/ErrorComponents'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

const UpdateUserFormSchema = z
  .object({
    username: z.string().optional(),
    email: z.string().email().optional(),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) =>
      // If not changing password, skip
      (!data.newPassword && !data.confirmPassword) ||
      data.newPassword === data.confirmPassword,
    {
      message: 'New password and confirm password must match',
      path: ['confirmPassword'],
    },
  )

type UpdateUserFormType = z.infer<typeof UpdateUserFormSchema>

interface AccountDetailsFormProps {
  defaultValues: UserResponseDto
  closeCallback: () => void
}

const AccountDetailsForm: React.FC<AccountDetailsFormProps> = ({
  defaultValues,
  closeCallback,
}) => {
  const initialValues: UpdateUserFormType = defaultValues

  const { mutate: updateUserMutateFn } = useUpdateUserMutation()

  const [displayedError, setDisplayedError] = useState<
    { category: ErrorDialogCategory; error: Error } | undefined
  >(undefined)

  const form = useAppForm({
    defaultValues: initialValues,
    validators: {
      onChange: UpdateUserFormSchema,
    },
    onSubmit: ({ value }) => {
      const updateValue: UpdateUserDto = {
        username: value.username,
        email: value.email,
        password: value.newPassword,
      }
      updateUserMutateFn(
        { update: updateValue },
        {
          onSuccess: closeCallback,
          onError: (error) =>
            setDisplayedError({
              error: error,
              category: ErrorDialogCategory.FormSubmissionFailed,
            }),
        },
      )
    },
  })

  return (
    <>
      {/* Form controls container */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="space-y-6"
      >
        <form.AppField name="username">
          {(field) => <field.TextField label="Username" />}
        </form.AppField>

        <form.AppField name="email">
          {(field) => <field.TextField label="Email" />}
        </form.AppField>

        <form.AppField name="newPassword">
          {(field) => <field.TextField label="Current Password" />}
        </form.AppField>

        <form.AppField name="newPassword">
          {(field) => <field.TextField label="New Password" />}
        </form.AppField>

        <form.AppField name="confirmPassword">
          {(field) => <field.TextField label="Confirm New Password" />}
        </form.AppField>

        <div className="flex justify-end">
          <form.AppForm>
            <Button type="button" variant={'ghost'} onClick={closeCallback}>
              Cancel
            </Button>
            <form.SubscribeButton label={'Save'} />
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
    </>
  )
}

export function AccountDetailsPage() {
  const { data, isLoading, error, refetch: userRefetch } = useUser()
  const navigate = useNavigate()
  const router = useRouter()
  const canGoBack = useCanGoBack()

  const navigateBack = () => {
    if (canGoBack) {
      router.history.back()
    } else {
      navigate({ to: '/goals' })
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <TopBarClose title="Account Details" closeCallback={navigateBack} />
      {isLoading && (
        <div className="flex justify-center items-center w-full h-full">
          <Spinner className="size-28" />
        </div>
      )}
      {error && (
        <ErrorBodyComponent
          error={error}
          size={ErrorBodyComponentSize.Small}
          position={ErrorBodyComponentPosition.Centered}
          onRefreshClick={() => userRefetch()}
        />
      )}
      {!isLoading && !error && data && (
        <AccountDetailsForm defaultValues={data} closeCallback={navigateBack} />
      )}
    </div>
  )
}
