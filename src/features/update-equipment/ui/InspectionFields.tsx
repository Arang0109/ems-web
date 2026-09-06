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

/** 읽기 전용 두 칸 — 검사 실시 기록으로만 갱신되므로 표현만 화면 폭에 따라 갈린다 */
const READONLY_FIELDS = [
  { key: "lastInspectedAt", label: "최종 수검일" },
  { key: "nextDueDate", label: "다음 예정일" },
] as const;

/**
 * 검사 항목.
 *
 * 표현은 폭에 따라 갈린다 — 데스크탑은 행=검사 종류인 표에서 바로 편집하고,
 * 모바일은 종류당 카드로 펼친다. 열이 7개라 좁은 폭에서 표를 그대로 두면
 * 720px 짜리 가로 스크롤이 되어 모달 안에서 못 쓴다.
 */
export const InspectionFields = ({ inspections, error, onChange, onOpenHistory }: Props) => (
  <div className="space-y-4">
    <SectionTitle>검사 항목</SectionTitle>
    <p className="text-body-2 text-muted-foreground">
      최종 수검일과 다음 예정일은 검사 실시 기록으로 갱신됩니다. 여기서는 직접 수정할 수 없습니다.
    </p>

    {/* 모바일 — 검사 종류당 카드. id 는 아래 표와 겹치면 안 되므로 접두어로 가른다. */}
    <div className="space-y-3 md:hidden">
      {inspections.map((item, index) => (
        <div key={item.type} className="space-y-3 rounded-panel border border-border p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-body-4 text-foreground">{INSPECTION_TYPE_LABEL[item.type]}</span>

            {/* 검사 대상이 아닌 종류는 서버가 이력 기록을 거부하므로 진입 자체를 막는다. */}
            {item.enabled && (
              <button
                type="button"
                onClick={() => onOpenHistory?.(item.type)}
                className="shrink-0 text-body-2 text-brand-dark hover:underline"
              >
                이력 보기
              </button>
            )}
          </div>

          <Checkbox
            id={`inspection-card-enabled-${item.type}`}
            label="검사 대상"
            checked={item.enabled}
            onChange={(v) => onChange(index, 'enabled', v)}
          />
          <Checkbox
            id={`inspection-card-notify-${item.type}`}
            label="알림 받기"
            checked={item.notificationEnabled}
            onChange={(v) => onChange(index, 'notificationEnabled', v)}
            disabled={!item.enabled}
          />

          <InlineInput
            id={`inspection-card-cycle-${item.type}`}
            prefix="주기"
            suffix="개월"
            value={item.cycleMonths}
            onChange={(v) => onChange(index, 'cycleMonths', v)}
            disabled={!item.enabled}
            placeholder="12"
          />

          <dl className="grid grid-cols-2 gap-2">
            {READONLY_FIELDS.map((f) => (
              <div key={f.key}>
                <dt className="text-caption text-muted-foreground">{f.label}</dt>
                <dd className="text-body-2 text-foreground">{item[f.key] || '—'}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>

    {/* 데스크탑 — 행=검사 종류인 표에서 바로 편집한다. */}
    <div className="hidden overflow-x-auto md:block">
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
                    className="text-body-2 text-brand-dark hover:underline whitespace-nowrap"
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
