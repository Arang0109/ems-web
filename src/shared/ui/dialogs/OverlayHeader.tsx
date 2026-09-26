import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

import { IconButton } from "../buttons";

interface OverlayHeaderProps {
  /** 제목 영역 — 보통 `Dialog.Title`(+ `Dialog.Description`) */
  children: React.ReactNode;
  /** 닫기 버튼 앞에 놓는 도구(배율·다운로드 등) */
  actions?: React.ReactNode;
  /** 닫기 버튼의 스크린리더 이름 */
  closeLabel?: string;
  className?: string;
}

/**
 * 뷰어·드로어 상단 바 — 제목 + 도구 + 닫기.
 *
 * Base UI `Dialog` 루트 안이면 어디서든 닫기가 동작한다(shadcn `DialogContent` 도 같은 루트다).
 * 여백·정렬은 표면마다 달라 `className` 으로 덮는다.
 */
export const OverlayHeader = ({ children, actions, closeLabel = "닫기", className }: OverlayHeaderProps) => (
  <header className={cn("flex shrink-0 items-center gap-2 border-b border-rule px-3 py-2", className)}>
    <div className="min-w-0 flex-1">{children}</div>
    {actions}
    <Dialog.Close render={<IconButton size="icon-sm" icon={<X size={18} />} label={closeLabel} />} />
  </header>
);
