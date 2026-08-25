import { ArrowDown, ArrowUp, Plus, SquarePen, Trash2, X } from "lucide-react";
import { IconButton } from "ems-web";

/**
 * 아이콘 전용 버튼. `icon` 은 노드이므로 크기를 직접 준다 (`size={16}`),
 * `label` 은 스크린리더용 이름이라 생략하지 않는다.
 */
export const Variants = () => (
  <div className="flex flex-wrap items-center gap-2">
    <IconButton icon={<Plus size={16} />} label="배출시설 추가" />
    <IconButton icon={<SquarePen size={16} />} label="수정" variant="outline" />
    <IconButton icon={<Trash2 size={16} />} label="삭제" variant="destructive" />
    <IconButton icon={<X size={16} />} label="닫기" variant="ghost" />
    <IconButton icon={<Plus size={16} />} label="항목 추가" variant="soft" />
  </div>
);

/** 정사각 size 축 — icon-xs(24) / icon-sm(32) / icon(36) / icon-lg(40) */
export const Sizes = () => (
  <div className="flex flex-wrap items-center gap-4">
    {([
      ["icon-xs", 12],
      ["icon-sm", 16],
      ["icon", 19],
      ["icon-lg", 22],
    ] as const).map(([size, px]) => (
      <div key={size} className="flex flex-col items-center gap-1">
        <IconButton icon={<Plus size={px} />} label={`추가 ${size}`} variant="outline" size={size} />
        <span className="text-caption text-muted-ink">{size}</span>
      </div>
    ))}
  </div>
);

/** 정렬 카드 헤더의 실제 조합 — 위/아래 이동은 끝에서 비활성된다 */
export const RowActions = () => (
  <div className="flex items-center justify-between gap-4 border-b border-rule p-3">
    <span className="text-body-1">1호기 보일러 배출시설</span>
    <div className="flex items-center gap-1">
      <IconButton icon={<ArrowUp size={16} />} label="위로 이동" variant="ghost" size="icon-sm" disabled />
      <IconButton icon={<ArrowDown size={16} />} label="아래로 이동" variant="ghost" size="icon-sm" />
      <IconButton icon={<SquarePen size={16} />} label="수정" variant="ghost" size="icon-sm" />
    </div>
  </div>
);
