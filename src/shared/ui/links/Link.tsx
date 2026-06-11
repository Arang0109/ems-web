import { Link as RouterLink, type LinkProps as RouterLinkProps } from "react-router";

import { cn } from "@/lib/utils";

interface LinkProps extends RouterLinkProps {
  className?: string;
}

export const Link = ({ className, ...props }: LinkProps) => (
  <RouterLink
    {...props}
    className={cn(
      "text-sm text-neutral-500 hover:underline",
      className
    )}
  />
);