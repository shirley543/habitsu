import React, { useState } from 'react'
import * as Popover from '@radix-ui/react-popover'

interface HoverPopoverProps {
  triggerElem: React.ReactNode
  contentElem: React.ReactNode
}

function HoverPopover({ triggerElem, contentElem }: HoverPopoverProps) {
  const [open, setOpen] = useState(false)

  const handleMouseEnter = () => {
    setOpen(true)
  }

  const handleMouseLeave = () => {
    setOpen(false)
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        asChild
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {triggerElem}
      </Popover.Trigger>
      <Popover.Content
        asChild
        // onMouseEnter={handleMouseLeave}
        // onMouseLeave={handleMouseLeave}
      >
        {contentElem}
      </Popover.Content>
    </Popover.Root>
  )
}

export default HoverPopover
