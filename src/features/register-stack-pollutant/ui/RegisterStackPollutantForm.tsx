import { Plus, Trash2 } from "lucide-react";

import { useRegisterStackPollutant } from "../model/hooks/use-register-stack-pollutant";

import { usePollutants } from "@entities/pollutant";

import { FormDialog } from "@shared/ui/dialogs";
import { Checkbox, FieldGroup, InputGroup, Select, SectionTitle } from "@shared/ui/form";
import { measurementCycleOptions } from "@shared/model";
import type { MeasurementCycle } from "@shared/model";

interface Props {
  stackId: number | null;
  /** 측정시설의 기준산소농도(%) — null 이면 산소보정 적용 여부를 묻지 않는다 */
  standardOxygen: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

/**
 * md 미만은 항목당 세로 스택(카드), md 이상은 표 형태 그리드다.
 *
 * 뒤쪽 두 열(산소보정·삭제)은 `auto` 가 아니라 고정 폭이다. 열 제목과 각 행은 별개의
 * grid container 라 `auto` 로 두면 트랙 폭이 서로 달라져 제목과 컨트롤이 어긋난다.
 * 게다가 체크박스는 내부가 `w-full`(퍼센트 폭)이라 `auto` 트랙에 기여하는 폭이 0에
 * 가깝게 잡혀 트랙이 붕괴하고, 컨트롤이 트랙 밖으로 밀려 모달 오른쪽에서 잘린다.
 *
 * fr 트랙은 기본 최소값이 min-content 라 Select·Input 의 최소 폭 아래로 줄지 않는다.
 * `minmax(0,*)` 와 셀의 `min-w-0`(그리드 아이템의 `min-width:auto` 해제)이 함께 있어야
 * 실제로 줄어든다 — 하나만 있으면 긴 오염물질명에서 뒤 열이 오른쪽으로 밀린다.
 *
 * Tailwind 는 완성된 클래스명만 인식하므로 두 배치를 각각 상수로 둔다.
 */
const GRID_COLS = "md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_2.5rem]";
const GRID_COLS_WITH_OXYGEN =
  "md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_4rem_2.5rem]";

const HEADER_CLASS = "hidden gap-2 px-1 text-label text-muted-foreground md:grid md:items-center";
const ROW_CLASS =
  "grid grid-cols-1 gap-3 rounded-lg border border-border p-3 md:gap-2 md:rounded-none md:border-0 md:p-0 md:items-center";
const CELL_CLASS = "flex min-w-0 flex-col gap-1";

export const RegisterStackPollutantForm = ({
  stackId,
  standardOxygen,
  open,
  onOpenChange,
  onSuccess,
}: Props) => {
  const {
    rows, hasStandardOxygen, isLoading,
    handleAddRow, handleRemoveRow, handleChange, handleSubmit,
  } = useRegisterStackPollutant({
    stackId,
    standardOxygen,
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  const gridCols = hasStandardOxygen ? GRID_COLS_WITH_OXYGEN : GRID_COLS;

  // 이 고객사가 채택한 물질만 온다 — 목록에 없는 물질은 측정물질 관리에서 먼저 등록해야 한다.
  const { data: pollutants } = usePollutants();
  const pollutantOptions = pollutants.map((pollutant) => ({
    value: String(pollutant.id),
    label: pollutant.nameKr,
  }));
  const hasPollutants = pollutantOptions.length > 0;

  return (
    <FormDialog
      title="측정항목 등록"
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
      submitLabel="등록"
      isLoading={isLoading}
      size="lg"
    >
      <FieldGroup>
        <div className="flex items-center justify-between">
          <SectionTitle>측정항목</SectionTitle>
          <button
            type="button"
            onClick={handleAddRow}
            className="inline-flex items-center gap-1 text-body-2 text-brand-dark hover:underline"
          >
            <Plus className="size-4" /> 항목 추가
          </button>
        </div>

        {!hasPollutants && (
          <p className="text-body-4 text-muted-foreground">
            등록된 측정물질이 없습니다. <b>측정물질 조회/관리</b>에서 먼저 물질을 등록해 주세요.
          </p>
        )}

        {hasStandardOxygen && (
          <p className="text-body-4 text-muted-foreground">
            이 측정시설의 기준산소농도는 <b>{standardOxygen}%</b> 입니다.
            산소보정을 적용할 항목만 체크하세요.
          </p>
        )}

        {/* 열 제목은 표 배치일 때만 의미가 있다. 좁은 화면에서는 행마다 라벨을 붙인다. */}
        <div className={`${HEADER_CLASS} ${gridCols}`}>
          <span>오염물질</span>
          <span>측정 주기</span>
          <span>허용 기준</span>
          {hasStandardOxygen && <span>산소보정</span>}
          <span className="sr-only">삭제</span>
        </div>

        {rows.map((row, index) => (
          <div key={index} className={`${ROW_CLASS} ${gridCols}`}>
            <div className={CELL_CLASS}>
              <span className="text-label text-muted-foreground md:hidden">오염물질</span>
              <Select
                id={`pollutant-${index}`}
                placeholder={hasPollutants ? "오염물질 선택" : "등록된 측정물질이 없습니다"}
                options={pollutantOptions}
                value={row.pollutantId || undefined}
                onValueChange={(value) => value && handleChange(index, "pollutantId", value)}
                disabled={!hasPollutants}
              />
            </div>
            <div className={CELL_CLASS}>
              <span className="text-label text-muted-foreground md:hidden">측정 주기</span>
              <Select
                id={`cycle-${index}`}
                placeholder="주기 선택"
                options={measurementCycleOptions}
                value={row.cycle}
                onValueChange={(value) => value && handleChange(index, "cycle", value as MeasurementCycle)}
              />
            </div>
            <div className={CELL_CLASS}>
              <span className="text-label text-muted-foreground md:hidden">허용 기준</span>
              <InputGroup
                id={`allowance-${index}`}
                placeholder="허용 기준"
                value={row.allowance}
                onChange={(value) => handleChange(index, "allowance", value)}
              />
            </div>
            {/* 체크박스 내부가 w-full 이라 열 안에서 가운데 정렬이 먹지 않는다.
                제목("산소보정")도 왼쪽 정렬로 맞춰 두 그리드의 시작점을 일치시킨다. */}
            {hasStandardOxygen && (
              <div className="flex min-w-0 items-center">
                <Checkbox
                  id={`oxygen-applicable-${index}`}
                  // 열 제목이 없는 좁은 화면에서는 체크박스 옆 문구가 유일한 설명이다.
                  label={<span className="md:sr-only">산소보정 적용</span>}
                  checked={row.oxygenApplicable}
                  onChange={(value) => handleChange(index, "oxygenApplicable", value)}
                />
              </div>
            )}
            <div className="flex min-w-0 justify-end">
              <button
                type="button"
                onClick={() => handleRemoveRow(index)}
                disabled={rows.length === 1}
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="행 삭제"
              >
                <Trash2 className="size-4" />
                <span className="text-body-4 md:hidden">삭제</span>
              </button>
            </div>
          </div>
        ))}
      </FieldGroup>
    </FormDialog>
  );
};
