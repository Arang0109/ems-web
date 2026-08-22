import React from "react";
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";

import { cn } from "@/lib/utils";

interface Props {
  /** 말풍선 본문. 줄바꿈(`\n`)이 그대로 유지된다 */
  content: React.ReactNode;
  /**
   * 툴팁을 붙일 트리거 요소. 별도 래퍼 DOM 없이 이 요소에 동작이 병합되므로
   * ref 를 받을 수 있는 요소(네이티브 태그 또는 ref 전달 컴포넌트)여야 한다.
   */
  children: React.ReactElement;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  /** hover 로 열릴 때까지의 대기시간(ms) */
  delay?: number;
  /** 말풍선(popup) 에 덧붙일 클래스 */
  className?: string;
}

/**
 * 말풍선 툴팁.
 *
 * shadcn 래퍼(@/components/ui/tooltip)를 거치지 않고 Base UI 동작 레이어를 직접 사용한다
 * (포지셔닝·ESC·바깥 클릭·ARIA 는 그대로 두고 스타일 레이어만 걷어낸다).
 *
 * **터치 대응이 이 컴포넌트의 핵심이다.** Base UI 의 hover 는 `mouseOnly` 라
 * 모바일에서는 아무리 눌러도 열리지 않는다. 측정 데이터 입력이 모바일 1순위 화면이므로
 * open 상태를 직접 소유하고 트리거 클릭으로 토글한다(데스크탑 hover·키보드 포커스는
 * Base UI 가 그대로 처리하고, 우리는 그 결과를 state 로 받는다).
 */
export const Tooltip = ({
  content,
  children,
  side = "top",
  align = "center",
  delay = 200,
  className,
}: Props) => {
  // 제어 모드에서는 어느 트리거에 붙일지 Root 가 알아야 한다(비제어면 불필요).
  const triggerId = React.useId();
  const [open, setOpen] = React.useState(false);

  return (
    <TooltipPrimitive.Root open={open} onOpenChange={setOpen} triggerId={triggerId}>
      <TooltipPrimitive.Trigger
        id={triggerId}
        delay={delay}
        // Base UI 기본값(true)이면 클릭이 "닫기" 로만 동작해 터치에서 열 수가 없다.
        closeOnClick={false}
        onClick={() => setOpen((prev) => !prev)}
        render={children}
      />

      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Positioner
          side={side}
          align={align}
          sideOffset={6}
          collisionPadding={8}
          className="z-50"
        >
          <TooltipPrimitive.Popup
            className={cn(
              "max-w-64 rounded-nav bg-ink px-3 py-2 text-body-3 whitespace-pre-line text-surface shadow-panel",
              "origin-(--transform-origin)",
              "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
              "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
              className,
            )}
          >
            {content}
          </TooltipPrimitive.Popup>
        </TooltipPrimitive.Positioner>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
};
