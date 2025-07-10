import { useStore } from '@tanstack/react-form'

import { useFieldContext, useFormContext } from '../../hooks/form-context'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea as ShadcnTextarea } from '@/components/ui/textarea'
import * as ShadcnSelect from '@/components/ui/select'
import { Slider as ShadcnSlider } from '@/components/ui/slider'
import { Switch as ShadcnSwitch } from '@/components/ui/switch'
import { RadioGroup as ShadcnRadioGroup, RadioGroupItem as ShadcnRadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { DynamicIcon, type IconName } from 'lucide-react/dynamic'
import type { ChangeEvent } from 'react'


export const StandardIcons: IconName[] = [
  "biceps-flexed",
  "apple",
  "droplet",
  "book",
  "alarm-clock",
  "bed",
  "brain",
  "banknote",
  "paintbrush",
  "hourglass",
  "palette",
  "calendar",
  "pencil-line",
]

/**
 * From TailwindCSS hues for e.g. red/400
 */
export enum ColourEnum {
  Red = "F87171",
  Orange = "FB923C",
  Amber = "FBBF24",
  Yellow = "FACC15",
  Lime = "A3E635",
  Green = "4ADE80",
  Emerald = "34D399",
  Teal = "2DD4BF",
  Cyan = "22D3EE",
  Sky = "38BDF8",
  Blue = "60A5FA",
  Indigo = "818CF8",
  Violet = "A78BFA",
  Purple = "C084FC",
  Fuschia = "E879F9",
  Pink = "F472B6",
  Rose = "FB7185",
}



export function SubscribeButton({ label }: { label: string }) {
  const form = useFormContext()

  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button type="submit" disabled={isSubmitting}>
          {label}
        </Button>
      )}
    </form.Subscribe>
  )
}

function ErrorMessages({
  errors,
}: {
  errors: Array<string | { message: string }>
}) {
  return (
    <>
      {errors.map((error) => (
        <div
          key={typeof error === 'string' ? error : error.message}
          className="text-red-500 mt-1 font-bold"
        >
          {typeof error === 'string' ? error : error.message}
        </div>
      ))}
    </>
  )
}

export function NumberField({
  label,
  placeholder,
}: {
  label: string
  placeholder?: string
}) {
  const field = useFieldContext<number>()
  const errors = useStore(field.store, (state) => state.meta.errors)

  return (
    <div>
      <Label htmlFor={label} className="mb-2 text-xl font-bold">
        {label}
      </Label>
      <Input
        type="number"
        inputMode='numeric'
        value={field.state.value}
        placeholder={placeholder}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.valueAsNumber)}
      />
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}

