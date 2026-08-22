import { useState } from "react";
import { Check } from "lucide-react";

import type { PreviousSheetCandidate } from "@entities/schedule";

import type { MeasurementCategory } from "@shared/model";
import { FormDialog } from "@shared/ui/dialogs";

import { describePreviousSource } from "../model/hooks/use-load-previous-sheet";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: MeasurementCategory;
  candidates: PreviousSheetCandidate[];
  isLoading: boolean;
  onSelect: (sourceScheduleId: number) => void;
}

/**
 * 이전 기록을 가져올 회차를 고르는 목록.
 *
 * 최근 회차를 기본으로 두되 그 앞 회차도 고를 수 있다 — 직전 회차가 이상 조업이었거나 값이
 * 어긋난 경우가 있어, "가장 최근"이 늘 좋은 출발점은 아니다.
 *
 * 별도의 확인 단계를 두지 않으므로 무엇이 사라지는지는 여기서 밝힌다.
 */
export const LoadPreviousSheetDialog = ({
  open, onOpenChange, candidates, isLoading, onSelect,
}: Props) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // 목록이 갈려 선택이 사라졌을 때(카테고리 전환 등) 가장 최근 회차로 되돌린다.
  // 파생값이라 상태 동기화가 필요 없다.
  const selected =
    candidates.find((candidate) => candidate.sourceScheduleId === selectedId) ?? candidates[0];

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selected) onSelect(selected.sourceScheduleId);
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
      title="이전 기록지 데이터 불러오기"
      description={
        "이전 기록지의 데이터를 현재 기록지에 적용합니다.\n" +
        "기상 조건은 유지되며, 시료번호와 채취 시각은 새로 입력해야 합니다."
      }
      submitLabel="불러오기"
      loadingLabel="불러오는 중..."
      isLoading={isLoading}
      submitDisabled={isLoading || !selected}
    >
      <ul className="space-y-2">
        {candidates.map((candidate, index) => {
          const isSelected = selected?.sourceScheduleId === candidate.sourceScheduleId;
          return (
            <li key={candidate.sourceScheduleId}>
              <button
                type="button"
                onClick={() => setSelectedId(candidate.sourceScheduleId)}
                aria-pressed={isSelected}
                className={`flex w-full items-center gap-2 rounded-button border px-3 py-2.5 text-left transition-colors ${
                  isSelected
                    ? "border-brand-primary bg-brand-soft text-brand-dark"
                    : "border-rule bg-surface text-ink hover:border-rule-dark"
                }`}
              >
                <span className="text-body-3">{describePreviousSource(candidate)}</span>
                {/* 목록은 최신순이라 첫 항목이 가장 최근 회차다. */}
                {index === 0 && (
                  <span className="text-caption text-muted-ink">최근</span>
                )}
                {isSelected && <Check size={16} className="ml-auto shrink-0" />}
              </button>
            </li>
          );
        })}
      </ul>
    </FormDialog>
  );
};
