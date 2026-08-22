import type { MeasurementItemSnapshot } from "@entities/schedule";
import { FormDialog } from "@shared/ui/dialogs";
import { Checkbox, FieldGroup, InputGroup, Select } from "@shared/ui/form";
import { measurementCycleOptions } from "@shared/model";
import type { MeasurementCycle } from "@shared/model";

import { useUpdateScheduleItem } from "../model/hooks/use-update-schedule-item";

interface Props {
  scheduleId: number;
  /** 정정할 측정항목(이 회차 문서의 스냅샷) */
  item: MeasurementItemSnapshot;
  /** 측정시설 원장에 남아 있는 같은 항목의 id — 없으면(삭제된 항목) 원장 반영을 제안하지 않는다 */
  stackPollutantId: number | null;
  /** 측정시설의 기준산소농도(%) — null 이면 산소보정을 적용할 근거가 없어 묻지 않는다 */
  standardOxygen: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const UpdateScheduleItemForm = ({
  scheduleId, item, stackPollutantId, standardOxygen, open, onOpenChange, onSuccess,
}: Props) => {
  const {
    form, fieldErrors, canApplyToStack, isLoading, handleChange, handleSubmit,
  } = useUpdateScheduleItem({
    scheduleId,
    item,
    stackPollutantId,
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  const hasStandardOxygen = standardOxygen !== null;

  return (
    <FormDialog
      title={`${item.nameKr} 측정조건 정정`}
      description="이 측정계획에 적용된 측정조건을 바로잡습니다. 계획 수립 뒤 배출허용기준이나 산소보정 적용 여부가 실제와 다름을 확인했을 때 사용합니다."
      open={open}
      onOpenChange={onOpenChange}
      cancelLabel="취소"
      submitLabel="정정"
      isLoading={isLoading}
      onSubmit={handleSubmit}
    >
      <FieldGroup>
        <Select
          id="item-cycle"
          label="측정주기"
          placeholder="주기 선택"
          options={measurementCycleOptions}
          value={form.cycle}
          onValueChange={(value) => value && handleChange("cycle", value as MeasurementCycle)}
        />

        <InputGroup
          id="item-allowance"
          label="배출허용기준"
          placeholder="비워 두면 '미지정'입니다"
          value={form.allowance}
          onChange={(value) => handleChange("allowance", value)}
          error={fieldErrors?.allowance}
          invalid={Boolean(fieldErrors?.allowance)}
          helperText="비워 두면 초과 여부를 판정하지 않습니다(0 과 다릅니다)."
        />

        {hasStandardOxygen ? (
          <Checkbox
            id="item-oxygen-applicable"
            label={
              <span className="text-body-2 text-ink">
                산소보정 적용{" "}
                <span className="text-caption text-muted-ink">
                  (이 측정시설의 기준산소농도 {standardOxygen}%)
                </span>
              </span>
            }
            checked={form.oxygenApplicable}
            onChange={(value) => handleChange("oxygenApplicable", value)}
          />
        ) : (
          <p className="text-body-4 text-muted-foreground">
            이 측정시설에는 기준산소농도가 없어 산소보정을 적용할 수 없습니다.
            적용해야 한다면 <b>측정시설 정보</b>에서 기준산소농도를 먼저 채워 주세요.
          </p>
        )}

        <div className="rounded-panel border border-rule bg-canvas p-3">
          <Checkbox
            id="item-apply-to-stack"
            label={<span className="text-body-2 text-ink">측정지점 원장에도 반영</span>}
            checked={form.applyToStack}
            onChange={(value) => handleChange("applyToStack", value)}
            disabled={!canApplyToStack}
          />
          <p className="pt-2 text-caption text-muted-ink">
            {canApplyToStack
              ? "체크하면 측정지점의 측정항목까지 같은 값으로 수정해, 앞으로 세울 계획도 이 기준을 따릅니다. 이미 완료된 과거 회차는 그대로 유지됩니다."
              : "이 항목은 측정지점에서 이미 삭제되어 원장에 반영할 대상이 없습니다."}
          </p>
        </div>
      </FieldGroup>
    </FormDialog>
  );
};
