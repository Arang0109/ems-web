import { cn } from "@/lib/utils";

type Props = React.ComponentProps<'div'>;

/**
 * 로딩 자리표시 블록. 크기·비율은 className 으로 정한다.
 *
 * shadcn `skeleton` 을 래핑하지 않는다 — Base UI 동작이 없는 순수 마크업이고
 * shadcn 쪽은 shim 토큰(`bg-canvas`·`rounded-md`)이라 래핑 이득이 없다.
 *
 * 코너는 className 으로 덮어쓴다(예: 아바타 자리 `rounded-full`) — `cn` 이 커스텀 반경을 등록해 두었다.
 */
export const Skeleton = ({ className, ...props }: Props) => (
  <div className={cn("animate-pulse rounded-nav bg-rule", className)} {...props} />
);
