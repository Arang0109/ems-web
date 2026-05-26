import type { size } from "@shared/model";
import { SIZE_STYLES } from "@shared/model";

interface DashedAddButtonProps {
  label: string;
  onClick?: () => void;
  size?: size;  
  disabled?: boolean;
}

export const DashedAddButton = ({
  label,
  onClick,
  size = "md",
  disabled = false,
}: DashedAddButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full rounded-md
        border-2 border-dashed border-gray-300
        hover:border-[#3B82F6] hover:text-[#3B82F6]
        text-gray-600 font-medium marker:rounded-md
        transition-colors
        ${SIZE_STYLES[size]}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      + {label}
    </button>
  );
}