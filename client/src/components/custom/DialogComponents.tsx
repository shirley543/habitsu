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
}

function Dialog({ title, description, config, contentSlot }: DialogComponentProps) {
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
          <DialogClose asChild>
            <Button type="button" variant="secondary" onClick={config.subtype === DialogTriggerSubtype.Flag ? config.onClose : undefined}>
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </ShadcnDialog>
  )
}

export { Dialog, type DialogTriggerConfig, DialogTriggerSubtype };