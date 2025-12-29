import * as React from 'react'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface DropdownMenuCheckboxesItemConfig<T> {
  label: string
  value: T
}

interface DropdownMenuCheckboxesProps<T> {
  title?: string
  initialCheckedValue: T
  itemsConfig: Array<DropdownMenuCheckboxesItemConfig<T>>
  selectionChangeCallback: (itemValue: T) => void
  children: React.ReactNode
}

/**
 * Dropdown Menu: Checkboxes
 * Displays dropdown menu of options, with current selected value checked
 * @returns
 */
const DropdownMenuCheckboxes = <T,>({
  title,
  initialCheckedValue,
  itemsConfig,
  selectionChangeCallback,
  children,
}: DropdownMenuCheckboxesProps<T>) => {
  const [checkedValue, setCheckedValue] = React.useState<T>(initialCheckedValue)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-32">
        {title && (
          <>
            <DropdownMenuLabel>{title}</DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        {itemsConfig.map((item) => {
          return (
            <DropdownMenuCheckboxItem
              checked={checkedValue === item.value}
              onCheckedChange={() => {
                setCheckedValue(item.value)
                selectionChangeCallback(item.value)
              }}
            >
              {item.label}
            </DropdownMenuCheckboxItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default DropdownMenuCheckboxes
