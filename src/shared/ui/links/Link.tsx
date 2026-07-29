import { Link as RouterLink, type LinkProps as RouterLinkProps } from "react-router";

import { cn } from "@/lib/utils";

interface LinkProps extends RouterLinkProps {
  className?: string;
}

export const Link = ({ className, ...props }: LinkProps) => (
  <RouterLink
    {...props}
    className={cn(
      "text-body-2 text-muted-foreground hover:underline",
      className
    )}
  />
);