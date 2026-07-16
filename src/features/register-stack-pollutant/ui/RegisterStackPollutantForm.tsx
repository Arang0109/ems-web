import { Plus, Trash2 } from "lucide-react";

import { useRegisterStackPollutant } from "../model/hooks/use-register-stack-pollutant";

import { usePollutants } from "@entities/pollutant";

import { FormDialog } from "@shared/ui/dialogs";
import { FieldGroup, InputGroup, Select, SectionTitle } from "@shared/ui/form";
import { measurementCycleOptions } from "@shared/model";
import type { MeasurementCycle } from "@shared/model";

interface Props {
  stackId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const RegisterStackPollutantForm = ({
  stackId,
  open,
  onOpenChange,
  onSuccess,
}: Props) => {
  const { rows, isLoading, handleAddRow, handleRemoveRow, handleChange, handleSubmit } =
    useRegisterStackPollutant({
      stackId,
      onSuccess: () => {
        onOpenChange(false);
        onSuccess?.();
      },
    });

  const { data: pollutants } = usePollutants();
  const pollutantOptions = pollutants.map((p) => ({
    value: String(p.id),
    label: p.nameKr,
  }));

  return (
    <FormDialog
      triggerLabel="측정항목 등록"
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
            className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            <Plus className="size-4" /> 항목 추가
          </button>
        </div>

        <div className="grid grid-cols-[2fr_1fr_1fr_auto] items-center gap-2 px-1 text-xs font-semibold text-muted-foreground">
          <span>오염물질</span>
          <span>측정 주기</span>
          <span>허용 기준</span>
          <span className="sr-only">삭제</span>
        </div>

        {rows.map((row, index) => (
          <div key={index} className="grid grid-cols-[2fr_1fr_1fr_auto] items-center gap-2">
            <Select
              id={`pollutant-${index}`}
              placeholder="오염물질 선택"
              options={pollutantOptions}
              value={row.pollutantId ? String(row.pollutantId) : undefined}
              onValueChange={(value) => value && handleChange(index, "pollutantId", Number(value))}
            />
            <Select
              id={`cycle-${index}`}
              placeholder="주기 선택"
              options={measurementCycleOptions}
              value={row.cycle}
              onValueChange={(value) => value && handleChange(index, "cycle", value as MeasurementCycle)}
            />
            <InputGroup
              id={`allowance-${index}`}
              placeholder="허용 기준"
              value={row.allowance}
              onChange={(value) => handleChange(index, "allowance", value)}
            />
            <button
              type="button"
              onClick={() => handleRemoveRow(index)}
              disabled={rows.length === 1}
              className="inline-flex items-center justify-center text-muted-foreground hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="행 삭제"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </FieldGroup>
    </FormDialog>
  );
};
