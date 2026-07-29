import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * 피그마 "상태별 버튼" 스펙 구현.
 *
 * shadcn(Base UI) Button 에 의존하지 않는 자체 구현이다.
 * variant 이름은 기존 호출부(17개 파일)와의 호환을 위해 유지했으며,
 * 피그마 명칭과의 대응은 아래 주석을 따른다.
 *
 *   피그마 PRIMARY      → variant="default"   (기본값)
 *   피그마 DEFAULT      → variant="outline"
 *   피그마 SELECTED     → variant="selected"
 *   피그마 DESTRUCTIVE  → variant="destructive"
 *   피그마 ICON ONLY    → variant="outline" size="icon"
 *   피그마 FOCUS/DISABLED 는 상태이므로 base 에서 처리한다.
 *
 * 피그마 주석: "Primary 버튼은 화면당 핵심 행동에만 사용합니다."
 */
export const buttonVariants = cva(
  [
    "group/button inline-flex shrink-0 items-center justify-center",
    "whitespace-nowrap select-none",
    "rounded-button border text-body-4 transition-colors",
    "active:not-aria-[haspopup]:translate-y-px",
    // FOCUS — 초록 테두리 + 초록 링
    "outline-none focus-visible:border-brand-primary focus-visible:ring-3 focus-visible:ring-brand-primary/25",
    // DISABLED — 회색 면 + muted 텍스트
    "disabled:pointer-events-none disabled:border-transparent disabled:bg-rule disabled:text-muted-ink",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        /** 피그마 PRIMARY — 브랜드 초록 면, hover 시 Dark */
        default: "border-transparent bg-brand-primary text-surface hover:bg-brand-dark",
        /** 피그마 DEFAULT — 흰 면 + 테두리, hover 시 Soft */
        outline: "border-rule bg-surface text-ink hover:bg-brand-soft",
        /** 피그마 SELECTED — Soft 면 + 초록 테두리 + Dark 글씨 */
        selected: "border-brand-primary bg-brand-soft text-brand-dark",
        /** 피그마 DESTRUCTIVE — 흰 면 + 빨간 테두리 + 빨간 글씨 */
        destructive: "border-danger bg-surface text-danger hover:bg-danger-soft",
        ghost:
          "border-transparent text-ink hover:bg-brand-soft disabled:bg-transparent",
        soft: "border-transparent bg-brand-soft text-brand-dark hover:bg-brand-soft/70",
        link: "border-transparent text-brand-dark underline-offset-4 hover:underline disabled:bg-transparent",
      },
      size: {
        default: "h-9 gap-1.5 px-3",
        xs: "h-6 gap-1 px-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 px-3",
        lg: "h-10 gap-1.5 px-4",
        icon: "size-9",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

type Props = React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>;

export const Button = ({ className, variant, size, type = "button", ...props }: Props) => (
  <button
    data-slot="button"
    type={type}
    className={cn(buttonVariants({ variant, size }), className)}
    {...props}
  />
);
