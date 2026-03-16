import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Dialog as ShadcnDialog,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '../ui/spinner'
import { useState } from 'react'

enum DialogTriggerSubtype {
  Slot = 'slot',
  Flag = 'flag',
}

type DialogTriggerConfig =
  | {
      subtype: DialogTriggerSubtype.Slot
      triggerSlot: React.ReactNode
    }
  | {
      subtype: DialogTriggerSubtype.Flag
      triggerFlag: boolean
      onClose: () => void
    }

interface DialogComponentProps {
  title: string
  description: string
  config: DialogTriggerConfig
  contentSlot?: React.ReactNode
  buttonsSlot?: React.ReactNode
}

function Dialog({
  title,
  description,
  config,
  contentSlot,
  buttonsSlot,
}: DialogComponentProps) {
  return (
    <ShadcnDialog
      open={
        config.subtype === DialogTriggerSubtype.Flag
          ? config.triggerFlag
          : undefined
      }
    >
      {config.subtype === DialogTriggerSubtype.Slot && (
        <DialogTrigger asChild>{config.triggerSlot}</DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {contentSlot}
        <DialogFooter className="sm:justify-end">
          {buttonsSlot ? (
            buttonsSlot
          ) : (
            <DialogClose asChild>
              <Button
                type="button"
                variant="secondary"
                onClick={
                  config.subtype === DialogTriggerSubtype.Flag
                    ? config.onClose
                    : undefined
                }
              >
                Close
              </Button>
            </DialogClose>
          )}
        </DialogFooter>
      </DialogContent>
    </ShadcnDialog>
  )
}

interface DeleteDialogProps {
  title: string
  description: string
  onDelete: () => Promise<void>
  children: React.ReactNode
}

function DeleteDialog({ title, description, onDelete, children }: DeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleClick = async () => {
    setIsDeleting(true)
    try {
      await onDelete()
    } finally {
      setIsDeleting(false)
    }
  }

  const buttonsSlot = (
    <div className="flex flex-row gap-1.5">
      <DialogClose asChild>
        <Button type="button" variant="secondary" disabled={isDeleting}>
          Cancel
        </Button>
      </DialogClose>
      <Button type="button" variant="destructive" onClick={handleClick} disabled={isDeleting}>
        {isDeleting && <Spinner data-icon="inline-start" />}
        Delete
      </Button>
    </div>
  )

  return (
    <Dialog
      title={title}
      description={description}
      buttonsSlot={buttonsSlot}
      config={{
        subtype: DialogTriggerSubtype.Slot,
        triggerSlot: children,
      }}
    />
  )
}

export { Dialog, DeleteDialog, type DialogTriggerConfig, DialogTriggerSubtype }
