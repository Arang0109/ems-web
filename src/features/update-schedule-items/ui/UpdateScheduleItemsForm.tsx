import type { MeasurementItemSnapshot } from "@entities/schedule";
import type { StackPollutantListItem } from "@entities/stack-pollutant";
import { FormDialog } from "@shared/ui/dialogs";
import { Checkbox, FieldGroup } from "@shared/ui/form";

import { useUpdateScheduleItems } from "../model/hooks/use-update-schedule-items";

interface Props {
  scheduleId: number;
  /** 측정시설(원장)에 등록된 측정항목 — 선택 후보 */
  stackPollutants: StackPollutantListItem[];
  /** 이번 계획에 포함된 측정항목(스냅샷) */
  items: MeasurementItemSnapshot[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const UpdateScheduleItemsForm = ({
  scheduleId, stackPollutants, items, open, onOpenChange, onSuccess,
}: Props) => {
  const {
    groups, selectedIds, fieldErrors, isLoading,
    handleToggle, handleToggleGroup, handleSubmit,
  } = useUpdateScheduleItems({
    scheduleId,
    stackPollutants,
    items,
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  const hasOptions = groups.length > 0;

  return (
    <FormDialog
      title="측정항목"
      open={open}
      onOpenChange={onOpenChange}
      cancelLabel="닫기"
      submitLabel="저장"
      submitDisabled={!hasOptions}
      isLoading={isLoading}
      size="lg"
      onSubmit={handleSubmit}
    >
      <FieldGroup>
        {!hasOptions && (
          <p className="text-body-4 text-muted-foreground">
            측정시설에 등록된 측정항목이 없습니다. <b>측정지점 상세</b>에서 먼저 항목을 등록해 주세요.
          </p>
        )}

        {groups.map((group) => {
          const ids = group.options.map((option) => option.pollutantId);
          const isAllSelected = ids.every((id) => selectedIds.has(id));

          return (
            <div key={group.cycle} className="rounded-panel border border-rule bg-canvas p-3">
              <div className="flex items-center justify-between border-b border-rule px-1 pb-2">
                <p className="text-body-4 text-ink">
                  {group.label} :{" "}
                  <span className="text-brand-dark">
                    {ids.filter((id) => selectedIds.has(id)).length}/{ids.length}개
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => handleToggleGroup(group.cycle, !isAllSelected)}
                  className="text-body-4 text-brand-dark hover:underline"
                >
                  {isAllSelected ? "전체 해제" : "전체 선택"}
                </button>
              </div>

              <div className="grid gap-2 pt-3 md:grid-cols-2">
                {group.options.map((option) => (
                  <div key={option.pollutantId} className="flex min-w-0 items-center gap-2">
                    <Checkbox
                      id={`item-${option.pollutantId}`}
                      label={
                        <span className="flex flex-wrap items-baseline gap-x-2">
                          <span className="text-body-2 text-ink">{option.nameKr}</span>
                          <span className="text-caption text-muted-ink">
                            허용기준 : {option.allowance}
                          </span>
                          {/* 산소보정은 적용하는 항목에만 붙인다 — 대부분 미적용이라 다 적으면 읽히지 않는다 */}
                          {option.oxygenApplicable && (
                            <span className="text-caption text-brand-dark">산소보정</span>
                          )}
                          {/* 원장에서 빠진 항목은 체크를 풀면 다시 켤 수 없다 */}
                          {option.isRetired && (
                            <span className="text-caption text-danger">측정시설에서 삭제됨</span>
                          )}
                        </span>
                      }
                      checked={selectedIds.has(option.pollutantId)}
                      onChange={(checked) => handleToggle(option.pollutantId, checked)}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {fieldErrors?.pollutantIds && (
          <p className="text-body-4 text-danger">{fieldErrors.pollutantIds}</p>
        )}

        <p className="text-caption text-muted-foreground">
          이미 포함된 항목의 허용기준은 측정 시점 값이 그대로 유지됩니다.
        </p>
      </FieldGroup>
    </FormDialog>
  );
};
