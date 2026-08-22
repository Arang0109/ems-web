import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";
import type { DialogStep } from "./step-types";

interface Props {
  steps: DialogStep[];
  activeIndex: number;
  /** 뷰포트 높이 등 바깥에서 정하는 셸 클래스 */
  className?: string;
}

/**
 * 스텝 패널을 1×1 그리드에 겹쳐 쌓고, 각 패널을 자기 폭의 100% 단위로 좌우 이동시킨다.
 *
 * 트랙을 통째로 미는 방식과 달리 폭 계산이 전혀 없고, 이동 방향이 `(i - activeIndex)` 의
 * 부호에서 자동으로 나온다 — 방향 state 가 없으니 연타·되돌아가기에서 어긋날 여지도 없다.
 *
 * **모든 스텝의 마운트를 유지한다.** 폼 값은 feature 훅에 있어 언마운트해도 안전하지만,
 * 훅이 보관하지 않는 DOM 상태(표의 가로 스크롤 위치, IME 조합)가 사라진다. 대신 비활성
 * 패널은 `inert` 로 탭 순서·접근성 트리에서 빼 활성 스텝만 조작 대상이 되게 한다.
 */
export const StepViewport = ({ steps, activeIndex, className }: Props) => {
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isFirstRender = useRef(true);

  // 스텝을 옮기면 활성 패널로 포커스를 넘긴다(첫 렌더 제외 — 열자마자 훔치지 않는다).
  // 이건 prop→state 동기화가 아니라 순수 DOM 부수효과다.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    panelRefs.current[activeIndex]?.focus({ preventScroll: true });
  }, [activeIndex]);

  return (
    <div className={cn("relative grid min-h-0 grid-cols-1 grid-rows-1 overflow-hidden", className)}>
      {steps.map((step, index) => (
        <div
          key={step.id}
          ref={(node) => {
            panelRefs.current[index] = node;
          }}
          role="group"
          aria-label={step.label}
          tabIndex={-1}
          inert={index !== activeIndex}
          style={{ transform: `translateX(${(index - activeIndex) * 100}%)` }}
          className={cn(
            // min-w-0 는 필수다 — 없으면 grid 자식의 min-width:auto 때문에
            // 넓은 표(min-w-[720px])가 패널을, 나아가 다이얼로그 전체를 밀어 넓힌다.
            // px-1 py-0.5 는 뷰포트의 overflow-hidden 에 입력 필드의 포커스 링이 잘리지 않게 하는 여백이다.
            "col-start-1 row-start-1 h-full min-w-0 overflow-y-auto px-1 py-0.5 outline-none",
            "transition-transform duration-300 ease-out motion-reduce:transition-none",
          )}
        >
          {step.content}
        </div>
      ))}
    </div>
  );
};
