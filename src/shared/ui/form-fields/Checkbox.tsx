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
    <div className="flex items-center">
      <input
        id={id}
        name={name}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="w-3.5 h-3.5 text-neutral-600 bg-white border-slate-300 rounded focus:ring-2 focus:ring-primary-400"/>
    
      <label
        htmlFor={id}
        className="ml-2 text-xs text-neutral-600"
      >{label}</label>
    </div>
    
  );
};
