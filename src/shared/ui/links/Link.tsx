import { Link as RouterLink, type LinkProps as RouterLinkProps } from "react-router";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LinkProps extends RouterLinkProps {
  className?: string;
}

export const Link = ({ className, ...props }: LinkProps) => (
  <Button
    variant="link"
    size="sm"
    render={<RouterLink {...props} />}
    className={cn("p-0 h-auto text-neutral-500", className)}
  />
);
