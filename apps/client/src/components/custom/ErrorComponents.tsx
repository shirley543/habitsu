import { CircleAlert } from 'lucide-react'

import { HTTPError } from 'ky'
import {
  Dialog,
  
  DialogTriggerSubtype
} from './DialogComponents'
import type {DialogTriggerConfig} from './DialogComponents';
import { Button } from '@/components/ui/button'

interface ErrorBaseProps {
  error: Error | HTTPError
}

interface ErrorBodyComponentProps extends ErrorBaseProps {
  onRefreshClick: () => void
  onBackClick?: () => void
}

function ErrorBodyComponent({
  error,
  onRefreshClick,
  onBackClick,
}: ErrorBodyComponentProps) {
  const errorText = (() => {
    if (error instanceof HTTPError) {
      return `(${error.response.status})`
    } else {
      return error.message
    }
  })()

  return (
    <div className="flex flex-col gap-4 pt-18 items-center">
      <CircleAlert size={`64px`} strokeWidth={2.5} />
      <div>
        <h2 className="text-base font-black text-center">
          Oops! Something went wrong
        </h2>
        <p className="text-sm font-normal text-center">
          Refresh the page and try again. {errorText}
        </p>
      </div>
      <div className="flex flex-row gap-2">
        {onBackClick && (
          <Button onClick={onBackClick} variant="secondary">
            Back
          </Button>
        )}
        <Button onClick={onRefreshClick}>Refresh</Button>
      </div>
    </div>
  )
}

export enum ErrorDialogCategory {
  FormSubmissionFailed = 'form-submission-failed',
  SettingChangeFailed = 'setting-change-failed',
  DeleteFailed = 'delete-failed',
}

interface ErrorDialogComponentProps extends ErrorBaseProps {
  category: ErrorDialogCategory
  isShow: boolean
  onClose: () => void
}

// TODOs #22: fix bug where clicking x does not close dialog, and clicking 'close' does not fade out dialog (sudden close)
function ErrorDialogComponent({
  error,
  category,
  isShow,
  onClose,
}: ErrorDialogComponentProps) {
  const descriptionText = (() => {
    if (error instanceof HTTPError) {
      return `Please try again later. (${error.response.status})`
    } else {
      return `${error.message}. Please try again later.`
    }
  })()

  const ERROR_DIALOG_STRINGS: Record<
    ErrorDialogCategory,
    { title: string; description: string }
  > = {
    [ErrorDialogCategory.FormSubmissionFailed]: {
      title: 'Form Submission Failed',
      description: descriptionText,
    },
    [ErrorDialogCategory.SettingChangeFailed]: {
      title: 'Setting Change Failed',
      description: descriptionText,
    },
    [ErrorDialogCategory.DeleteFailed]: {
      title: 'Item Deletion Failed',
      description: descriptionText,
    },
  }

  return (
    <Dialog
      title={ERROR_DIALOG_STRINGS[category].title}
      description={ERROR_DIALOG_STRINGS[category].description}
      config={{
        subtype: DialogTriggerSubtype.Flag,
        triggerFlag: isShow,
        onClose: onClose,
      }}
    />
  )
}

export { ErrorBodyComponent, ErrorDialogComponent }
