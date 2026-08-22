import React from "react";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";

import { cn } from "@/lib/utils";

interface Props {
  /**
   * 팝오버를 붙일 트리거 요소. 별도 래퍼 DOM 없이 이 요소에 동작이 병합되므로
   * ref 를 받을 수 있는 요소(네이티브 태그 또는 ref 전달 컴포넌트)여야 한다.
   */
  children: React.ReactElement;
  /** 팝업 본문 */
  content: React.ReactNode;
  /** 팝업 상단 제목. 지정하면 접근성 이름으로도 연결된다 */
  title?: string;

  /** 제어 모드 — 지정하면 열림 상태를 부모가 소유한다 */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;

  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  /**
   * 팝업(popup)에 덧붙일 클래스.
   *
   * **기본 폭을 주지 않는다** — 내용에 따라 필요한 폭이 크게 다르므로 호출부가 정한다.
   * 코너(`rounded-panel`)는 덮어쓸 수 없다: tailwind-merge 가 Tailwind v4 CSS 테마를
   * 읽지 못해 커스텀 `rounded-*` 를 충돌로 인식하지 않고 두 클래스를 모두 남긴다.
   */
  className?: string;
}

/**
 * 부유 패널 팝오버.
 *
 * shadcn 래퍼(@/components/ui/popover)를 거치지 않고 Base UI 동작 레이어를 직접 사용한다 —
 * 그쪽은 면·글씨·코너가 전부 shim 토큰(`bg-popover`·`rounded-md`)이라 신규 코드 규약에
 * 맞추려면 어차피 전부 덮어써야 하고, 그러고 나면 남는 건 포지셔닝뿐이다.
 * 표면 스타일은 `ConfirmDialog` 와 같은 팔레트 어휘를 쓴다.
 *
 * 짧은 문구 안내는 `Tooltip`(어두운 말풍선)을, 조건 묶음 + 적용/초기화가 필요한 필터는
 * `FilterPopover` 를 쓴다. 이쪽은 폭·내용에 제약이 없는 범용 셸이다.
 */
export const Popover = ({
  children,
  content,
  title,
  open,
  onOpenChange,
  side = "bottom",
  align = "center",
  className,
}: Props) => {
  // 제어 모드에서는 어느 트리거에 붙일지 Root 가 알아야 한다(비제어면 불필요).
  const triggerId = React.useId();
  const titleId = React.useId();

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange} triggerId={triggerId}>
      <PopoverPrimitive.Trigger id={triggerId} render={children} />

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner
          side={side}
          align={align}
          sideOffset={8}
          collisionPadding={12}
          className="isolate z-50"
        >
          <PopoverPrimitive.Popup
            aria-labelledby={title ? titleId : undefined}
            className={cn(
              "rounded-panel bg-surface p-4 text-ink shadow-panel ring-1 ring-rule outline-none",
              "origin-(--transform-origin)",
              "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
              "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
              className,
            )}
          >
            {title && (
              <p id={titleId} className="mb-3 text-body-4 text-ink">
                {title}
              </p>
            )}
            {content}
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};
