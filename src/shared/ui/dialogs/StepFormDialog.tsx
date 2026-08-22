import { useState } from "react";
import { ChevronLeft, Send, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@shared/ui/buttons";
import { StepNav } from "@shared/ui/nav";

import { DialogClose, FormDialogShell, type FormDialogShellProps } from "./FormDialogShell";
import { StepViewport } from "./StepViewport";
import { clampStepIndex, firstInvalidStepIndex } from "./step-nav-state";
import type { DialogStep } from "./step-types";

// 스텝 본문의 고정 높이 — 스텝마다 내용 길이가 달라도 푸터가 움직이지 않게 한다.
const BODY_HEIGHT_CLASS = {
  sm: "h-72",         // 288px
  md: "h-104",        // 416px
  lg: "h-[32rem]",    // 512px
} as const;

interface Props
  extends Omit<FormDialogShellProps, "children" | "footer" | "headerExtra" | "rawBody"> {
  steps: DialogStep[];
  /** 마지막 스텝에서만 렌더된다. 기본 '제출' */
  submitLabel?: string;
  loadingLabel?: string;
  isLoading?: boolean;
  submitDisabled?: boolean;
  prevLabel?: string;
  nextLabel?: string;
  cancelLabel?: string;
  /** 본문 고정 높이 프리셋. 기본 'md' */
  bodyHeight?: keyof typeof BODY_HEIGHT_CLASS;
}

/**
 * 폼을 여러 단계로 나눠 좌우 슬라이드로 전환하는 모달.
 *
 * **활성 스텝 인덱스는 여기가 소유하고, 스텝 목록과 검증은 feature 가 소유한다.**
 * 조건부 스텝은 `hidden` 플래그가 아니라 `steps` 배열에서 빼서 표현한다 —
 * `steps.length` 가 곧 보이는 스텝 수여야 인덱스 계산에 예외가 없다.
 *
 * 이동 규칙:
 * - `다음` 은 현재 스텝만 검증한다 (`step.validate`).
 * - `제출` 은 마지막 스텝에서만 렌더되고, 전체를 검증해 첫 실패 스텝으로 이동한다.
 * - StepNav 클릭 이동은 앞뒤 모두 자유롭다. 등록 폼이지 결제 플로우가 아니므로
 *   전진을 막기보다 제출 시점의 점프를 안전망으로 삼는다.
 *
 * 비-마지막 스텝에는 `type="submit"` 버튼이 폼 안에 하나도 없다. 브라우저의 암묵적 제출
 * 대상 자체가 사라지므로 셸의 엔터 가드와 함께 이중 방어가 된다.
 */
export function StepFormDialog({
  steps,
  submitLabel = "제출",
  loadingLabel = "제출 중...",
  isLoading,
  submitDisabled,
  prevLabel = "이전",
  nextLabel = "다음",
  cancelLabel = "닫기",
  bodyHeight = "md",
  onSubmit,
  fullScreenOnMobile = true,
  ...shellProps
}: Props) {
  const [index, setIndex] = useState(0);

  // 조건부 스텝이 사라져도 effect 없이 렌더 중 파생값으로 범위를 맞춘다.
  const activeIndex = clampStepIndex(index, steps.length);
  const activeStep = steps[activeIndex];
  const isFirst = activeIndex === 0;
  const isLast = activeIndex === steps.length - 1;

  const handlePrev = () => setIndex(activeIndex - 1);

  const handleNext = () => {
    if (activeStep?.validate?.() === false) return;
    setIndex(activeIndex + 1);
  };

  // 마지막 스텝에서 제출할 때 앞 스텝의 누락을 놓치지 않는다.
  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    const invalidIndex = firstInvalidStepIndex(steps);
    if (invalidIndex !== -1) {
      e.preventDefault();
      setIndex(invalidIndex);
      return;
    }
    onSubmit?.(e);
  };

  return (
    <FormDialogShell
      {...shellProps}
      rawBody
      fullScreenOnMobile={fullScreenOnMobile}
      onSubmit={handleSubmit}
      headerExtra={
        <StepNav
          className="mt-1"
          ariaLabel="입력 단계"
          items={steps.map(({ id, label, progress }) => ({ id, label, progress }))}
          activeId={activeStep?.id ?? ""}
          onSelect={(id) => setIndex(steps.findIndex((step) => step.id === id))}
        />
      }
      footer={
        <>
          {/* 첫 스텝에는 되돌아갈 곳이 없으므로 그 자리를 탈출구로 쓴다.
              버튼 수가 항상 2개라 모바일 2분할 레이아웃도 그대로 유지된다. */}
          {isFirst ? (
            <DialogClose render={<Button variant="outline" startIcon={X}>{cancelLabel}</Button>} />
          ) : (
            <Button type="button" variant="outline" startIcon={ChevronLeft} onClick={handlePrev}>
              {prevLabel}
            </Button>
          )}

          {isLast ? (
            <Button type="submit" disabled={submitDisabled} startIcon={Send}>
              {isLoading ? loadingLabel : submitLabel}
            </Button>
          ) : (
            <Button type="button" onClick={handleNext}>
              {nextLabel}
            </Button>
          )}
        </>
      }
    >
      {/* 데스크탑은 고정 높이, 모바일 전체화면은 남은 공간을 전부 차지한다 */}
      <StepViewport
        steps={steps}
        activeIndex={activeIndex}
        className={cn(BODY_HEIGHT_CLASS[bodyHeight], "max-md:h-auto max-md:flex-1")}
      />
    </FormDialogShell>
  );
}
