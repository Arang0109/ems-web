import { type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

import { Button, buttonVariants } from "./Button";

type Variants = VariantProps<typeof buttonVariants>;

interface Props {
  icon: React.ReactNode;
  label?: string;
  onClick?: () => void;
  variant?: Variants["variant"];
  size?: Variants["size"];
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

/** 아이콘 전용 버튼. 피그마 ICON ONLY 스타일은 variant="outline" 으로 쓴다. */
export const IconButton = ({
  icon,
  label,
  onClick,
  variant = "ghost",
  size = "icon",
  disabled,
  className,
  type = "button",
}: Props) => (
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
