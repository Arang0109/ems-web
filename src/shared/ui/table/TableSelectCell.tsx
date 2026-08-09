import { ChevronDown } from "lucide-react";

// 기록지형 테이블의 select 셀
export const TableSelectCell = ({
  value,
  onChange,
  options,
  colSpan,
  placeholder,
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string | number; label: string }[];
  colSpan?: number;
  placeholder?: string;
  disabled?: boolean;
}) => (
  <td colSpan={colSpan} className="border border-rule">
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full pl-2 sm:pl-3 pr-8 py-2 sm:py-2.5 text-body-3 text-ink
          bg-transparent appearance-none cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary
          disabled:cursor-not-allowed disabled:text-muted-ink"
      >
        <option value="" disabled>
          {placeholder ?? "선택"}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-muted-ink">
        <ChevronDown size={14} />
      </span>
    </div>
  </td>
);
