import { createFormHook } from '@tanstack/react-form'

import {
  ColourSelect,
  IconSelect,
  Select,
  SubscribeButton,
  TextArea,
  TextField,
} from '../components/custom/formComponents'
import { fieldContext, formContext } from './form-context'

export const { useAppForm } = createFormHook({
  fieldComponents: {
    TextField,
    Select,
    TextArea,
    ColourSelect,
    IconSelect,
  },
  formComponents: {
    SubscribeButton,
  },
  fieldContext,
  formContext,
})
