import * as React from "react"

import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@shared/ui/buttons"
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react"

/**
 * 정렬은 호출부(부모 레이아웃)가 결정한다.
 * shadcn 원본의 `mx-auto w-full justify-center` 는 제거했다 — auto margin 이 남으면
 * 부모의 justify-between/end 보다 우선해 여백을 나눠 먹으므로 override 가 불가능하다.
 */
function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("flex", className)}
      {...props}
    />
  )
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex items-center gap-1", className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
  size?: VariantProps<typeof buttonVariants>["size"]
  variant?: VariantProps<typeof buttonVariants>["variant"]
} & React.ComponentProps<"a">

/**
 * 피그마 "05 데이터 입력 및 테이블" 의 페이지네이션은 28px 정사각 버튼 + 12px 아이콘이다.
 * Button 의 size 램프에 28px 이 없으므로(24·32·36·40) 페이지네이션에서만 덮어쓴다.
 */
const PAGINATION_BUTTON = "size-7 [&_svg:not([class*='size-'])]:size-3"

/**
 * 버튼 모양의 앵커.
 * 이관 전에는 Base UI Button 의 `nativeButton={false}` + `render` 조합을 썼으나,
 * 자체 Button 은 순수 <button> 이므로 buttonVariants 클래스를 <a> 에 직접 입힌다.
 */
function PaginationLink({
  className,
  isActive,
  size = "icon",
  /* 피그마: 현재 페이지는 PRIMARY(초록 면 + 흰 글씨), 나머지는 면 없는 상태 */
  variant = isActive ? "default" : "outline",
  ...props
}: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(buttonVariants({ variant, size }), PAGINATION_BUTTON, className)}
      {...props}
    />
  )
}

/**
 * 피그마의 이전·다음 버튼은 28px 정사각 아이콘 전용(DEFAULT 톤)이다.
 * `text` 는 화면에서 감추고 스크린리더용 이름으로만 남긴다.
 */
function PaginationPrevious({
  className,
  text = "Previous",
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink variant="outline" className={className} {...props}>
      <ChevronLeftIcon data-icon="inline-start" />
      <span className="sr-only">{text}</span>
    </PaginationLink>
  )
}

function PaginationNext({
  className,
  text = "Next",
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink variant="outline" className={className} {...props}>
      <ChevronRightIcon data-icon="inline-end" />
      <span className="sr-only">{text}</span>
    </PaginationLink>
  )
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "flex size-7 items-center justify-center [&_svg:not([class*='size-'])]:size-3",
        className
      )}
      {...props}
    >
      <MoreHorizontalIcon
      />
      <span className="sr-only">More pages</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
