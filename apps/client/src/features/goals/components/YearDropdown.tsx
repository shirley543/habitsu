import { CalendarDays } from 'lucide-react'
import type {DropdownMenuCheckboxesItemConfig} from '@/components/custom/DropdownMenuCheckboxes';
import DropdownMenuCheckboxes from '@/components/custom/DropdownMenuCheckboxes'
import IconButton from '@/components/custom/IconButton'
import { Button } from '@/components/ui/button'

interface YearDropdownProps {
  selectedYear: number
  onSelect: (year: number) => void
}

const YearDropdown: React.FC<YearDropdownProps> = ({
  selectedYear,
  onSelect,
}) => {
  const yearMenuConfig: Array<DropdownMenuCheckboxesItemConfig<number>> = [
    { label: '2025', value: 2025 },
    { label: '2024', value: 2024 },
  ]

  return (
    <div className="year-calendar-container flex flex-row gap-1">
      <h2 className="text-xl font-bold">{selectedYear}</h2>
      <DropdownMenuCheckboxes<number>
        initialCheckedValue={selectedYear}
        itemsConfig={yearMenuConfig}
        selectionChangeCallback={(itemValue) => {
          onSelect(itemValue)
        }}
      >
        <IconButton
          iconName="calendar-days"
          tooltip="Select Year"
          onClickCallback={() => {}}
        />
        {/* <Button variant="secondary" size="icon">
          <CalendarDays />
        </Button> */}
      </DropdownMenuCheckboxes>
    </div>
  )
}

export { YearDropdown }
