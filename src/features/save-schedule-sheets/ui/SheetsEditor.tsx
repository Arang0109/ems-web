import { useState } from "react";
import { Download, FileCheck, Plus, Save, X } from "lucide-react";

import type { ScheduleSnapshot, SheetCalcExternals } from "@entities/schedule";
import { measurementCategoryOptions } from "@shared/model";
import type { MeasurementCategory } from "@shared/model";
import { MEASUREMENT_CATEGORY_LABEL } from "@shared/config";
import { Select } from "@shared/ui/form";
import { Button } from "@shared/ui/buttons";
import { useConfirm } from "@shared/ui/dialogs";
import { StickyActionBar } from "@shared/ui/layout";

import { useSaveSheets } from "../model/hooks/use-save-sheets";
import { BasicInfoSection } from "./BasicInfoSection";
import { SheetFormView } from "./SheetFormView";
import { ReportPreviewModal } from "./report/ReportPreviewModal";
import { ExportSamplingRecordsModal } from "./ExportSamplingRecordsModal";

interface Props {
  scheduleId: number | null;
  snapshot: ScheduleSnapshot | null;    // 기록지 미리보기용 (업체·시설·팀 정보)
  editable: boolean;
  externals: SheetCalcExternals;
  onSaved?: () => void;
}

export const SheetsEditor = ({ scheduleId, snapshot, editable, externals, onSaved }: Props) => {
  const {
    sheets, addSheet, removeSheet, previewCalc,
    activeSheet, updateActiveSheet, activeIndex, setActiveIndex,
    basicInfoForm, handleBasicInfoChange,
    handleSave,
    isExportDialogOpen, samplingRecordTemplate, isExporting,
    setExportDialogOpen, handleExport,
    isLoading,
  } = useSaveSheets({ scheduleId, snapshot, externals, onSaved, });

  const [newCategory, setNewCategory] = useState<MeasurementCategory>("GAS");
  const [previewOpen, setPreviewOpen] = useState(false);

  const confirm = useConfirm();

  // 탭 하나가 기록지 한 장이라 입력한 측정값이 통째로 사라진다. 저장 시 서버 시트도 함께 지워진다.
  const handleRemoveSheet = async (index: number, category: MeasurementCategory) => {
    const isConfirmed = await confirm({
      title: "기록지 삭제",
      description: `${MEASUREMENT_CATEGORY_LABEL[category]} 기록지를 삭제합니다.\n입력한 측정값이 사라집니다.`,
      confirmLabel: "삭제",
      tone: "danger",
    });
    if (isConfirmed) removeSheet(index);
  };

  return (
    <div className="space-y-4">
        {/* 측정계획 단위 공통 값이므로 시트 탭 바깥에 둔다(시트 전환·시트 0개와 무관하게 유지). */}
      <BasicInfoSection
          basicInfoForm={basicInfoForm}
          editable={editable}
          onChange={handleBasicInfoChange}
        />

      {/* 기록지 탭 바 — 활성 기록지는 브랜드 테두리, × 로 삭제, 우측 정사각 + 로 추가 */}
      <div className="flex flex-wrap items-center gap-2">
        {sheets.map((sheet, index) => {
          const active = index === activeIndex;
          return (
            <div
              key={index}
              className={`flex items-center gap-1 rounded-button border px-3 py-1.5 text-body-4 transition-colors ${
                active
                  ? "border-brand-primary bg-brand-soft text-brand-dark"
                  : "border-rule-dark bg-rule-dark/50 text-muted-ink hover:border-rule-dark"
              }`}
            >
              <button type="button" onClick={() => setActiveIndex(index)}>
                {MEASUREMENT_CATEGORY_LABEL[sheet.category]}
              </button>
              {editable && (
                <button
                  type="button"
                  onClick={() => handleRemoveSheet(index, sheet.category)}
                  aria-label={`${MEASUREMENT_CATEGORY_LABEL[sheet.category]} 기록지 삭제`}
                  className="text-muted-ink hover:text-danger"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          );
        })}
        {sheets.length === 0 && (
          <span className="text-body-3 text-muted-ink">등록된 기록지가 없습니다.</span>
        )}

        {editable && (
          <div className="ml-auto flex items-center gap-2">
            <Select
              className="w-32"
              value={newCategory}
              options={measurementCategoryOptions}
              onValueChange={(v) => setNewCategory((v ?? "GAS") as MeasurementCategory)}
            />
            <Button
              variant="default" aria-label="기록지 추가"
              onClick={() => addSheet(newCategory)}
            >
              <Plus size={19} />
            </Button>
          </div>
        )}
      </div>

      {activeSheet ? (
        <>
          <SheetFormView
            key={activeIndex}
            sheet={activeSheet}
            previewCalc={previewCalc}
            externals={externals}
            editable={editable}
            onChange={updateActiveSheet}
          />

          {/* 시트가 0개면 이 바가 없어 공통 채취시간만 단독 저장할 수는 없다.
              시트 0개로 PUT /sheets를 보내면 전체 시트 삭제가 되므로 현 구조를 유지한다. */}
          <StickyActionBar className="rounded-t-panel flex items-center justify-center">
            <Button type="button" variant="soft" onClick={() => setPreviewOpen(true)}>
              <FileCheck size={19} />미리보기
            </Button>

            {editable && (
              <>
                {/* 서버는 "저장된" 데이터로 엑셀을 채우므로 다운로드는 항상 저장을 먼저 수행한다. */}
                <Button
                  type="button"
                  variant="outline"
                  aria-label="저장 후 채취기록지 다운로드"
                  onClick={() => setExportDialogOpen(true)}
                  disabled={isLoading || scheduleId == null}
                >
                  <Download size={19} />다운로드
                </Button>
                <Button type="button" onClick={handleSave} disabled={isLoading || scheduleId == null}>
                  <Save size={19} />
                  {isLoading ? "저장 중..." : "저장"}
                </Button>
              </>
            )}
          </StickyActionBar>
        </>
      ) : (
        <p className="py-8 text-center text-body-3 text-muted-ink">
          {editable ? "기록지를 추가하여 측정 데이터를 입력하세요." : "입력된 측정 데이터가 없습니다."}
        </p>
      )}

      {!editable && (
        <p className="text-caption text-muted-ink">
          완료 또는 취소된 측정계획은 측정 데이터를 수정할 수 없습니다.
        </p>
      )}

      <ReportPreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        sheet={activeSheet}
        preview={previewCalc}
        snapshot={snapshot}
        basicInfoForm={basicInfoForm}
        externals={externals}
      />

      <ExportSamplingRecordsModal
        open={isExportDialogOpen}
        onOpenChange={setExportDialogOpen}
        template={samplingRecordTemplate}
        isLoading={isExporting}
        onSubmit={handleExport}
      />
    </div>
  );
};
