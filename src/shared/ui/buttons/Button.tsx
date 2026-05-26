import type { variant, size, width } from "@shared/model";
import { VARIANT_STYLES, SIZE_STYLES, WIDTH_STYLES } from "@shared/model";

interface ButtonProps {
  label: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  variant?: variant;
  size?: size;
  width?: width;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  isLoading?: boolean;
}

export const Button = ({
  label,
  onClick,
  icon,
  variant = "primary",
  size = "md",
  width = "auto",
  type = "button",
  disabled = false,
  isLoading = false,
}: ButtonProps) => {

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center gap-2 rounded-md font-medium
        transition-colors
        ${VARIANT_STYLES[variant]}
        ${SIZE_STYLES[size]}
        ${WIDTH_STYLES[width]}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      {isLoading ? (
        <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
      ) : (
        <>
          {icon && <span className="flex items-center">{icon}</span>}
          {label}
        </>
      )}
    </button>
  );
};
