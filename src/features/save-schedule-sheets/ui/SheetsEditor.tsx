import { useMemo, useState } from "react";
import { Calculator, FileCheck, History, Save } from "lucide-react";

import { cn } from "@/lib/utils";

import type { ScheduleDetail, ScheduleSnapshot, SheetCalcExternals } from "@entities/schedule";
import type { FieldTone, MeasurementCategory, ScheduleStatus } from "@shared/model";
import { MEASUREMENT_CATEGORY_LABEL } from "@shared/config";
import { Button } from "@shared/ui/buttons";
import { useConfirm, useUnsavedChangesGuard } from "@shared/ui/dialogs";
import { StickyActionBar } from "@shared/ui/layout";
import { ChipNav } from "@shared/ui/nav";
import { Callout, EmptyText } from "@shared/ui/feedback";

import { getMissingRequiredFields } from "../model/input/required-fields";
import type { SheetFieldPath } from "../model/input/required-fields";
import { BASIC_INFO_SECTION, getVisibleSections } from "../model/sections";
import type { EditorSectionId } from "../model/sections";
import { isParticleCategory } from "../model/types";
import { useSaveSheets } from "../model/hooks/use-save-sheets";
import { useBorrowedFields } from "../model/hooks/use-borrowed-fields";
import { useLoadPreviousSheet } from "../model/hooks/use-load-previous-sheet";
import { sectionDomId, useSectionNav } from "../model/hooks/use-section-nav";
import { useSyncCommonSections } from "../model/hooks/use-sync-common-sections";
import { useSamplingTimeline } from "../model/hooks/use-sampling-timeline";
import type { SheetFieldState } from "./sheet-field-state";
import { BasicInfoSection } from "./BasicInfoSection";
import { SheetFormView } from "./SheetFormView";
import { LoadPreviousSheetDialog } from "./LoadPreviousSheetDialog";
import { SheetSelect } from "./SheetSelect";
import { SyncCommonSectionsPrompt } from "./SyncCommonSectionsPrompt";
import { ACTION_BAR_CLASS, ACTION_TILE_CLASS, ACTION_TILE_ICON_CLASS } from "./action-bar";
import { SamplingTimelinePopover } from "./timeline/SamplingTimelinePopover";
import { ReportPreviewModal } from "./report/ReportPreviewModal";
import { ExportSamplingRecordsModal } from "./ExportSamplingRecordsModal";

interface Props {
  scheduleId: number | null;
  schedule: ScheduleDetail | null;      // 기록지 미리보기용 계획 메타 (관리번호·채취일자)
  snapshot: ScheduleSnapshot | null;    // 기록지 미리보기용 (업체·시설·팀 정보)
  // 저장 전후 상태 비교용. 응답 최상위(메타)의 상태이며, 스냅샷의 사본을 쓰지 않는다.
  status: ScheduleStatus | null;
  editable: boolean;
  externals: SheetCalcExternals;
  onSaved?: () => void;
  /**
   * 기록지·섹션 바로가기 바의 sticky 위치 — 이 편집기 위에 고정된 헤더가 있으면 그 높이만큼 내린다.
   * 화면 셸(헤더·탭 높이)은 이 편집기를 놓는 쪽이 알기 때문에 밖에서 받는다. 기본은 `top-0`.
   */
  navStickyClassName?: string;
  /**
   * 섹션 바로가기로 이동했을 때 섹션 카드가 고정 헤더들 밑에 가리지 않도록 주는 scroll-margin.
   * 섹션 카드에 걸리도록 arbitrary variant 로 넘긴다 (예: `[&_[id^=sheet-section-]]:scroll-mt-48`).
   * 기본은 바로가기 바 높이만큼(`scroll-mt-16`).
   */
  sectionScrollMarginClassName?: string;
}

