import type { StackPollutantListItem } from "@entities/stack-pollutant";
import { FormDialog } from "@shared/ui/dialogs";
import { Checkbox, FieldGroup, InputGroup, Select, SectionTitle } from "@shared/ui/form";
import { measurementCycleOptions } from "@shared/model";
import type { MeasurementCycle } from "@shared/model";

import { useUpdateStackPollutant } from "../model/hooks/use-update-stack-pollutant";

interface Props {
  item: StackPollutantListItem | null;
  /** 측정시설의 기준산소농도(%) — null 이면 산소보정 적용 여부를 묻지 않는다 */
  standardOxygen: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

/**
 * 측정시설 원장의 측정항목 상세 — 측정 조건 수정. 삭제는 목록의 행에서 바로 한다.
 *
 * 오염물질 자체는 바꿀 수 없다(서버도 받지 않는다). 다른 물질로 바꾸는 것은
 * 이 항목을 지우고 새로 등록하는 일이므로, 물질명은 읽기 전용으로만 보여 준다.
 */
export const UpdateStackPollutantForm = ({
  item, standardOxygen, open, onOpenChange, onSuccess,
}: Props) => {
  const close = () => onOpenChange(false);

  const { form, hasStandardOxygen, isLoading, handleChange, handleSubmit } = useUpdateStackPollutant({
    item,
    standardOxygen,
    onSuccess: () => { close(); onSuccess?.(); },
  });

  return (
    <FormDialog
      title="측정항목 상세"
      description={item ? `${item.pollutant.nameKr} 의 측정 조건을 수정합니다.` : undefined}
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
      submitLabel="수정"
      cancelLabel="닫기"
      isLoading={isLoading}
    >
      <FieldGroup>
        <SectionTitle>측정 조건</SectionTitle>

        {/* 물질은 수정 대상이 아니므로 입력이 아니라 표시로 둔다 */}
        <InputGroup
          id="pollutant-name"
          label="오염물질"
          value={item?.pollutant.nameKr ?? ''}
          onChange={() => {}}
          disabled
        />

        <div className="grid gap-4 md:grid-cols-2">
          <Select
            id="cycle"
            label="측정 주기"
            placeholder="주기 선택"
            options={measurementCycleOptions}
            value={form.cycle}
            onValueChange={(value) => value && handleChange('cycle', value as MeasurementCycle)}
          />
          <InputGroup
            id="allowance"
            label="허용 기준"
            placeholder="비워 두면 미지정"
            value={form.allowance}
            onChange={(value) => handleChange('allowance', value)}
          />
        </div>

        {hasStandardOxygen && (
          <Checkbox
            id="oxygen-applicable"
            label={`산소보정 적용 (기준산소농도 ${standardOxygen}%)`}
            checked={form.oxygenApplicable}
            onChange={(value) => handleChange('oxygenApplicable', value)}
          />
        )}
      </FieldGroup>
    </FormDialog>
  );
};
