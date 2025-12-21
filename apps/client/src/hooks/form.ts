import { createFormHook } from '@tanstack/react-form'

import {
  ColourSelect,
  DateField,
  IconSelect,
  NumberField,
  PasswordField,
  RadioGroup,
  Select,
  SubscribeButton,
  TextArea,
  TextField,
} from '../components/custom/FormComponents'
import { fieldContext, formContext } from './form-context'

export const { useAppForm } = createFormHook({
  fieldComponents: {
    TextField,
    PasswordField,
    NumberField,
    DateField,
    Select,
    TextArea,
    RadioGroup,
    ColourSelect,
    IconSelect,
  },
  formComponents: {
    SubscribeButton,
  },
  fieldContext,
  formContext,
})
