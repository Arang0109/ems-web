import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface DividerProps {
  /** 선 가운데에 얹는 문구(예: "또는"). 없으면 선만 그린다 */
  text?: string;
  /** 배치용 — 그리드 칸 걸침(`col-span-2`) 등 */
  className?: string;
}

/**
 * 구분선. 문구가 없어도 캡션 한 줄 높이를 차지한다 — 폼 섹션 사이 간격이 이 높이에 맞춰져 있다.
 */
export const Divider = ({ text, className }: DividerProps) => {
  return (
    <div className={cn("relative", className)}>
      <div className="absolute inset-0 flex items-center">
        <Separator />
      </div>
      <div className="relative flex justify-center text-caption">
        <span className="px-2 bg-canvas/95 text-muted-ink" aria-hidden={!text || undefined}>{text}</span>
      </div>
    </div>
  );
}
