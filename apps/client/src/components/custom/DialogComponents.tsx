import {
  Dialog as ShadcnDialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

enum DialogTriggerSubtype {
  Slot = 'slot',
  Flag = 'flag'
}

type DialogTriggerConfig = {
  subtype: DialogTriggerSubtype.Slot,
  triggerSlot: React.ReactNode,
} | {
  subtype: DialogTriggerSubtype.Flag,
  triggerFlag: boolean,
  onClose: () => void,
}

interface DialogComponentProps {
  title: string,
  description: string,
  config: DialogTriggerConfig, 
  contentSlot?: React.ReactNode,
  buttonsSlot?: React.ReactNode,
}

function Dialog({ title, description, config, contentSlot, buttonsSlot }: DialogComponentProps) {
  return (
    <ShadcnDialog open={config.subtype === DialogTriggerSubtype.Flag ? config.triggerFlag : undefined}>
      {config.subtype === DialogTriggerSubtype.Slot && <DialogTrigger asChild>
        {config.triggerSlot}
      </DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        {contentSlot}
        <DialogFooter className="sm:justify-end">
          {
            buttonsSlot ? 
              buttonsSlot : 
              <DialogClose asChild>
                <Button type="button" variant="secondary" onClick={config.subtype === DialogTriggerSubtype.Flag ? config.onClose : undefined}>
                  Close
                </Button>
              </DialogClose>
          }
        </DialogFooter>
      </DialogContent>
    </ShadcnDialog>
  )
}

interface DeleteDialogComponentProps {
  title: string,
  description: string,
  onDelete: () => void,
  children: React.ReactNode,
}

function DeleteDialog({ title, description, onDelete, children }: DeleteDialogComponentProps) {
  const buttonsSlot = (
    <div className="flex flex-row gap-1.5">
      <DialogClose asChild>
        <Button type="button" variant="secondary">
          Cancel
        </Button>
      </DialogClose>
      <Button type="button" variant="destructive" onClick={onDelete}>
        Delete
      </Button>
    </div>
  )

  return <Dialog
    title={title}
    description={description}
    buttonsSlot={buttonsSlot}
    config={{
      subtype: DialogTriggerSubtype.Slot,
      triggerSlot: children
    }}
  />
}

export { Dialog, DeleteDialog, type DialogTriggerConfig, DialogTriggerSubtype };