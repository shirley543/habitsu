import { CircleAlert } from 'lucide-react'

import { HTTPError } from 'ky'
import { Dialog, DialogTriggerSubtype } from './DialogComponents'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

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
  isShow?: boolean
  onClose: () => void
}

// TODOs #22: fix bug where clicking x does not close dialog, and clicking 'close' does not fade out dialog (sudden close)
function ErrorDialogComponent({
  error,
  category,
  isShow = true,
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

function triggerErrorToast(error: unknown) {
  const getErrorMessage = (error: unknown): string => {
    if (error instanceof HTTPError) {
      const httpErrorLabel = (() => {
        switch (error.response.status) {
          case 400:
            return 'Invalid input. Please check and try again.'
          case 401:
            return 'You are not logged in. Please log in again.'
          case 403:
            return 'You do not have permission to perform this action.'
          case 500:
            return 'Server error. Please try again later.'
          default:
            return 'Something went wrong. Please try again.'
        }
      })();
      const httpErrorMessage = `${httpErrorLabel} (${error.response.status})`
      return httpErrorMessage;
    } else if (error instanceof TypeError) {
      // e.g. Network failed
      return 'Network error. Please check your connection.'
    } else {
      return 'An unexpected error occurred.'
    };
  };

  const errorMessage = getErrorMessage(error);
  toast.error(errorMessage, {
    position: 'top-center',
    duration: 5000,
  })
}

export { ErrorBodyComponent, ErrorDialogComponent, triggerErrorToast }
