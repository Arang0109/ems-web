import type { ScheduleSnapshot, SheetCalcExternals, SheetCalcPreview } from "@entities/schedule";
import { FormDialog } from "@shared/ui/dialogs";

import type { ScheduleBasicInfoForm, SheetForm } from "../../model/types";
import { ReportPreviewContent } from "./ReportPreviewContent";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sheet: SheetForm | null;
  preview: SheetCalcPreview | null;
  snapshot: ScheduleSnapshot | null;
  basicInfoForm: ScheduleBasicInfoForm;
  externals: SheetCalcExternals;
}

// 기록지 미리보기 — 현재 입력과 실시간 계산값으로 종이 기록지를 재현한다.
export const ReportPreviewModal = ({
  open, onOpenChange, sheet, preview, snapshot, basicInfoForm, externals,
}: Props) => (
  <FormDialog
    title="기록지 미리보기"
    description="현재 입력된 측정 데이터 기준의 미리보기입니다."
    open={open}
    onOpenChange={onOpenChange}
    submitLabel=""
    cancelLabel="닫기"
    size="xl"
  >
    {sheet && snapshot ? (
      <ReportPreviewContent sheet={sheet} preview={preview} snapshot={snapshot}
        basicInfoForm={basicInfoForm} externals={externals} />
    ) : (
      <p className="text-sm text-muted-foreground py-6 text-center">미리보기할 기록지가 없습니다.</p>
    )}
  </FormDialog>
);
