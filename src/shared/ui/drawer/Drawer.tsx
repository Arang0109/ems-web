import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@shared/ui/buttons";

import {
  DRAWER_BACKDROP_CLASS,
  DRAWER_POPUP_CLASS,
  DRAWER_SAFE_AREA_CLASS,
  DRAWER_SIDE_CLASS,
  type DrawerSide,
} from "./drawer-size";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  /** 붙는 가장자리. 모바일은 `bottom`, 데스크탑은 `right` 가 기본 조합이다 */
  side?: DrawerSide;

  title: string;
  /** 제목 아래 한 줄 설명. 없으면 렌더하지 않는다 */
  description?: string;

  children: React.ReactNode;
  /** 하단 액션 영역. 넘기지 않으면 푸터 자체가 없다 (닫기는 헤더 ✕ 로 충분한 경우) */
  footer?: React.ReactNode;

  /**
   * 표면(popup)에 덧붙일 클래스 — 주로 폭 조정용.
   *
   * 코너(`rounded-t-dialog`)는 덮어쓸 수 없다: tailwind-merge 가 Tailwind v4 CSS 테마를
   * 읽지 못해 커스텀 `rounded-*` 를 충돌로 인식하지 않고 두 클래스를 모두 남긴다
   * (`shared/ui/popover/Popover.tsx` 와 같은 제약).
   */
  className?: string;
}

/**
 * 화면 가장자리에서 밀려 들어오는 오버레이.
 *
 * 중앙 모달과 달리 뒤쪽 화면을 가운데부터 덮지 않아 **작업 맥락을 남긴 채 보조 정보를
 * 띄울 때** 쓴다. 모바일에서는 하단 바텀시트(엄지 도달 범위), 데스크탑에서는 우측
 * 사이드 드로어가 기본 조합이며, 어느 쪽인지는 호출부가 `useIsMobile()` 로 정한다.
 *
 * shadcn 래퍼를 거치지 않고 Base UI 동작 레이어를 직접 쓴다 — `shared/ui/popover/Popover`
 * 와 같은 판단이다. 잔재 `components/ui/sheet.tsx` 가 같은 물건이지만 면·글씨·코너가 전부
 * shim 토큰(`bg-popover`·`rounded-md`)이라 신규 코드 규약에 맞추려면 어차피 전부 덮어써야 하고,
 * 그러고 나면 남는 건 포지셔닝뿐이다. (`sheet.tsx` 는 `components/ui/sidebar.tsx` 가 아직
 * 물고 있어 남겨 둔다 — DESIGN-SYSTEM.md 의 sidebar 정리 단계에서 함께 사라질 파일이다.)
 *
 * **폼 제출 표면에는 쓰지 않는다.** 미저장 이탈 확인·엔터 암묵적 제출 차단·배경 클릭 차단이
 * 필요한 폼은 `@shared/ui/dialogs` 의 `FormDialog` / `StepFormDialog` 를 쓴다. 이쪽은
 * `DocumentViewerDialog` 와 같은 갈래로, **닫아서 잃을 값이 없는 표면** 전용이다.
 */
export const Drawer = ({
  open,
  onOpenChange,
  side = "right",
  title,
  description,
  children,
  footer,
  className,
}: Props) => {
  const isBottom = side === "bottom";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className={DRAWER_BACKDROP_CLASS} />

        <Dialog.Popup
          data-side={side}
          className={cn(DRAWER_POPUP_CLASS, DRAWER_SIDE_CLASS[side], className)}
        >
          {/*
            바텀시트의 그랩 핸들 — "아래에서 올라온 표면"이라는 시각적 어포던스다.
            끌어내려 닫는 제스처는 없다(Base UI dialog 에 제스처 계층이 없고, 그건 vaul 의
            영역이다). 그래서 장식으로만 두고 접근성 트리에서는 뺀다.
          */}
          {isBottom && (
            <div aria-hidden className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-rule" />
          )}

          <header className="flex shrink-0 items-start gap-2 border-b border-rule px-4 py-3">
            <div className="min-w-0 flex-1">
              <Dialog.Title className="truncate font-heading text-body-1 text-ink">
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className="mt-1 text-body-3 text-muted-ink">
                  {description}
                </Dialog.Description>
              )}
            </div>

            {/* IconButton 은 여분 props 를 흘려보내지 않아 render 슬롯에서 닫기 핸들러를 잃는다 */}
            <Dialog.Close render={<Button variant="ghost" size="icon-sm" aria-label={`${title} 닫기`} />}>
              <X size={18} />
            </Dialog.Close>
          </header>

          {/* 내용이 길면 이 영역만 스크롤되어 헤더/푸터가 잘리지 않는다 */}
          <div
            className={cn(
              "min-h-0 flex-1 overflow-y-auto px-4 py-4",
              isBottom && !footer && DRAWER_SAFE_AREA_CLASS,
            )}
          >
            {children}
          </div>

          {footer && (
            <footer
              className={cn(
                "flex shrink-0 gap-2 border-t border-rule px-4 pt-3 pb-3 [&>*]:flex-1",
                isBottom && DRAWER_SAFE_AREA_CLASS,
              )}
            >
              {footer}
            </footer>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
