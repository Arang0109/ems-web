import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
type ButtonSize = "default" | "sm" | "lg" | "icon" | "xs";

interface IconButtonProps {
  icon: React.ReactNode;
  label?: string;
  onClick?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

export const IconButton = ({
  icon,
  label,
  onClick,
  variant = "ghost",
  size = "icon",
  disabled,
  className,
  type = "button",
}: IconButtonProps) => (
  <Button
    type={type}
    variant={variant}
    size={size}
    aria-label={label}
    onClick={onClick}
    disabled={disabled}
    className={cn(className)}
  >
    {icon}
  </Button>
);
