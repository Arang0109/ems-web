import { Label } from "@shared/ui/primitives"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export interface RadioOption {
  value: string
  label: string
  disabled?: boolean
}

interface HorizontalRadioGroupProps {
  options: RadioOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  name?: string
  disabled?: boolean
  className?: string
}

export const HorizontalRadioGroup = ({
  options,
  value,
  defaultValue,
  onValueChange,
  name,
  disabled,
  className,
}: HorizontalRadioGroupProps) => {
  return (
    <RadioGroup
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      name={name}
      disabled={disabled}
      className={`flex flex-row flex-wrap gap-x-6 gap-y-2 ${className ?? ""}`}
    >
      {options.map((option) => (
        <div key={option.value} className="flex items-center gap-2">
          <RadioGroupItem
            value={option.value}
            id={`radio-${name ?? "group"}-${option.value}`}
            disabled={option.disabled}
          />
          <Label
            htmlFor={`radio-${name ?? "group"}-${option.value}`}
            className="cursor-pointer"
          >
            {option.label}
          </Label>
        </div>
      ))}
    </RadioGroup>
  )
}
