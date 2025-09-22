import { useAppForm } from '../../hooks/form'
import { useNavigate } from '@tanstack/react-router';
import { CreateUserSchema, LoginUserSchema, type CreateUserDto, type LoginUserDto } from '@habit-tracker/shared';
import { useCreateUserMutation, useLoginUserMutation } from '../../apis/UserApi';
import { HTTPError } from 'ky';


interface LoginPageProps {
}

export const LoginPage: React.FC<LoginPageProps> = () => {
  const navigate = useNavigate();

  const { mutate: loginUserMutateFn } = useLoginUserMutation();

  const loginInitialValues = {
    email: '',
    password: '',
  } as LoginUserDto;

  const form = useAppForm({
    defaultValues: loginInitialValues,
    validators: {
      onChange: LoginUserSchema,
    },
    onSubmit: ({ value }) => {
      loginUserMutateFn(value,
        {
          onSuccess: () => navigate({ to: '/goals' }),
          onError: (error: Error) => {
            if (error instanceof HTTPError) {
              switch (error.response.status) {
                case 401:
                  form.fieldInfo.password.instance?.setErrorMap({
						        onSubmit: "Incorrect email or password. Try again.",
					        });
                  break;
              }
            }
          }
        }
      )
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
        <form.AppField name="email">
          {(field) => <field.TextField label="Email" />}
        </form.AppField>

        <form.AppField name="password">
          {(field) => <field.TextField label="Password" type="password" />}
        </form.AppField>

        <div className="flex flex-row gap-1.5 justify-end">
          <form.AppForm>
            <form.SubscribeButton label={"Login"} />
          </form.AppForm>
        </div>
      </form>
    </div>
  )
}


interface SignUpPageProps {
}

export const SignUpPage: React.FC<SignUpPageProps> = () => {
  const navigate = useNavigate();

  const { mutate: createUserMutateFn } = useCreateUserMutation();
  const { mutate: loginUserMutateFn } = useLoginUserMutation();

  const createInitialValues = {
    username: '',
    email: '',
    password: '',
  } as CreateUserDto;

  const form = useAppForm({
    defaultValues: createInitialValues,
    validators: {
      onChange: CreateUserSchema,
    },
    onSubmit: ({ value }) => {
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
            <form.SubscribeButton label={"Sign Up"} />
          </form.AppForm>
        </div>
      </form>
    </div>
  )
}
