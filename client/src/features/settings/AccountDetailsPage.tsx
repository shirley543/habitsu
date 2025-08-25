import { useAppForm } from '../../hooks/form'
import { useState } from "react";
import { TopBarClose } from "@/components/custom/TopBar";
import { getRouteApi, useCanGoBack, useNavigate, useRouter } from '@tanstack/react-router';
import { type UpdateUserDto, type UserResponseDto, UpdateUserSchema } from '@habit-tracker/shared';
import { useUser, useUpdateUserMutation } from '../../apis/UserApi';
import { ErrorDialogCategory, ErrorDialogComponent } from '@/components/custom/ErrorComponents';
import { Button } from '@/components/ui/button';
import { DeleteDialog } from '@/components/custom/DialogComponents';
import z from 'zod';


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
      message: "New password and confirm password must match",
      path: ["confirmPassword"],
    }
  );

type UpdateUserFormType = z.infer<typeof UpdateUserFormSchema>;

interface AccountDetailsFormProps {
  defaultValues: UserResponseDto;
}

const AccountDetailsForm: React.FC<AccountDetailsFormProps> = ({ defaultValues }) => {
  const navigate = useNavigate();
  const router = useRouter()
  const canGoBack = useCanGoBack()

  const initialValues: UpdateUserFormType = defaultValues;

  const { mutate: updateUserMutateFn } = useUpdateUserMutation();

  const [displayedError, setDisplayedError] = useState<{ category: ErrorDialogCategory, error: Error }| undefined>(undefined);

  const navigateBack = () => {
    if (canGoBack) {
      router.history.back();
    } else {
      navigate({ to: "/settings"});
    }
  }

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
      updateUserMutateFn({ update: updateValue }, {
        onSuccess: navigateBack,
        onError: (error) => setDisplayedError({
          error: error,
          category: ErrorDialogCategory.FormSubmissionFailed
        }),
      })
    },
  });

  return (
    <div className="flex flex-col gap-3">
      {/* Topbar config */}
      <TopBarClose title="Account Details" 
        closeCallback={navigateBack}
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
            <Button type="button" variant={'ghost'} onClick={navigateBack}>
              Cancel
            </Button>
            <form.SubscribeButton label={"Save"} />
          </form.AppForm>
        </div>

      </form>
      {(displayedError) && <ErrorDialogComponent
        error={displayedError.error}
        category={displayedError.category}
        isShow={displayedError !== undefined}
        onClose={() => { 
          setDisplayedError(undefined) 
        }}
      />}
    </div>
  )
}

export function AccountDetailsPage() {
  const { data, isLoading, error } = useUser();
  // TODOsss update this to get current logged in user's details for user name, email, etc.

  return (
    <>
      {isLoading && <div>Loading...</div>}
      {/* // TODOss show error message. Some better handling */}
      {error && <div>{error.message}</div>}
      {!isLoading && !error && data && <AccountDetailsForm defaultValues={data}/>}
    </>
  )
}
