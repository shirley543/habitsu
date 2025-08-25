import { useAppForm } from '../../hooks/form'
import { useCanGoBack, useNavigate, useRouter } from '@tanstack/react-router';
import { CreateUserSchema, LoginUserSchema, type CreateUserDto } from '@habit-tracker/shared';
import { useCreateUserMutation, useLoginUserMutation } from '../../apis/UserApi';


interface LoginFormProps {
  isCreate: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ isCreate }) => {
  const navigate = useNavigate();
  const router = useRouter()
  const canGoBack = useCanGoBack()

  const { mutate: createUserMutateFn } = useCreateUserMutation();
  const { mutate: loginUserMutateFn } = useLoginUserMutation();

  const initialValues = {
    username: '',
    email: '',
    password: '',
  } as CreateUserDto;


  const form = useAppForm({
    defaultValues: initialValues,
    validators: {
      // onChange: isCreate ? CreateUserSchema : LoginUserSchema,
      onChange: CreateUserSchema,
    },
    onSubmit: ({ value }) => {
      if (isCreate) {
        createUserMutateFn(value, 
          {
            onSuccess: () => {
              loginUserMutateFn(value,
                {
                  onSuccess: () => navigate({ to: '/goals' }),
                  onError: (error: any) => console.log(error)
                }
              )
            },
            onError: (error: any) => console.log(error)
          }
        );
      } else {
        loginUserMutateFn(value,
          {
            onSuccess: () => navigate({ to: '/goals' }),
            onError: (error: any) => console.log(error)
          }
        )
      }
    },
  });

  return (
    <div className="flex flex-col gap-3">
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

        <form.AppField name="password">
          {(field) => <field.TextField label="Password" />}
        </form.AppField>

        <div className="flex flex-row gap-1.5 justify-end">
          <form.AppForm>
            <form.SubscribeButton label={isCreate ? "Sign Up" : "Login"} />
          </form.AppForm>
        </div>
      </form>
    </div>
  )
}

export function LoginPage() {
  return (
    <LoginForm isCreate={false}/>
  )
}

export function SignUpPage() {
  return (
    <LoginForm isCreate={true}/>
  )
}
