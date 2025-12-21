import * as React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface DropdownMenuOptionsItemConfig {
  label: string
  onClick: () => void
}

interface DropdownMenuOptionsProps {
  title?: string
  itemsConfig: DropdownMenuOptionsItemConfig[]
  children: React.ReactNode
}

/**
 * Dropdown Menu: Options
 * Displays dropdown menu of options
 * @returns
 */
const DropdownMenuOptions = ({
  title,
  itemsConfig,
  children,
}: DropdownMenuOptionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>{title}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {itemsConfig.map((item) => {
          return (
            <DropdownMenuItem onClick={() => item.onClick()}>
              {item.label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default DropdownMenuOptions
