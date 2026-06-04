import { type VariantProps } from "class-variance-authority"
import { Badge as BadgePrimitive } from "@/components/ui/badge";
import { badgeVariants } from "@/components/variants/badgeVariants";

type BadgeProps = {
  variant?: VariantProps<typeof badgeVariants>["variant"],
  icon?: React.ReactNode,
  label: string,
}

export const BadgeWithIcon = ({ variant, icon, label }: BadgeProps) => (
  <BadgePrimitive variant={variant}>
    {icon} {label}
  </BadgePrimitive>
);