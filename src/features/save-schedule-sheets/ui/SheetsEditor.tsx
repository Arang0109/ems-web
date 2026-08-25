import { useMemo, useState } from "react";
import { Calculator, FileCheck, History, Plus, Save, X } from "lucide-react";

import type { ScheduleSnapshot, SheetCalcExternals } from "@entities/schedule";
import { measurementCategoryOptions } from "@shared/model";
import type { FieldTone, MeasurementCategory, ScheduleStatus } from "@shared/model";
import { MEASUREMENT_CATEGORY_LABEL } from "@shared/config";
import { Select } from "@shared/ui/form";
import { Button } from "@shared/ui/buttons";
import { useConfirm, useUnsavedChangesGuard } from "@shared/ui/dialogs";
import { StickyActionBar } from "@shared/ui/layout";

import { buildSamplingTimeline } from "../model/sampling-timeline";
import { getMissingRequiredFields } from "../model/required-fields";
import type { SheetFieldPath } from "../model/required-fields";
import { getVisibleSections } from "../model/section-progress";
import { isParticleCategory } from "../model/types";
import { useSaveSheets } from "../model/hooks/use-save-sheets";
import { useBorrowedFields } from "../model/hooks/use-borrowed-fields";
import { useLoadPreviousSheet } from "../model/hooks/use-load-previous-sheet";
import type { SheetFieldState } from "./sheet-field-state";
import { BasicInfoSection } from "./BasicInfoSection";
import { SheetFormView } from "./SheetFormView";
import { LoadPreviousSheetDialog } from "./LoadPreviousSheetDialog";
import { SamplingTimelinePopover } from "./timeline/SamplingTimelinePopover";
import { ReportPreviewModal } from "./report/ReportPreviewModal";
import { ExportSamplingRecordsModal } from "./ExportSamplingRecordsModal";

interface Props {
  scheduleId: number | null;
  snapshot: ScheduleSnapshot | null;    // 기록지 미리보기용 (업체·시설·팀 정보)
  // 저장 전후 상태 비교용. 응답 최상위(메타)의 상태이며, 스냅샷의 사본을 쓰지 않는다.
  status: ScheduleStatus | null;
  editable: boolean;
  externals: SheetCalcExternals;
  onSaved?: () => void;
}

