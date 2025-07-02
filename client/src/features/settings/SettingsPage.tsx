import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@radix-ui/react-label";
import { RadioGroup } from "@radix-ui/react-radio-group";
import { RadioGroupItem } from "@/components/ui/radio-group";

export function SettingsPage() {
  return (
    <div className="flex flex-col gap-3">
      <h2></h2>
      <Card>
        <Button>Test</Button>
        <RadioGroup>
          <RadioGroupItem value="1">
          </RadioGroupItem>
          <Label>Label</Label>
          {/* <ShadcnRadioGroupItem key={value.value} value={value.value} />
          <Label htmlFor={value.value}>{value.label}</Label> */}
          
        </RadioGroup>
      </Card>
    </div>
  )
}