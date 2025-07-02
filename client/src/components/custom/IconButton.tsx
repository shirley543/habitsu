import { X } from "lucide-react"
import { Button } from "../ui/button"
import { DynamicIcon, type IconName } from "lucide-react/dynamic"

interface IconButtonProps {
  iconName: IconName,
}

/**
 * Icon button: displays icon within a secondary-coloured button
 * @returns 
 */
const IconButton: React.FC<IconButtonProps> = ({ iconName }) => {
  return (
    <Button variant="secondary" size="icon">
      <DynamicIcon name={iconName} />
    </Button>
  )
}

export default IconButton;