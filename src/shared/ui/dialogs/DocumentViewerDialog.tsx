import React from "react";
import { Maximize2, Minus, Plus, X } from "lucide-react";

import {
  Dialog as DialogPrimitive,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Button, IconButton } from "@shared/ui/buttons";
import { useIsMobile } from "@shared/model";

import { MOBILE_FULLSCREEN_CLASS } from "./dialog-size";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  title: string;
  /** 화면에는 두지 않고 스크린리더에만 읽히는 설명 — 얇은 헤더에 문단을 얹지 않기 위함 */
  description?: string;
  /** 헤더 우측 슬롯 — 문서 전환 등 뷰어별 액션 */
  toolbar?: React.ReactNode;

  /** 문서의 고정 폭(px). "폭 맞춤" 배율의 기준이 된다 */
  documentWidth: number;
  children: React.ReactNode;
}

/**
 * 고정폭 문서(기록지·양식)를 화면 가득 띄우는 읽기 전용 뷰어.
 *
 * 폼 모달(`FormDialogShell`)을 쓰지 않는다 — 미저장 이탈 확인·엔터 제출 차단은 폼의 장치이고,
 * 읽기 전용 문서는 배경 탭·ESC 로 바로 닫히는 편이 자연스럽다. 무엇보다 푸터 버튼 줄이
 * 문서 영역을 잡아먹으면 안 된다(닫기는 헤더의 ✕ 하나로 충분하다).
 *
 * 800px 짜리 23열 기록지는 폭을 맞추면 글씨가 5px 가 되어 휴대폰에서 읽을 수 없다.
 * 그래서 "다 보여주기"가 아니라 **확대·이동하는 문서 뷰어**로 만든다.
 */
export const DocumentViewerDialog = ({
  open, onOpenChange, title, description, toolbar, documentWidth, children,
}: Props) => {
  const isMobile = useIsMobile();

  return (
    <DialogPrimitive open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "flex flex-col overflow-hidden",
          isMobile
            ? MOBILE_FULLSCREEN_CLASS
            // 데스크탑도 여백을 최소로 — 문서가 넓을수록 배율을 덜 줄여도 된다.
            : "h-[92vh] max-h-none w-[min(96vw,1400px)] max-w-none gap-0 p-0 sm:max-w-none",
        )}
      >
        <header className="flex shrink-0 items-center gap-2 border-b border-rule px-3 py-2">
          <div className="min-w-0 flex-1">
            <DialogTitle className="truncate text-body-1 text-ink">{title}</DialogTitle>
            {description && <DialogDescription className="sr-only">{description}</DialogDescription>}
          </div>

          {toolbar}

          {/* IconButton 은 여분 props 를 흘려보내지 않아 render 슬롯에서 닫기 핸들러를 잃는다 */}
          <DialogClose
            render={<Button variant="ghost" size="icon-sm" aria-label="미리보기 닫기" />}
          >
            <X size={18} />
          </DialogClose>
        </header>

        {/* 열릴 때만 마운트되므로 배율·스크롤 위치가 매번 초기화된다 */}
        <DocumentViewport documentWidth={documentWidth}>{children}</DocumentViewport>
      </DialogContent>
    </DialogPrimitive>
  );
};

const MIN_SCALE = 0.25;
const MAX_SCALE = 3;
const ZOOM_STEP = 1.25;

/** 문서 둘레 여백(px) — 폭 맞춤에서 가장자리가 화면에 붙지 않게 한다 */
const GUTTER = 12;

const clampScale = (scale: number): number => Math.min(Math.max(scale, MIN_SCALE), MAX_SCALE);

const touchDistance = (touches: TouchList): number =>
  Math.hypot(
    touches[0].clientX - touches[1].clientX,
    touches[0].clientY - touches[1].clientY,
  );