export function TextField({
  label,
  placeholder,
}: {
  label: string
  placeholder?: string
}) {
  const field = useFieldContext<string>()
  const errors = useStore(field.store, (state) => state.meta.errors)

  return (
    <div>
      <Label htmlFor={label} className="mb-2 text-xl font-bold">
        {label}
      </Label>
      <Input
        value={field.state.value}
        placeholder={placeholder}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}

export function TextArea({
  label,
  rows = 3,
  placeholder,
}: {
  label: string
  rows?: number
  placeholder?: string
}) {
  const field = useFieldContext<string>()
  const errors = useStore(field.store, (state) => state.meta.errors)

  return (
    <div>
      <Label htmlFor={label} className="mb-2 text-xl font-bold">
        {label}
      </Label>
      <ShadcnTextarea
        id={label}
        value={field.state.value}
        onBlur={field.handleBlur}
        rows={rows}
        onChange={(e) => field.handleChange(e.target.value)}
        placeholder={placeholder}
      />
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}

export function Select({
  label,
  values,
  placeholder,
}: {
  label: string
  values: Array<{ label: string; value: string }>
  placeholder?: string
}) {
  const field = useFieldContext<string>()
  const errors = useStore(field.store, (state) => state.meta.errors)

  return (
    <div>
      <Label htmlFor={label} className="mb-2 text-xl font-bold">
        {label}
      </Label>
      <ShadcnSelect.Select
        name={field.name}
        value={field.state.value}
        onValueChange={(value) => field.handleChange(value)}
      >
        <ShadcnSelect.SelectTrigger className="w-full">
          <ShadcnSelect.SelectValue placeholder={placeholder} />
        </ShadcnSelect.SelectTrigger>
        <ShadcnSelect.SelectContent>
          <ShadcnSelect.SelectGroup>
            <ShadcnSelect.SelectLabel>{label}</ShadcnSelect.SelectLabel>
            {values.map((value) => (
              <ShadcnSelect.SelectItem key={value.value} value={value.value}>
                {value.label}
              </ShadcnSelect.SelectItem>
            ))}
          </ShadcnSelect.SelectGroup>
        </ShadcnSelect.SelectContent>
      </ShadcnSelect.Select>
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}

export function Slider({ label }: { label: string }) {
  const field = useFieldContext<number>()
  const errors = useStore(field.store, (state) => state.meta.errors)

  return (
    <div>
      <Label htmlFor={label} className="mb-2 text-xl font-bold">
        {label}
      </Label>
      <ShadcnSlider
        id={label}
        onBlur={field.handleBlur}
        value={[field.state.value]}
        onValueChange={(value) => field.handleChange(value[0])}
      />
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}

export function Switch({ label }: { label: string }) {
  const field = useFieldContext<boolean>()
  const errors = useStore(field.store, (state) => state.meta.errors)

  return (
    <div>
      <div className="flex items-center gap-2">
        <ShadcnSwitch
          id={label}
          onBlur={field.handleBlur}
          checked={field.state.value}
          onCheckedChange={(checked) => field.handleChange(checked)}
        />
        <Label htmlFor={label}>{label}</Label>
      </div>
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}

export function RadioGroup({ label, values }: {
  label: string
  values: Array<{ label: string; value: string }>
}) {
  const field = useFieldContext<string>()

  return (
    <div>
      <Label htmlFor={label} className="mb-2 text-xl font-bold">
        {label}
      </Label>
      <ShadcnRadioGroup defaultValue={values[0].value} className="grid-cols-2" onValueChange={(value) => field.handleChange(value)}>
        {values.map((value) => (
          <div key={value.value} className="flex items-center space-x-2">
            <ShadcnRadioGroupItem key={value.value} value={value.value} />
            <Label htmlFor={value.value}>{value.label}</Label>
          </div>
        ))}
      </ShadcnRadioGroup>
    </div>
  )
}

// TODOss:
// - consolidate ColourSelect and IconSelect to be more generic (a lot of similarities)
// - plus add abiliy to select a custom one via button to open popup (custom icon select, custom colour select)
export function ColourSelect({ label }: { label: string }) {
  const field = useFieldContext<string>()
  const errors = useStore(field.store, (state) => state.meta.errors)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    field.handleChange(event.target.value)
  };

  return (
    <div>
      <Label htmlFor={label} className="mb-2 text-xl font-bold">{label}</Label>
      <div className="flex flex-row flex-wrap gap-1.5">
        {Object.values(ColourEnum).map((colourEnum) => {
          // Note: wrapped with label so that whole displayed div is clickable as part of the radio button
          return <label key={colourEnum}>
            <input type="radio" name="color" value={colourEnum} className="peer hidden" 
              onChange={handleChange} readOnly={false} 
              checked={field.state.value === colourEnum}
            />
            <div className="w-9 h-9 rounded-xl shadow-xs bg-white border-2 border-white flex items-center justify-center peer-checked:border-black cursor-pointer">
              <div className="w-6 h-6 rounded-lg" style={{backgroundColor: `#${colourEnum}`}}></div>
            </div>
          </label>
        })}
      </div>
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}

export function IconSelect({ label }: { label: string }) {
  const field = useFieldContext<string>()
  const errors = useStore(field.store, (state) => state.meta.errors)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    field.handleChange(event.target.value)
  };

  return (
    <div>
      <Label htmlFor={label} className="mb-2 text-xl font-bold">{label}</Label>
      <div className="flex flex-row flex-wrap gap-1.5">
        {StandardIcons.map((standardIcon) => {
          // Note: wrapped with label so that whole displayed div is clickable as part of the radio button
          // TODOs: check for more accessible alternatives to `hidden`/ `display: none`
          return <label key={standardIcon}>
            <input type="radio" name="icon" value={standardIcon} className="peer hidden"
              onChange={handleChange} readOnly={false}
              checked={field.state.value === standardIcon}
            />
            <div className="w-9 h-9 rounded-xl shadow-xs bg-white border-2 border-white flex items-center justify-center peer-checked:border-black cursor-pointer">
              <DynamicIcon name={standardIcon} />
            </div>
          </label>
        })}
      </div>
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}