export const SheetsEditor = ({ scheduleId, snapshot, status, editable, externals, onSaved }: Props) => {
  const {
    sheets, addSheet, removeSheet, previewCalc,
    activeSheet, updateActiveSheet, activeIndex, setActiveIndex,
    basicInfoForm, handleBasicInfoChange,
    handleSave, isDirty,
    isExportDialogOpen, samplingRecordTemplate, isExporting,
    setExportDialogOpen, handleExport,
    isLoading, updatedSections, assignedPollutants, showMissing,
  } = useSaveSheets({ scheduleId, snapshot, status, externals, onSaved, });

  const borrowed = useBorrowedFields(activeSheet);

  const {
    handleOpenPrevious, handleSelectPrevious, candidates,
    isPickerOpen, setPickerOpen, isLoadingCandidates, isLoadingSheet, loadedKey,
  } = useLoadPreviousSheet({
    scheduleId, activeSheet, updateActiveSheet, onLoaded: borrowed.mark,
  });

  const [newCategory, setNewCategory] = useState<MeasurementCategory>("GAS");
  const [previewOpen, setPreviewOpen] = useState(false);
  // 계산값 드로어의 입구는 액션 바에 있고 표면은 SheetFormView 가 그린다 —
  // 그쪽이 배출가스 노출 판정·노즐 추정치를 이미 들고 있어 열림 상태만 위로 올린다.
  const [calcDrawerOpen, setCalcDrawerOpen] = useState(false);

  // 타임라인은 측정계획 단위 총 채취시간과 활성 시트의 시각을 함께 봐야 한다.
  // 둘을 다 쥐고 있는 곳이 여기뿐이라 이 컴포넌트가 소유한다.
  const timeline = useMemo(
    () =>
      activeSheet
        ? buildSamplingTimeline({ basicInfo: basicInfoForm, sheet: activeSheet, previewCalc })
        : null,
    [basicInfoForm, activeSheet, previewCalc],
  );

  const confirm = useConfirm();

  /**
   * 저장을 한 번 누른 뒤에만 채워지는 "비어 있는 필수 칸" 집합.
   * 화면을 처음 열었을 때부터 빨강을 칠하면 새 기록지가 통째로 붉어져 경고가 무뎌진다.
   */
  const missingPaths = useMemo<ReadonlySet<SheetFieldPath>>(() => {
    if (!showMissing || !activeSheet) return new Set();

    return new Set(
      getVisibleSections(isParticleCategory(activeSheet.category)).flatMap((section) =>
        getMissingRequiredFields(activeSheet, section.id, assignedPollutants),
      ),
    );
  }, [showMissing, activeSheet, assignedPollutants]);

  /**
   * 칸 하나의 색. **불러온 값이 미입력보다 앞선다** — 값이 들어 있는 칸이므로
   * 애초에 미입력으로 잡히지 않지만, 순서를 명시해 두 판정이 겹칠 여지를 없앤다.
   */
  const fieldState: SheetFieldState = {
    fieldTone: (path): FieldTone =>
      borrowed.isBorrowed(path) ? "info" : missingPaths.has(path) ? "danger" : "default",
    onFieldFocus: borrowed.acknowledge,
    borrowedCountOf: borrowed.borrowedCountOf,
    onAcknowledgeSection: borrowed.acknowledgeSection,
    showMissing,
  };

  // 현장에서 한참 입력한 기록지가 뒤로가기 한 번에 날아가지 않도록 이탈을 붙잡는다.
  // (탭 전환은 라우팅이 아니라 막히지 않는다 — 측정정보·측정장비 탭을 오가도 입력은 남는다.)
  useUnsavedChangesGuard({
    when: editable && isDirty,
    title: "저장하지 않은 측정 데이터가 있습니다",
    description: "지금 나가면 입력한 측정 데이터가 사라집니다.\n정말 나가시겠습니까?",
  });

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
          showMissing={showMissing}
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
        <div className="space-y-3">
          {/* 같은 시설이라도 회차마다 쓰는 기록지가 다르므로 계획을 만들 때 미리 채워 둘 수 없다.
              기록지를 추가한 뒤 여기서 직접 불러온다. 불러오기는 화면만 채우고 저장하지 않는다.
              어느 회차에서 가져올지는 목록에서 고른다 — 최근 회차가 늘 좋은 출발점은 아니다. */}
          {editable && (
            <div className="flex flex-wrap items-center justify-end gap-2">
              {/* 불러온 값이 남아 있는 동안만 뜬다. 칸을 확인할수록 개수가 줄고 0 이 되면 사라진다. */}
              {borrowed.borrowedCount > 0 && (
                <div
                  className="flex flex-1 flex-wrap items-center justify-between gap-2 rounded-icon-tile
                    border border-info bg-info-soft px-3 py-2 text-body-3 text-info-ink"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <History size={15} aria-hidden />
                    {borrowed.sourceLabel} 기록에서 불러온 값 {borrowed.borrowedCount}개
                  </span>
                  <Button type="button" variant="outline" size="sm" onClick={borrowed.acknowledgeAll}>
                    모두 확인
                  </Button>
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={handleOpenPrevious}
                disabled={isLoadingCandidates || scheduleId == null}
              >
                <History size={17} />
                {isLoadingCandidates ? "불러오는 중..." : "이전 기록 불러오기"}
              </Button>
            </div>
          )}

          <SheetFormView
            // 인덱스만으로는 부족하다 — 다른 사용자가 앞쪽 기록지를 지우면 같은 인덱스가 다른 기록지를
            // 가리키게 되는데, 그때 리마운트되지 않으면 배출가스 입력칸 노출 판정 같은 내부 상태가
            // 이전 기록지 것으로 남는다. 카테고리는 중복 추가가 가능하므로 인덱스와 함께 쓴다.
            // 이전 기록 불러오기도 같은 이유로 key 를 바꾼다 — 인덱스·카테고리는 그대로인데
            // 내용만 통째로 갈리므로, loadedKey 가 없으면 노출 판정이 불러오기 전 값으로 남는다.
            key={`${activeIndex}-${activeSheet.category}-${loadedKey}`}
            sheet={activeSheet}
            previewCalc={previewCalc}
            externals={externals}
            assignedPollutants={assignedPollutants}
            fieldState={fieldState}
            editable={editable}
            updatedSections={updatedSections[activeSheet.category]}
            calcDrawerOpen={calcDrawerOpen}
            onCalcDrawerOpenChange={setCalcDrawerOpen}
            onChange={updateActiveSheet}
          />

          <LoadPreviousSheetDialog
            open={isPickerOpen}
            onOpenChange={setPickerOpen}
            category={activeSheet.category}
            candidates={candidates}
            isLoading={isLoadingSheet}
            onSelect={handleSelectPrevious}
          />
        </div>
      ) : (
        <p className="py-8 text-center text-body-3 text-muted-ink">
          {editable ? "기록지를 추가하여 측정 데이터를 입력하세요." : "입력된 측정 데이터가 없습니다."}
        </p>
      )}

      {/* 기록지가 0개여도 미저장 변경이 있으면 액션 바를 남긴다 — 마지막 기록지를 지운 뒤
          저장할 수단이 없으면 삭제가 서버에 반영되지 않는다(삭제는 저장 시 함께 전송된다). */}
      {(activeSheet || isDirty) && (
        /* 읽기 액션(시간 확인·미리보기)을 왼쪽에, 쓰기 액션(다운로드·저장)을 오른쪽에 묶는다 */
        <StickyActionBar className="rounded-t-panel flex items-center justify-center">
          {timeline && <SamplingTimelinePopover timeline={timeline} />}

          {/* 계산 결과는 섹션 폼에 흩어 두지 않고 이 드로어 한 곳에서 본다 */}
          <Button
            type="button"
            variant="outline"
            aria-label="계산값 보기"
            onClick={() => setCalcDrawerOpen(true)}
          >
            <Calculator size={19} />계산
          </Button>

          <Button type="button" variant="soft" onClick={() => setPreviewOpen(true)}>
            <FileCheck size={19} />미리보기
          </Button>
          {editable && (
            <>
              {/* 미저장 변경이 있으면 앰버, 저장된 상태면 브랜드 초록 — 현장에서 저장 여부를 색으로 판별한다. */}
              <Button
                type="button"
                variant={isDirty ? "warning" : "default"}
                onClick={() => { void handleSave(); }}
                disabled={isLoading || scheduleId == null}
              >
                <Save size={19} />
                {isLoading ? "저장 중..." : "저장"}
              </Button>
            </>
          )}
        </StickyActionBar>
      )}

      {!editable && (
        <p className="text-caption text-muted-ink">
          완료 또는 취소된 측정계획은 측정 데이터를 수정할 수 없습니다.
        </p>
      )}

      <ReportPreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        sheets={sheets}
        activeIndex={activeIndex}
        onActiveIndexChange={setActiveIndex}
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
