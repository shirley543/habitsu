import type { DropdownMenuCheckboxesItemConfig } from '@/components/custom/DropdownMenuCheckboxes'
import DropdownMenuCheckboxes from '@/components/custom/DropdownMenuCheckboxes'
import IconButton from '@/components/custom/IconButton'
import { useCurrentYear } from '@/hooks/useCurrentDate'

interface YearDropdownProps {
  selectedYear: number
  onSelect: (year: number) => void
}

const YearDropdown: React.FC<YearDropdownProps> = ({
  selectedYear,
  onSelect,
}) => {
  const startYear = 2024
  const currentYear = useCurrentYear()
  const yearMenuConfig: Array<DropdownMenuCheckboxesItemConfig<number>> =
    Array.from({ length: currentYear - startYear + 1 }, (_, i) => {
      const yearValue = startYear + i
      return {
        label: `Y${yearValue}`,
        value: yearValue,
      }
    })

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
