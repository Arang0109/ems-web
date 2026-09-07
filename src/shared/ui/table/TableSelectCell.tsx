import type { FieldTone } from "@shared/model";
import { Select, type SelectOption } from "@shared/ui/form";
import { cn } from "@/lib/utils";

/** 톤별 셀 면 색 — `default` 는 칠하지 않는다 */
const TONE_CELL: Record<Exclude<FieldTone, "default">, string> = {
  info: "bg-info-soft",
  danger: "bg-danger-soft",
};

/**
 * 기록지형 테이블의 선택 셀 — 정해진 값 중 하나를 고르는 칸.
 *
 * 자유 입력이 아닌 열(단위 등)이 자리다. 테두리·그림자를 걷어 셀 자체가 트리거로 보이게 하고,
 * 좌우 여백은 `TableInputCell` 의 입력 칸과 맞춰 열이 들쭉날쭉해지지 않게 한다.
 */
export const TableSelectCell = ({
  value,
  onChange,
  options,
  searchable,
  placeholder,
  colSpan,
  disabled = false,
  tone = "default",
  onFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  /** 서버에서 온 긴 목록이면 켠다 — 팝업 안에 검색 입력이 붙는다 */
  searchable?: boolean;
  placeholder?: string;
  colSpan?: number;
  disabled?: boolean;
  /** 칸의 상태 색. 의미는 호출부가 정한다 (`UnitField` 와 같은 계약) */
  tone?: FieldTone;
  /** 이 칸에 포커스가 들어왔을 때 */
  onFocus?: () => void;
}) => {
  // `searchable` 은 Select 에서 판별 유니온이라(groups 와 동시 사용 금지) 여기서 분기해 넘긴다.
  const common = {
    value,
    onValueChange: (next: string | null) => onChange(next ?? ""),
    placeholder,
    disabled,
    className: cn(
      `rounded-none border-0 bg-transparent px-2 shadow-none sm:px-3
        focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-primary`,
      tone === "info" && "text-info-ink",
    ),
  };

  return (
    <td
      colSpan={colSpan}
      onFocusCapture={onFocus}
      className={cn("border border-rule", tone !== "default" && TONE_CELL[tone])}
    >
      {searchable ? (
        <Select searchable options={options} {...common} />
      ) : (
        <Select options={options} {...common} />
      )}
    </td>
  );
};
