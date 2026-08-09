import type { InspectionItemForm } from "../model/types";
import type { InspectionType } from "@shared/model";

import { InlineInput, Checkbox, SectionTitle } from "@shared/ui/form";
import { INSPECTION_TYPE_LABEL } from "@shared/config";

interface Props {
  inspections: InspectionItemForm[];
  error?: string;
  onChange: (index: number, field: keyof InspectionItemForm, value: string | boolean) => void;
  onOpenHistory?: (type: InspectionType) => void;
}

export const InspectionFields = ({ inspections, error, onChange, onOpenHistory }: Props) => (
  <div className="space-y-4">
    <SectionTitle>검사 항목</SectionTitle>
    <p className="text-body-2 text-muted-foreground">
      최종 수검일과 다음 예정일은 검사 실시 기록으로 갱신됩니다. 여기서는 직접 수정할 수 없습니다.
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
            <th className="py-2 text-left font-normal">이력</th>
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
              <td className="py-3 text-body-2 text-foreground whitespace-nowrap">
                {item.lastInspectedAt || '—'}
              </td>
              <td className="py-3 text-body-2 text-muted-foreground whitespace-nowrap">
                {item.nextDueDate || '—'}
              </td>
              <td className="py-3">
                <Checkbox
                  id={`inspection-notify-${item.type}`}
                  checked={item.notificationEnabled}
                  onChange={(v) => onChange(index, 'notificationEnabled', v)}
                  disabled={!item.enabled}
                />
              </td>
              <td className="py-3">
                {/* 검사 대상이 아닌 종류는 서버가 이력 기록을 거부하므로 진입 자체를 막는다. */}
                {item.enabled ? (
                  <button
                    type="button"
                    onClick={() => onOpenHistory?.(item.type)}
                    className="text-body-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 whitespace-nowrap"
                  >
                    이력 보기
                  </button>
                ) : (
                  <span className="text-body-2 text-muted-foreground">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {error && <p className="text-body-2 text-destructive">{error}</p>}
  </div>
);
