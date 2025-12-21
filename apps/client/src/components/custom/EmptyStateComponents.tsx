import { BoxSelect } from "lucide-react";
import { Button } from "@/components/ui/button"

interface EmptyStateBodyComponentProps {
  onButtonClick: () => void,
  headerText?: string,
  descriptionText?: string,
}

function EmptyStateBodyComponent({
  onButtonClick,
  headerText="No goals yet",
  descriptionText="Goals help you stay focused and track your progress over time."
}: EmptyStateBodyComponentProps) {
  return (
    <div className="flex flex-col gap-4 pt-18 items-center">
      <BoxSelect size={`64px`} strokeWidth={2.5} />
      <div>
        <h2 className="text-base font-black text-center">{headerText}</h2>
        <p className="text-sm font-normal text-center">{descriptionText}</p>
      </div>
      <div className="flex flex-row gap-2">
        <Button onClick={onButtonClick}>Create a Goal</Button>
      </div>
    </div>
  );
};

export { EmptyStateBodyComponent };