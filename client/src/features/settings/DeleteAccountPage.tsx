import { useAppForm } from '../../hooks/form'
import { useState } from "react";
import { TopBarClose } from "@/components/custom/TopBar";
import { getRouteApi, useCanGoBack, useNavigate, useRouter } from '@tanstack/react-router';
import { UserPublicityType, type UserResponse, CreateUserSchema, type CreateUserDto } from '@habit-tracker/shared';
import { useCreateUserMutation, useDeleteUserMutation, useUser, useUpdateUserMutation } from './UserApi';
import { ErrorDialogCategory, ErrorDialogComponent } from '@/components/custom/ErrorComponents';
import { Button } from '@/components/ui/button';
import { DeleteDialog } from '@/components/custom/DialogComponents';

// TODOss:
// - Fix `value` prop on `input` should not be null. Consider using an empty string to clear the component or `undefined` for uncontrolled components.

interface DeleteAccountFormProps {
  isCreate: boolean;
  defaultValues?: UserResponse;
}

const DeleteAccountForm: React.FC<DeleteAccountFormProps> = ({ isCreate, defaultValues }) => {
  const navigate = useNavigate();
  const router = useRouter()
  const canGoBack = useCanGoBack()

  const initialValues = defaultValues;

  const { mutate: updateUserMutateFn } = useUpdateUserMutation();
  // const { mutate: deleteUserMutateFn } = useDeleteUserMutation();

  const [displayedError, setDisplayedError] = useState<{ category: ErrorDialogCategory, error: Error }| undefined>(undefined);

  const navigateBack = () => {
    if (canGoBack) {
      router.history.back();
    } else {
      navigate({ to: "/goals"});
    }
  }

  const form = useAppForm({
    defaultValues: initialValues,
    validators: {
      onChange: CreateUserSchema,
    },
    onSubmit: ({ value }) => {
      deleteUserMutateFn(defaultValues.id, {
        onSuccess: () => navigate({ to: '/goals' }), ///< TODOs: navigate back to landing upon successful delete?
        onError: (error) => setDisplayedError({
          error: error,
          category: ErrorDialogCategory.DeleteFailed
        }),
      })
    },
  });

  return (
    <div className="flex flex-col gap-3">
      {/* Topbar config */}
      <TopBarClose title="Delete Account" 
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

        <form.AppField name="password">
          {(field) => <field.TextField label="Current Password" />}
        </form.AppField>
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

export function DeleteAccountPage() {
  const goalId = 1;
  const { data, isLoading, error } = useUser(goalId);
  // TODOsss update this to get current logged in user's details for user name, email, current password, etc.

  return (
    <>
      {isLoading && <div>Loading...</div>}
      {error && <div>{error.message}</div>}
      {!isLoading && !error && <DeleteAccountForm isCreate={false} defaultValues={data}/>}
    </>
  )
}