export const SheetsEditor = ({
  scheduleId, schedule, snapshot, status, editable, externals, onSaved,
  navStickyClassName = "top-0",
  sectionScrollMarginClassName = "[&_[id^=sheet-section-]]:scroll-mt-16",
}: Props) => {
  const {
    sheets, addSheet, removeSheet, previewCalc,
    activeSheet, updateActiveSheet, activeIndex, setActiveIndex,
    basicInfoForm, handleBasicInfoChange,
    handleSave, isDirty,
    isExportDialogOpen, samplingRecordTemplate, isExporting,
    setExportDialogOpen, handleExport,
    isLoading, updatedSections, assignedPollutants, unassignedGroups, unresolvedItems, sampleRules, showMissing,
  } = useSaveSheets({ scheduleId, snapshot, status, externals, onSaved, });

  const borrowed = useBorrowedFields(activeSheet);

  const {
    handleOpenPrevious, handleSelectPrevious, candidates,
    isPickerOpen, setPickerOpen, isLoadingCandidates, isLoadingSheet, loadedKey,
  } = useLoadPreviousSheet({
    scheduleId, activeSheet, updateActiveSheet, onLoaded: borrowed.mark,
  });

  const [previewOpen, setPreviewOpen] = useState(false);
  // 계산값 드로어의 입구는 액션 바에 있고 표면은 SheetFormView 가 그린다 —
  // 그쪽이 배출가스 노출 판정·노즐 추정치를 이미 들고 있어 열림 상태만 위로 올린다.
  const [calcDrawerOpen, setCalcDrawerOpen] = useState(false);

  // 섹션 바로가기는 공통 정보와 활성 기록지의 섹션을 한 줄에 놓는다 —
  // 공통 정보를 뺀 채 위에서 시작하면, 스크롤을 내린 뒤 총 채취시간으로 돌아갈 길이 없다.
  const nav = useSectionNav();
  const navItems = useMemo(
    () => (activeSheet
      ? [BASIC_INFO_SECTION, ...getVisibleSections(isParticleCategory(activeSheet.category))]
      : []),
    [activeSheet],
  );

  // 타임라인은 측정계획 단위 총 채취시간 안에 모든 기록지의 시각을 함께 봐야 한다 —
  // 기록지를 바꿔도 같은 흐름이 보여야 한다. 둘을 다 쥐고 있는 곳이 여기뿐이라 이 컴포넌트가 소유한다.
  const timelines = useSamplingTimeline({
    basicInfo: basicInfoForm, sheets, activeSheet, activePreviewCalc: previewCalc, externals,
  });

  const confirm = useConfirm();

  // 기록지를 추가하면 기상·수분·배출가스·측정점 온도·동정압은 앞 기록지와 같은 값이다 — 다시 적지 않고 가져온다.
  const {
    canSync, sourceLabel: syncSourceLabel, hasValues: hasCommonValues, handleSyncCommonSections, syncedKey,
  } = useSyncCommonSections({
    sheets, activeIndex, updateActiveSheet, confirm,
  });

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
    <div className={cn("space-y-4", sectionScrollMarginClassName)}>
      {/* 기록지 셀렉트(전환·삭제·추가) + 섹션 바로가기 — 스크롤해도 상단에 붙어 있다.
          -mx-4 px-4 : 모바일은 레이아웃 좌우 여백을 넘어 전폭 흰 바로 깐다 (MO 시안). */}
      <div
        className={cn(
          "sticky z-10 -mx-4 flex items-center gap-2 border-b border-rule bg-surface px-4 py-2.5",
          "md:mx-0 md:border-0 md:bg-canvas md:px-0 md:py-2",
          navStickyClassName,
        )}
      >
        <SheetSelect
          sheets={sheets.map((sheet) => sheet.category)}
          activeIndex={activeIndex}
          editable={editable}
          onSelect={setActiveIndex}
          onAdd={addSheet}
          onRemove={(index, category) => { void handleRemoveSheet(index, category); }}
        />
        <ChipNav
          ariaLabel="입력 섹션 바로가기"
          className="min-w-0 flex-1"
          items={navItems}
          activeId={nav.activeSectionId}
          onSelect={(id) => nav.goToSection(id as EditorSectionId)}
        />
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
                <Callout
                  tone="info"
                  icon={History}
                  className="flex-1"
                  action={
                    <Button type="button" variant="outline" size="sm" onClick={borrowed.acknowledgeAll}>
                      모두 확인
                    </Button>
                  }
                >
                  {borrowed.sourceLabel} 기록에서 불러온 값 {borrowed.borrowedCount}개
                </Callout>
              )}

              {/* 피그마 MO 시안: 연한 브랜드 면 + 브랜드 테두리 · 코너 11 · 높이 42, 모바일은 맨 위 전폭. */}
              <Button
                variant="soft"
                startIcon={History}
                onClick={handleOpenPrevious}
                disabled={isLoadingCandidates || scheduleId == null}
                className="order-first h-10.5 w-full gap-1 rounded-panel border-brand-primary px-3.25 text-brand-primary
                  md:order-none md:w-auto"
              >
                {isLoadingCandidates ? "불러오는 중..." : "이전 회차 기록 불러오기"}
              </Button>
            </div>
          )}

          {/* 같은 회차 앞 기록지의 공통 값 채우기 — 지난 회차 불러오기와 성격이 달라 버튼 줄과 떼어 둔다.
              첫 기록지에는 가져올 곳이 없어 숨긴다. */}
          {editable && canSync && (
            <SyncCommonSectionsPrompt
              sourceLabel={syncSourceLabel}
              hasValues={hasCommonValues}
              onSync={() => { void handleSyncCommonSections(); }}
            />
          )}

          {/* 측정계획 단위 공통 값 — 기록지 전환과 무관하게 같은 폼을 보여준다.
              기록지 안쪽(SheetFormView)에 두지 않는 것은 그쪽이 기록지마다 리마운트되기 때문이다. */}
          <BasicInfoSection
            id={sectionDomId(BASIC_INFO_SECTION.id)}
            basicInfoForm={basicInfoForm}
            editable={editable}
            showMissing={showMissing}
            open={nav.isOpen(BASIC_INFO_SECTION.id)}
            onOpenChange={(open) => nav.setSectionOpen(BASIC_INFO_SECTION.id, open)}
            onChange={handleBasicInfoChange}
          />
          <SheetFormView
            // 기록지는 카테고리당 한 장이라 카테고리가 곧 식별자다. 인덱스로 키를 잡으면
            // 다른 사용자가 앞쪽 기록지를 지웠을 때 같은 인덱스가 다른 기록지를 가리키는데,
            // 그때 리마운트되지 않으면 배출가스 입력칸 노출 판정 같은 내부 상태가 이전 기록지 것으로 남는다.
            // 이전 회차 불러오기·앞 기록지 값 채우기도 같은 이유로 key 를 바꾼다 — 카테고리는 그대로인데
            // 내용만 통째로 갈리므로, loadedKey 가 없으면 노출 판정이 불러오기 전 값으로 남는다.
            key={`${activeSheet.category}-${loadedKey}-${syncedKey}`}
            sheet={activeSheet}
            previewCalc={previewCalc}
            externals={externals}
            assignedPollutants={assignedPollutants}
            unassignedGroups={unassignedGroups}
            sampleRules={sampleRules}
            unresolvedItemNames={unresolvedItems.map((item) => item.nameKr)}
            fieldState={fieldState}
            editable={editable}
            updatedSections={updatedSections[activeSheet.category]}
            calcDrawerOpen={calcDrawerOpen}
            onCalcDrawerOpenChange={setCalcDrawerOpen}
            nav={nav}
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
        <EmptyText>
          {editable ? "기록지를 추가하여 측정 데이터를 입력하세요." : "입력된 측정 데이터가 없습니다."}
        </EmptyText>
      )}

      {/* 기록지가 0개여도 미저장 변경이 있으면 액션 바를 남긴다 — 마지막 기록지를 지운 뒤
          저장할 수단이 없으면 삭제가 서버에 반영되지 않는다(삭제는 저장 시 함께 전송된다). */}
      {(activeSheet || isDirty) && (
        /* 읽기 액션(시간 확인·미리보기)을 왼쪽에, 쓰기 액션(다운로드·저장)을 오른쪽에 묶는다 */
        <StickyActionBar className={ACTION_BAR_CLASS}>
          {timelines && (
            <SamplingTimelinePopover timeline={timelines.timeline} temperatures={timelines.temperatures} />
          )}

          {/* 계산 결과는 섹션 폼에 흩어 두지 않고 이 드로어 한 곳에서 본다 */}
          <Button
            type="button"
            variant="outline"
            aria-label="계산값 보기"
            className={ACTION_TILE_CLASS}
            onClick={() => setCalcDrawerOpen(true)}
          >
            <Calculator className={ACTION_TILE_ICON_CLASS} />계산
          </Button>

          <Button type="button" variant="soft" className={ACTION_TILE_CLASS} onClick={() => setPreviewOpen(true)}>
            <FileCheck className={ACTION_TILE_ICON_CLASS} />미리보기
          </Button>
          {editable && (
            <>
              {/* 미저장 변경이 있으면 앰버, 저장된 상태면 브랜드 초록 — 현장에서 저장 여부를 색으로 판별한다. */}
              <Button
                type="button"
                variant={isDirty ? "warning" : "default"}
                className={ACTION_TILE_CLASS}
                onClick={() => { void handleSave(); }}
                disabled={isLoading || scheduleId == null}
              >
                <Save className={ACTION_TILE_ICON_CLASS} />
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
        schedule={schedule}
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
