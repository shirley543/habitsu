import { createFormHook } from '@tanstack/react-form'

import {
  ColourSelect,
  IconSelect,
  NumberField,
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
    NumberField,
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
