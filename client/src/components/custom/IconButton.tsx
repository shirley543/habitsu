import { Button } from "../ui/button"
import { DynamicIcon, type IconName } from "lucide-react/dynamic"

interface IconButtonProps {
  iconName: IconName,
  onClickCallback: () => void;
}

/**
 * Icon button: displays icon within a secondary-coloured button
 * @returns 
 */
const IconButton: React.FC<IconButtonProps> = ({ iconName, onClickCallback }) => {
  return (
    <Button variant="secondary" size="icon" onClick={onClickCallback}>
      <DynamicIcon name={iconName} />
    </Button>
  )
}

export default IconButton;