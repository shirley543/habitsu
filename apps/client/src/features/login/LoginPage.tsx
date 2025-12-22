import { useNavigate } from '@tanstack/react-router'
import {
  
  CreateUserSchema,
  
  LoginUserSchema
} from '@habit-tracker/validation-schemas'
import { HTTPError } from 'ky'
import { useCreateUserMutation, useLoginUserMutation } from '../../apis/UserApi'
import { useAppForm } from '../../hooks/form'
import type {CreateUserDto, LoginUserDto} from '@habit-tracker/validation-schemas';


export const LoginPage: React.FC = () => {
  const navigate = useNavigate()

  const { mutate: loginUserMutateFn } = useLoginUserMutation()

  const loginInitialValues = {
    email: '',
    password: '',
  } as LoginUserDto

  const form = useAppForm({
    defaultValues: loginInitialValues,
    validators: {
      onChange: LoginUserSchema,
    },
    onSubmit: ({ value }) => {
      loginUserMutateFn(value, {
        onSuccess: () => {
          // TODOs #13: Investigate why this navigate is failing
          console.log('Success! navigate to goals...')
          navigate({ to: '/goals' })
          console.log('after navigate /goals')
        },
        onError: (error: Error) => {
          if (error instanceof HTTPError) {
            switch (error.response.status) {
              case 401:
                form.fieldInfo.password.instance?.setErrorMap({
                  onSubmit: 'Incorrect email or password. Try again.',
                })
                break
            }
          }
        },
      })
    },
  })

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
          {(field) => <field.PasswordField label="Password" />}
        </form.AppField>

        <div className="flex flex-row gap-1.5 justify-end">
          <form.AppForm>
            <form.SubscribeButton label={'Login'} />
          </form.AppForm>
        </div>
      </form>
    </div>
  )
}

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate()

  const { mutate: createUserMutateFn } = useCreateUserMutation()
  const { mutate: loginUserMutateFn } = useLoginUserMutation()

  const createInitialValues = {
    username: '',
    email: '',
    password: '',
  } as CreateUserDto

  const form = useAppForm({
    defaultValues: createInitialValues,
    validators: {
      onChange: CreateUserSchema,
    },
    onSubmit: ({ value }) => {
      createUserMutateFn(value, {
        onSuccess: () => {
          loginUserMutateFn(value, {
            onSuccess: () => navigate({ to: '/goals' }),
            onError: (error: unknown) => console.log(error),
          })
        },
        onError: (error: unknown) => console.log(error),
      })
    },
  })

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
            <form.SubscribeButton label={'Sign Up'} />
          </form.AppForm>
        </div>
      </form>
    </div>
  )
}
