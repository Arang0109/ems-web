import { ChevronLeft, ChevronRight } from "lucide-react";

import type {
  ScheduleDetail, ScheduleSnapshot, SheetCalcExternals, SheetCalcPreview,
} from "@entities/schedule";
import { MEASUREMENT_CATEGORY_LABEL } from "@shared/config";
import { IconButton } from "@shared/ui/buttons";
import { DocumentViewerDialog } from "@shared/ui/dialogs";

import type { ScheduleBasicInfoForm, SheetForm } from "../../model/types";
import { REPORT_DOCUMENT_WIDTH, ReportPreviewContent } from "./ReportPreviewContent";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sheets: SheetForm[];
  activeIndex: number;
  /** 뷰어 안에서 기록지를 넘긴다 — 뒤의 편집 화면도 같은 시트로 따라간다 */
  onActiveIndexChange: (index: number) => void;
  preview: SheetCalcPreview | null;
  /** 계획 메타(관리번호·채취일자) — 기록지 머리에 실린다. 스냅샷에는 사본이 없다. */
  schedule: ScheduleDetail | null;
  snapshot: ScheduleSnapshot | null;
  basicInfoForm: ScheduleBasicInfoForm;
  externals: SheetCalcExternals;
}

// 기록지 미리보기 — 현재 입력과 실시간 계산값으로 종이 기록지를 재현한다.
export const ReportPreviewModal = ({
  open, onOpenChange, sheets, activeIndex, onActiveIndexChange,
  preview, schedule, snapshot, basicInfoForm, externals,
}: Props) => {
  const sheet = sheets[activeIndex] ?? null;

  // 기록지가 한 장뿐이면 전환 컨트롤 자체를 두지 않는다.
  const toolbar = sheets.length > 1 && (
    <div className="flex shrink-0 items-center gap-0.5">
      <IconButton
        size="icon-sm" label="이전 기록지" icon={<ChevronLeft size={18} />}
        disabled={activeIndex <= 0}
        onClick={() => onActiveIndexChange(activeIndex - 1)}
      />
      <span className="text-caption tabular-nums text-ink-soft">
        {activeIndex + 1} / {sheets.length}
      </span>
      <IconButton
        size="icon-sm" label="다음 기록지" icon={<ChevronRight size={18} />}
        disabled={activeIndex >= sheets.length - 1}
        onClick={() => onActiveIndexChange(activeIndex + 1)}
      />
    </div>
  );

  return (
    <DocumentViewerDialog
      open={open}
      onOpenChange={onOpenChange}
      title={sheet ? `기록지 미리보기 · ${MEASUREMENT_CATEGORY_LABEL[sheet.category]}` : "기록지 미리보기"}
      description="현재 입력된 측정 데이터 기준의 미리보기입니다."
      toolbar={toolbar || undefined}
      documentWidth={REPORT_DOCUMENT_WIDTH}
    >
      {sheet && snapshot ? (
        <ReportPreviewContent sheet={sheet} preview={preview} schedule={schedule} snapshot={snapshot}
          basicInfoForm={basicInfoForm} externals={externals} />
      ) : (
        <p className="py-6 text-center text-body-2 text-muted-ink">미리보기할 기록지가 없습니다.</p>
      )}
    </DocumentViewerDialog>
  );
};
