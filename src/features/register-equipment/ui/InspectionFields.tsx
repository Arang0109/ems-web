import { addMonths, format } from "date-fns";

import type { InspectionItemForm } from "../model/types";

import { InlineInput, Checkbox, DatePicker, SectionTitle } from "@shared/ui/form";
import { INSPECTION_TYPE_LABEL } from "@shared/config";

interface Props {
  inspections: InspectionItemForm[];
  error?: string;
  onChange: (index: number, field: keyof InspectionItemForm, value: string | boolean) => void;
}

// 다음 검사 예정일 미리보기 — 서버가 최종 수검일 + 주기로 계산하는 값을 폼에서 그대로 보여준다.
// 실제 값은 항상 서버 응답의 nextDueDate가 기준이다.
const previewNextDueDate = (item: InspectionItemForm): string => {
  if (!item.enabled || !item.lastInspectedAt) return '—';
  const cycle = Number(item.cycleMonths);
  if (!Number.isFinite(cycle) || cycle <= 0) return '—';
  return format(addMonths(new Date(item.lastInspectedAt), cycle), 'yyyy-MM-dd');
};

export const InspectionFields = ({ inspections, error, onChange }: Props) => (
  <div className="space-y-4">
    <SectionTitle>검사 항목</SectionTitle>
    <p className="text-body-2 text-muted-foreground">
      정도검사·교정·일반시험은 서로 배타적이지 않습니다. 이 장비가 받는 검사만 대상으로 체크해주세요.
    </p>

    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse">
        <thead>
          <tr className="border-b border-border text-body-4 text-muted-foreground">
            <th className="py-2 text-left font-normal">검사 종류</th>
            <th className="py-2 text-left font-normal">대상</th>
            <th className="py-2 text-left font-normal">주기(개월)</th>
            <th className="py-2 text-left font-normal">최종 수검일</th>
            <th className="py-2 text-left font-normal">다음 예정일</th>
            <th className="py-2 text-left font-normal">알림</th>
          </tr>
        </thead>
        <tbody>
          {inspections.map((item, index) => (
            <tr key={item.type} className="border-b border-border last:border-b-0">
              <td className="py-3 text-body-2 text-foreground whitespace-nowrap">
                {INSPECTION_TYPE_LABEL[item.type]}
              </td>
              <td className="py-3">
                <Checkbox
                  id={`inspection-enabled-${item.type}`}
                  checked={item.enabled}
                  onChange={(v) => onChange(index, 'enabled', v)}
                />
              </td>
              <td className="py-3">
                <InlineInput
                  id={`inspection-cycle-${item.type}`}
                  value={item.cycleMonths}
                  onChange={(v) => onChange(index, 'cycleMonths', v)}
                  disabled={!item.enabled}
                  placeholder="12"
                />
              </td>
              <td className="py-3 pr-2 min-w-[180px]">
                <DatePicker
                  id={`inspection-last-${item.type}`}
                  value={item.lastInspectedAt ? new Date(item.lastInspectedAt) : undefined}
                  onChange={(date) => onChange(index, 'lastInspectedAt', date ? format(date, 'yyyy-MM-dd') : '')}
                  disabled={!item.enabled}
                  placeholder="선택"
                />
              </td>
              <td className="py-3 text-body-2 text-muted-foreground whitespace-nowrap">
                {previewNextDueDate(item)}
              </td>
              <td className="py-3">
                <Checkbox
                  id={`inspection-notify-${item.type}`}
                  checked={item.notificationEnabled}
                  onChange={(v) => onChange(index, 'notificationEnabled', v)}
                  disabled={!item.enabled}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {error && <p className="text-body-2 text-destructive">{error}</p>}
  </div>
);
