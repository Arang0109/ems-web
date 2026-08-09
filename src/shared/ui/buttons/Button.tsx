import { cn } from "@/lib/utils";

import type { LucideIcon } from "lucide-react";

import { buttonVariants, type ButtonVariants } from "./button-variants";

type Props = React.ComponentProps<"button"> &
  ButtonVariants & {
    /** 라벨 앞 아이콘. 크기·간격은 base·size variant 가 처리하므로 `<Icon />` 만 넘긴다 */
    startIcon?: LucideIcon;
  };

/** 피그마 "상태별 버튼" 스펙 구현. 클래스 정의는 `button-variants.ts` 참조. */
export const Button = ({
  className,
  variant,
  size,
  type = "button",
  startIcon: StartIcon,
  children,
  ...props
}: Props) => (
  <button
    data-slot="button"
    type={type}
    className={cn(buttonVariants({ variant, size }), className)}
    {...props}
  >
    {StartIcon && <StartIcon />}
    {children}
  </button>
);
