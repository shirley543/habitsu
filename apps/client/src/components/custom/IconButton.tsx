import { DynamicIcon  } from 'lucide-react/dynamic'
import React from 'react'
import { Button } from '../ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import type {IconName} from 'lucide-react/dynamic';

interface IconButtonProps {
  iconName: IconName
  tooltip?: string
  onClickCallback?: () => void
}

/**
 * Icon button: displays icon within a secondary-coloured button, and optional tooltip text
 * @returns
 */
const IconButton: React.ForwardRefRenderFunction<
  HTMLButtonElement,
  IconButtonProps
> = ({ iconName, tooltip, onClickCallback, ...props }, ref) => {
  const buttonComponent = (
    <Button
      variant="secondary"
      size="icon"
      onClick={onClickCallback}
      ref={ref}
      {...props}
    >
      <DynamicIcon name={iconName} />
    </Button>
  )

  return tooltip ? (
    <Tooltip>
      <TooltipTrigger asChild>{buttonComponent}</TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  ) : (
    buttonComponent
  )
}

export default React.forwardRef(IconButton)
