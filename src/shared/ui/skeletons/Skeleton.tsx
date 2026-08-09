import { cn } from "@/lib/utils";

type Props = React.ComponentProps<'div'>;

/**
 * 로딩 자리표시 블록. 크기·비율은 className 으로 정한다.
 *
 * shadcn `skeleton` 을 래핑하지 않는다 — Base UI 동작이 없는 순수 마크업이고
 * 클래스가 전부 shim 토큰(`bg-muted`·`rounded-md`)이라 래핑 이득이 없다.
 *
 * ⚠️ 코너는 className 으로 덮어쓸 수 없다. tailwind-merge 는 Tailwind v4 CSS 테마를
 * 읽지 못해 커스텀 `rounded-*` 토큰을 충돌로 인식하지 못하고 두 클래스를 모두 남긴다.
 * 다른 코너가 필요하면 여기에 variant prop 을 추가할 것.
 */
export const Skeleton = ({ className, ...props }: Props) => (
  <div className={cn("animate-pulse rounded-nav bg-rule", className)} {...props} />
);
