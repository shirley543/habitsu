import * as React from "react"
import { type DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu"

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Checked = DropdownMenuCheckboxItemProps["checked"]

// TODOss: have value type be assigned at creation
export interface DropdownMenuCheckboxesItemConfig {
  label: string,
  value: string,
}

interface DropdownMenuCheckboxesProps {
  title?: string,
  initialCheckedValue: string,
  itemsConfig: DropdownMenuCheckboxesItemConfig[],
  selectionChangeCallback: (itemValue: string) => void;
  children: React.ReactNode,
}

/**
 * Dropdown Menu: Checkboxes
 * Displays dropdown menu of options, with current selected value checked
 * @returns 
 */
const DropdownMenuCheckboxes: React.FC<DropdownMenuCheckboxesProps> = ({ title, initialCheckedValue, itemsConfig, selectionChangeCallback, children }) => {
  const [checkedValue, setCheckedValue] = React.useState<string>(initialCheckedValue)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-32">
        {title && <>
          <DropdownMenuLabel>{title}</DropdownMenuLabel>
          <DropdownMenuSeparator />
        </>}
        {
          itemsConfig.map((item) => {
            return (
              <DropdownMenuCheckboxItem
                checked={checkedValue === item.value}
                onCheckedChange={() => {
                  setCheckedValue(item.value);
                  selectionChangeCallback(item.value);
                }}
              >
                {item.label}
              </DropdownMenuCheckboxItem>
            )
          })
        }
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default DropdownMenuCheckboxes