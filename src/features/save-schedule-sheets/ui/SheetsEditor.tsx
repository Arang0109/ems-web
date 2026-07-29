import { useState } from "react";
import { Download, Eye, Plus, X } from "lucide-react";

import type { MeasurementSheet, ScheduleSnapshot, SheetCalcExternals } from "@entities/schedule";
import { measurementCategoryOptions } from "@shared/model";
import type { MeasurementCategory } from "@shared/model";
import { MEASUREMENT_CATEGORY_LABEL } from "@shared/config";
import { Select } from "@shared/ui/form";
import { Button } from "@shared/ui/buttons";
import { Divider } from "@shared/ui/borders";

import { useSaveSheets } from "../model/hooks/use-save-sheets";
import { BasicInfoFields } from "./BasicInfoFields";
import { SheetFormView } from "./SheetFormView";
import { ReportPreviewModal } from "./report/ReportPreviewModal";
import { ExportSamplingRecordsModal } from "./ExportSamplingRecordsModal";

interface Props {
  scheduleId: number | null;
  initialSheets: MeasurementSheet[];
  snapshot: ScheduleSnapshot | null;    // 기록지 미리보기용 (업체·시설·팀 정보)
  editable: boolean;
  externals: SheetCalcExternals;
  onSaved?: () => void;
}

export const SheetsEditor = ({ scheduleId, initialSheets, snapshot, editable, externals, onSaved }: Props) => {
  const {
    sheets, activeIndex, activeSheet, previewCalc, isLoading, basicInfoForm,
    setActiveIndex, addSheet, removeSheet, updateActiveSheet, handleSave, handleBasicInfoChange,
    isExportDialogOpen, templateFile, isExporting,
    setExportDialogOpen, handleSelectTemplate, handleExport,
  } = useSaveSheets({
    scheduleId, initialSheets,
    basicInfo: snapshot?.basicInfo ?? null,
    // 채취자 표기명은 team 스냅샷 소관이라 함께 넘긴다.
    team: snapshot?.team ?? null,
    editable, externals, onSaved,
  });

  const [newCategory, setNewCategory] = useState<MeasurementCategory>("GAS");
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {sheets.map((sheet, index) => (
            <div
              key={index}
              className={`flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                index === activeIndex
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <button type="button" onClick={() => setActiveIndex(index)}>
                {MEASUREMENT_CATEGORY_LABEL[sheet.category]}
              </button>
              {editable && (
                <button type="button" onClick={() => removeSheet(index)} className="text-muted-foreground hover:text-destructive">
                  <X size={13} />
                </button>
              )}
            </div>
          ))}
          {sheets.length === 0 && (
            <span className="text-sm text-muted-foreground">등록된 기록지가 없습니다.</span>
          )}
        </div>

        {editable && (
          <div className="flex items-center gap-2">
            <Select
              className="w-32"
              value={newCategory}
              options={measurementCategoryOptions}
              onValueChange={(v) => setNewCategory((v ?? "GAS") as MeasurementCategory)}
            />
            <Button type="button" variant="outline" size="sm" onClick={() => addSheet(newCategory)}>
              <Plus size={14} className="mr-1" />기록지 추가
            </Button>
          </div>
        )}
      </div>
      <Divider />

      {/* 측정계획 단위 공통 값이므로 시트 탭 바깥에 둔다(시트 전환·시트 0개와 무관하게 유지). */}
      <BasicInfoFields
        basicInfoForm={basicInfoForm}
        editable={editable}
        onChange={handleBasicInfoChange}
      />

      {activeSheet ? (
        <>
          <div className="flex justify-end">
            <Button type="button" variant="outline" size="sm" onClick={() => setPreviewOpen(true)}>
              <Eye size={14} className="mr-1" />기록지 미리보기
            </Button>
          </div>

          <SheetFormView
            key={activeIndex}
            sheet={activeSheet}
            previewCalc={previewCalc}
            externals={externals}
            editable={editable}
            onChange={updateActiveSheet}
          />
          {/* 시트가 0개면 이 버튼이 없어 공통 채취시간만 단독 저장할 수는 없다.
              시트 0개로 PUT /sheets를 보내면 전체 시트 삭제가 되므로 현 구조를 유지한다. */}
          {editable && (
            <div className="flex justify-end gap-2 pt-2">
              {/* 서버는 "저장된" 데이터로 엑셀을 채우므로 다운로드는 항상 저장을 먼저 수행한다. */}
              <Button
                type="button"
                variant="outline"
                onClick={() => setExportDialogOpen(true)}
                disabled={isLoading || scheduleId == null}
              >
                <Download size={14} className="mr-1" />저장 후 채취기록지 다운로드
              </Button>
              <Button type="button" onClick={handleSave} disabled={isLoading || scheduleId == null}>
                {isLoading ? "저장 중..." : "측정 데이터 저장"}
              </Button>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8">
          {editable ? "기록지를 추가하여 측정 데이터를 입력하세요." : "입력된 측정 데이터가 없습니다."}
        </p>
      )}

      {!editable && (
        <p className="text-xs text-muted-foreground">
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
        templateFile={templateFile}
        isLoading={isExporting}
        onSelectTemplate={handleSelectTemplate}
        onSubmit={handleExport}
      />
    </div>
  );
};
