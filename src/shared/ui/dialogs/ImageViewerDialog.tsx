import React from "react";
import { X, ZoomIn, ZoomOut } from "lucide-react";

import {
  Dialog as DialogPrimitive,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Button } from "@shared/ui/buttons";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  /** 이미 받아 둔 이미지 URL (object URL 또는 data URL) */
  src: string;
  /** 접근성 대체 텍스트 겸 헤더 제목 */
  title: string;
  /** 헤더 우측 슬롯 — 내려받기 등 */
  toolbar?: React.ReactNode;
}

/**
 * 이미지 확대 보기.
 *
 * `DocumentViewerDialog` 를 쓰지 않는다. 그쪽은 **폭 맞춤**이 기본이고 `documentWidth` 를
 * 필수로 받는데, 둘 다 사진에는 맞지 않는다 — 세로로 긴 사진이 처음부터 잘려 보이고,
 * 이미지의 자연 크기는 로드 전에 알 수 없다. 사진은 **화면 맞춤(가로·세로 모두)** 이 기본이다.
 *
 * 폼 셸(`FormDialogShell`)도 쓰지 않는다 — 미저장 이탈 확인과 엔터 제출 차단은 폼의 장치이고,
 * 읽기 전용 표면은 배경 탭·ESC 로 바로 닫히는 편이 자연스럽다(`DocumentViewerDialog` 와 같은 근거).
 */
export const ImageViewerDialog = ({ open, onOpenChange, src, title, toolbar }: Props) => (
  <DialogPrimitive open={open} onOpenChange={onOpenChange}>
    <DialogContent
      showCloseButton={false}
      className={cn(
        "flex flex-col gap-0 overflow-hidden p-0",
        // 사진은 여백이 적을수록 크게 보인다. 모바일은 전체화면, 데스크탑도 화면을 거의 채운다.
        // w-full 을 쓰는 이유는 `dialog-size.ts` 의 모바일 전체화면과 같다 —
        // `100vw` 는 상시 노출된 스크롤바를 포함해 fixed 요소가 오른쪽으로 넘친다.
        "inset-0 h-dvh w-full max-h-none max-w-none translate-x-0 translate-y-0 rounded-none",
        "sm:inset-auto sm:top-1/2 sm:left-1/2 sm:h-[92vh] sm:w-[min(96vw,1400px)]",
        "sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-none sm:rounded-dialog",
      )}
    >
      {/* 열릴 때만 마운트되므로 확대 상태가 매번 초기화된다 (DocumentViewerDialog 와 같은 성질) */}
      <ImageViewerBody src={src} title={title} toolbar={toolbar} />
    </DialogContent>
  </DialogPrimitive>
);

/**
 * 화면 맞춤 ↔ 원본 크기 두 상태만 둔다.
 *
 * 배율 슬라이더를 두지 않는 것은 사진에서 필요한 것이 "전체를 보기"와 "자세히 보기" 둘뿐이기
 * 때문이다. 그 사이의 임의 배율은 조작이 늘어나는 데 비해 쓰이지 않는다.
 * (여러 배율이 실제로 필요한 고정폭 문서는 `DocumentViewerDialog` 가 맡는다.)
 */
const ImageViewerBody = ({
  src,
  title,
  toolbar,
}: Pick<Props, "src" | "title" | "toolbar">) => {
  const [isActualSize, setActualSize] = React.useState(false);
  const toggleSize = () => setActualSize((prev) => !prev);

  return (
    <>
      <header className="flex shrink-0 items-center gap-2 border-b border-rule px-3 py-2">
        <DialogTitle className="min-w-0 flex-1 truncate text-body-1 text-ink">
          {title}
        </DialogTitle>
        <DialogDescription className="sr-only">
          이미지를 확대해서 봅니다. 이미지를 누르면 원본 크기와 화면 맞춤을 오갑니다.
        </DialogDescription>

        {toolbar}

        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={isActualSize ? "화면에 맞추기" : "원본 크기로 보기"}
          onClick={toggleSize}
        >
          {isActualSize ? <ZoomOut size={18} /> : <ZoomIn size={18} />}
        </Button>

        {/* IconButton 은 여분 props 를 흘려보내지 않아 render 슬롯에서 닫기 핸들러를 잃는다 */}
        <DialogClose render={<Button variant="ghost" size="icon-sm" aria-label="닫기" />}>
          <X size={18} />
        </DialogClose>
      </header>

      <div
        className={cn(
          "min-h-0 flex-1 bg-canvas",
          // 원본 크기일 때만 스크롤이 생긴다. 화면 맞춤에서는 이미지가 이미 다 들어온다.
          isActualSize ? "overflow-auto" : "flex items-center justify-center overflow-hidden",
        )}
      >
        <img
          src={src}
          alt={title}
          onClick={toggleSize}
          className={
            isActualSize
              ? "max-w-none cursor-zoom-out"
              : "max-h-full max-w-full cursor-zoom-in object-contain"
          }
        />
      </div>
    </>
  );
};
