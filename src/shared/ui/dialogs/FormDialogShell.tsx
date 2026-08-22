import { useState } from "react"
import type { Dialog as BaseDialog } from "@base-ui/react/dialog"

import {
  Dialog as DialogPrimitive,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Button } from "@shared/ui/buttons"
import { useIsMobile } from "@shared/model"

import { useConfirm } from "./use-confirm";
import { MOBILE_FULLSCREEN_CLASS, SIZE_CLASS, type DialogSize } from "./dialog-size";

/** 셸을 조합하는 쪽(FormDialog 등)이 푸터에 닫기 버튼을 놓을 때 쓴다 */
export { DialogClose };

export interface FormDialogShellProps {
  triggerLabel?: React.ReactNode;
  title?: string;
  description?: string;
  /** 제목·설명 아래 헤더 영역 — 스텝 인디케이터 등 */
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
  /**
   * 본문 스크롤 래퍼를 셸이 만들지 않는다.
   * 본문이 스크롤을 직접 소유하는 경우(스텝 뷰포트)에 켠다.
   */
  rawBody?: boolean;
  /** 푸터 버튼 구성 — 전적으로 호출자가 정한다 */
  footer: React.ReactNode;
  onSubmit?: (e: React.SubmitEvent<HTMLFormElement>) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** 트리거 버튼 비활성 */
  disabled?: boolean;
  /**
   * 미저장 이탈 경고의 판정을 바깥에서 덮어쓴다.
   *
   * 기본값(미지정)은 폼 안에서 `input` 이벤트가 한 번이라도 났는지로 판정하는데,
   * `Select`·`DatePicker` 같은 버튼 기반 컨트롤은 `input` 을 내지 않아 놓칠 수 있다.
   * 정확한 판정이 필요한 폼은 훅에서 계산한 값을 넘긴다.
   */
  isDirty?: boolean;
  size?: DialogSize;
  /** md 미만에서 화면 전체로 띄운다. 기본값은 기존 동작(중앙 모달) 유지 */
  fullScreenOnMobile?: boolean;
}

/**
 * 폼 모달의 공통 셸.
 *
 * `FormDialog`(단일 폼)와 `StepFormDialog`(스텝 위저드)의 단일 토대이며,
 * 실수 방지 장치 3가지(배경 클릭 차단 · 미저장 이탈 확인 · 엔터 암묵적 제출 차단)를
 * 여기서만 구현한다. 새 모달 표면을 만들 때 이 3가지를 다시 구현하지 말고 셸을 조합할 것.
 *
 * `@/components/ui/dialog`(shadcn 잔재)의 유일한 소비자이기도 하다.
 */
export function FormDialogShell({
  triggerLabel,
  title,
  description,
  headerExtra,
  children,
  rawBody,
  footer,
  onSubmit,
  open,
  onOpenChange,
  disabled,
  isDirty,
  size = "default",
  fullScreenOnMobile = false,
}: FormDialogShellProps) {
  const confirm = useConfirm();
  const isMobile = useIsMobile();
  const isFullScreen = fullScreenOnMobile && isMobile;

  // 폼 안에서 입력이 한 번이라도 났는지. 열릴 때마다 초기화한다.
  const [isTouched, setIsTouched] = useState(false);

  // 열림 전환에 맞춰 렌더 중 초기화한다 — effect + setState 는 cascading render 를 부른다.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setIsTouched(false);
  }

  /**
   * 입력 중 엔터로 폼이 제출되는 사고를 막는다 (브라우저의 암묵적 제출).
   *
   * 제출은 버튼을 눌렀을 때만 일어난다 — 마우스 클릭, 또는 버튼에 포커스를 둔 상태의
   * 엔터·스페이스(둘 다 네이티브 click 을 낸다). 키보드만으로도 제출은 가능하되
   * 입력란에서 엔터를 연타하는 것만으로는 제출되지 않는다.
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key !== "Enter") return;

    const target = e.target as HTMLElement;
    // textarea 는 줄바꿈이 본래 동작이고, 버튼은 클릭으로 이어져야 한다.
    if (target.tagName === "TEXTAREA" || target.closest("button")) return;

    e.preventDefault();
  };

  const handleOpenChange = async (
    next: boolean,
    details: BaseDialog.Root.ChangeEventDetails,
  ) => {
    if (next) {
      setIsTouched(false);
      onOpenChange?.(true);
      return;
    }

    if (!(isDirty ?? isTouched)) {
      onOpenChange?.(false);
      return;
    }

    // Base UI 내부 닫기를 먼저 막고(await 이전이어야 한다) 확인을 받는다.
    details.cancel();

    const isConfirmed = await confirm({
      title: "작성 중인 내용이 있습니다",
      description: "닫으면 입력한 내용이 사라집니다.",
      confirmLabel: "닫기",
      tone: "danger",
    });
    if (isConfirmed) onOpenChange?.(false);
  };

  return (
    // 배경 클릭 한 번에 작성 중인 폼이 사라지지 않도록 Base UI 기본값(닫힘)을 끈다.
    <DialogPrimitive open={open} onOpenChange={handleOpenChange} disablePointerDismissal>
      {triggerLabel && (
        <DialogTrigger disabled={disabled} render={<Button variant="default">{triggerLabel}</Button>} />
      )}
      <DialogContent
        className={cn(
          isFullScreen ? MOBILE_FULLSCREEN_CLASS : cn(SIZE_CLASS[size], "max-h-[90vh]"),
          "flex flex-col",
        )}
      >
        <form
          onSubmit={onSubmit}
          onInput={() => setIsTouched(true)}
          onKeyDown={handleKeyDown}
          className="flex min-h-0 flex-1 flex-col"
        >
          <DialogHeader
            className={cn(
              "shrink-0",
              // 전체화면에서는 DialogContent 의 p-6 이 사라지므로 영역별로 여백을 다시 준다.
              // pr-14 는 우상단 닫기 버튼(absolute top-4 right-4)과 제목이 겹치지 않게 한다.
              isFullScreen ? "px-4 pt-4 pr-14 pb-3" : "mb-5",
            )}
          >
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {description}
            </DialogDescription>
            {headerExtra}
          </DialogHeader>

          {rawBody ? (
            children
          ) : (
            /* 내용이 길면 이 영역만 스크롤되어 헤더/푸터가 잘리지 않는다 */
            <div className={cn("min-h-0 flex-1 overflow-y-auto pr-1", isFullScreen && "px-4")}>
              {children}
            </div>
          )}

          <DialogFooter
            className={cn(
              "shrink-0",
              isFullScreen
                ? // 세로 배치(flex-col-reverse)는 주요 버튼을 엄지에서 멀어지게 하므로 가로 2분할로 덮는다.
                  // env() 는 viewport-fit=cover 가 없으면 0 이라 현재는 0.75rem 으로 폴백한다.
                  "flex-row border-t border-rule px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] [&>*]:flex-1"
                : "mt-5",
            )}
          >
            {footer}
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogPrimitive>
  )
}