/** 확대·이동이 되는 문서 표면. 배율 상태를 소유한다. */
const DocumentViewport = ({
  documentWidth, children,
}: { documentWidth: number; children: React.ReactNode }) => {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const documentRef = React.useRef<HTMLDivElement>(null);

  const [viewportWidth, setViewportWidth] = React.useState(0);
  const [documentHeight, setDocumentHeight] = React.useState(0);
  // null 이면 "폭 맞춤" — 화면 회전·창 크기 변경을 그대로 따라간다.
  const [pinnedScale, setPinnedScale] = React.useState<number | null>(null);

  React.useEffect(() => {
    const viewport = viewportRef.current;
    const documentEl = documentRef.current;
    if (!viewport || !documentEl) return;

    // 문서 높이는 변환 전 크기다 — transform 은 레이아웃 박스를 바꾸지 않는다.
    const observer = new ResizeObserver(() => {
      setViewportWidth(viewport.clientWidth);
      setDocumentHeight(documentEl.offsetHeight);
    });
    observer.observe(viewport);
    observer.observe(documentEl);

    return () => observer.disconnect();
  }, []);

  const fitScale =
    viewportWidth > 0 ? clampScale((viewportWidth - GUTTER * 2) / documentWidth) : 1;
  const scale = pinnedScale ?? fitScale;

  // 제스처 도중 리스너를 다시 붙이면 시작 배율을 잃는다. 최신 배율은 ref 로만 읽는다.
  const scaleRef = React.useRef(scale);
  React.useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  // 배율이 바뀌기 직전 값 — 확대 후 스크롤을 되맞추는 기준이다. 되맞춘 뒤 비운다.
  const previousScaleRef = React.useRef<number | null>(null);

  const zoomTo = (next: number, from: number) => {
    previousScaleRef.current = from;
    setPinnedScale(clampScale(next));
  };

  React.useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const previous = previousScaleRef.current;
    previousScaleRef.current = null;
    if (!viewport || previous === null || previous === scale) return;

    // 화면 한가운데 있던 지점을 붙잡는다 — 좌상단 기준으로 키우면 보던 칸이 밖으로 밀려난다.
    const ratio = scale / previous;
    viewport.scrollLeft =
      (viewport.scrollLeft + viewport.clientWidth / 2) * ratio - viewport.clientWidth / 2;
    viewport.scrollTop =
      (viewport.scrollTop + viewport.clientHeight / 2) * ratio - viewport.clientHeight / 2;
  }, [scale]);

  React.useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    let pinch: { distance: number; scale: number } | null = null;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 2) return;
      pinch = { distance: touchDistance(e.touches), scale: scaleRef.current };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 2 || !pinch) return;

      // 막지 않으면 브라우저가 페이지 전체를 확대해 뷰어 밖으로 시야가 빠진다.
      e.preventDefault();
      zoomTo(pinch.scale * (touchDistance(e.touches) / pinch.distance), scaleRef.current);
    };

    const handleTouchEnd = () => {
      pinch = null;
    };

    // 트랙패드 핀치는 ctrlKey 가 붙은 wheel 로 들어온다.
    const handleWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;

      e.preventDefault();
      zoomTo(scaleRef.current * (e.deltaY < 0 ? 1.1 : 1 / 1.1), scaleRef.current);
    };

    viewport.addEventListener("touchstart", handleTouchStart, { passive: true });
    viewport.addEventListener("touchmove", handleTouchMove, { passive: false });
    viewport.addEventListener("touchend", handleTouchEnd, { passive: true });
    viewport.addEventListener("touchcancel", handleTouchEnd, { passive: true });
    viewport.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      viewport.removeEventListener("touchstart", handleTouchStart);
      viewport.removeEventListener("touchmove", handleTouchMove);
      viewport.removeEventListener("touchend", handleTouchEnd);
      viewport.removeEventListener("touchcancel", handleTouchEnd);
      viewport.removeEventListener("wheel", handleWheel);
    };
  }, []);

  const isFit = pinnedScale === null;

  return (
    <div className="relative min-h-0 flex-1">
      {/* touch-pan-* 로 핀치를 브라우저에서 뺏어와야 touchmove 가 취소 가능한 상태로 들어온다 */}
      <div
        ref={viewportRef}
        className="h-full w-full touch-pan-x touch-pan-y overflow-auto overscroll-contain bg-canvas"
      >
        {/* 변환된 문서는 자리를 차지하지 않으므로, 배율만큼의 크기를 이 상자가 대신 잡아준다 */}
        <div
          style={{
            width: documentWidth * scale + GUTTER * 2,
            height: documentHeight * scale + GUTTER * 2,
            padding: GUTTER,
            marginInline: "auto",
          }}
        >
          <div
            ref={documentRef}
            style={{
              width: documentWidth,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            {children}
          </div>
        </div>
      </div>

      {/* 떠 있는 배율 컨트롤 — 문서 영역을 잘라먹지 않으려고 겹쳐 놓는다 */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="pointer-events-auto flex items-center gap-0.5 rounded-full border border-rule bg-surface/95 p-1 shadow-panel">
          <IconButton
            size="icon-sm" label="축소" icon={<Minus size={16} />}
            disabled={scale <= MIN_SCALE}
            onClick={() => zoomTo(scale / ZOOM_STEP, scale)}
          />
          <span className="w-12 text-center text-caption tabular-nums text-ink-soft">
            {Math.round(scale * 100)}%
          </span>
          <IconButton
            size="icon-sm" label="확대" icon={<Plus size={16} />}
            disabled={scale >= MAX_SCALE}
            onClick={() => zoomTo(scale * ZOOM_STEP, scale)}
          />
          <Button
            variant={isFit ? "selected" : "ghost"} size="sm"
            aria-pressed={isFit}
            onClick={() => setPinnedScale(null)}
          >
            <Maximize2 size={14} />폭 맞춤
          </Button>
        </div>
      </div>
    </div>
  );
};
