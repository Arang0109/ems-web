import { Checkbox as BaseCheckbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@shared/ui/primitives"

interface CheckboxProps {
  id?: string;
  label?: React.ReactNode;
  
  name?: string;
  checked: boolean;
  onChange?: (value: boolean) => void;
  disabled?: boolean;
}

export const Checkbox = ({
  id,
  label,
  name,
  checked,
  onChange,
  disabled
}: CheckboxProps) => {
  return (
    <FieldGroup>
      <Field orientation="horizontal">
        <BaseCheckbox
          id={id}
          name={name}
          checked={checked}
          disabled={disabled}
          onCheckedChange={(value) => onChange?.(value === true)}
        />
        <FieldLabel htmlFor={id}>
          {label}
        </FieldLabel>
      </Field>
    </FieldGroup>
  );
};
