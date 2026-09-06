import { ArrowDown, ArrowUp, Download } from "lucide-react";

import type { ScheduleSnapshot } from "@entities/schedule";
import { ExportReportModal, useExportReport } from "@features/export-schedule-report";
import { useReorderScheduleItems } from "@features/update-schedule-items";
import { SectionAccordion } from "@shared/ui/accordion";
import { Button, IconButton } from "@shared/ui/buttons";
import { EmptyText } from "@shared/ui/feedback";
import { StickyActionBar } from "@shared/ui/layout";
import { DragHandle, SortableList, type SortableControls } from "@shared/ui/sortable";

import { toReportItems } from "../../model/mapper";
import type { ReportItem } from "../../model/types";

interface Props {
  scheduleId: number;
  snapshot: ScheduleSnapshot;
  editable: boolean;
  onRefetch: () => void;
}

/**
 * 성적서 탭.
 *
 * 성적서 양식은 기록부 한 장에 실을 수 있는 측정항목 수가 정해져 있고(대기측정기록부 4개),
 * 양식이 `items[0]`~`items[3]` 처럼 인덱스로 칸을 지목한다. 그래서 **항목 순서가 곧 지면 배치**이며,
 * 여기서 정한 순서가 그대로 저장돼 내보내기에 쓰인다.
 *
 * 탭이 다루는 것은 그 순서와 내보내기 둘뿐이다. 항목별 채취시간은 실험·분석 탭의 분석 결과 표로
 * 옮겼다 — 서버에서 채취시각과 분석값은 항목당 한 문서의 다른 칸이라, 화면을 나눠 두면 같은 행을
 * 두 탭에서 따로 열고 같은 목록을 두 번 조회하게 된다.
 */
export const ReportInfo = ({ scheduleId, snapshot, editable, onRefetch }: Props) => {
  const standardOxygen = snapshot.client.workplace.stack.standardOxygen;

  // 순서는 성적서의 지면 배치를 좌우하므로 낙관적으로 즉시 반영하고 바로 저장한다
  const { items, handleReorder } = useReorderScheduleItems({
    scheduleId,
    items: snapshot.items,
    onRefetch,
  });

  const rows = toReportItems(items, standardOxygen);

  // 하나뿐이면 순위도 순서 조작도 의미가 없다. 완료·취소된 계획은 순서를 바꿀 수 없다.
  const isSortable = editable && rows.length > 1;

  // 완료된 계획의 문서를 다시 받는 것은 정상 동작이라 내보내기는 editable 과 무관하게 열어 둔다.
  // 성적서 export 가 아직 쓰이지 않아 이 버튼도 당분간 채취기록부 export 를 탄다(useExportReport 참고).
  const { isDialogOpen, isExporting, template, setIsDialogOpen, handleExport } =
    useExportReport({ scheduleId });

  const renderRow = (item: ReportItem, controls: SortableControls | null) => (
    <div className="flex items-center gap-2 rounded-panel border border-rule-dark bg-surface px-3 py-2.5">
      {controls && (
        <>
          <DragHandle handleProps={controls.handleProps} label={`${item.name} 순서 변경 손잡이`} />
          <span className="w-4 text-center text-caption text-ink-soft tabular-nums">
            {controls.index + 1}
          </span>
        </>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-body-1 text-ink">{item.name}</p>
        <p className="text-caption text-brand-dark">
          허용기준 : {item.allowance}
          {item.oxygenApplicable && <span> ({item.standardOxygen})</span>}
        </p>
      </div>

      {controls && (
        <>
          <IconButton
            icon={<ArrowUp size={16} />}
            label={`${item.name} 위로 이동`}
            variant="ghost"
            size="icon-sm"
            disabled={controls.isFirst}
            onClick={controls.moveUp}
          />
          <IconButton
            icon={<ArrowDown size={16} />}
            label={`${item.name} 아래로 이동`}
            variant="ghost"
            size="icon-sm"
            disabled={controls.isLast}
            onClick={controls.moveDown}
          />
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <SectionAccordion
        title="성적서 측정항목"
        subtitle={<span className="text-body-4 text-brand-dark">{rows.length}개</span>}
        description="여기서 정한 순서대로 성적서 양식의 측정항목 칸이 채워집니다. 양식 한 장에 담기는 칸 수를 넘는 항목은 다음 장으로 넘어갑니다."
        defaultOpen
      >
        {rows.length === 0 ? (
          <EmptyText>이번 계획에 담긴 측정항목이 없습니다.</EmptyText>
        ) : isSortable ? (
          <SortableList
            items={rows}
            onReorder={handleReorder}
            className="space-y-2"
            renderOverlay={(item) => (
              <div className="rounded-icon-tile bg-canvas px-3 py-2.5 text-body-4 text-ink shadow-lg ring-1 ring-rule md:px-4">
                {item.name}
              </div>
            )}
            renderItem={renderRow}
          />
        ) : (
          <div className="space-y-2">
            {rows.map((item) => (
              <div key={item.id}>{renderRow(item, null)}</div>
            ))}
          </div>
        )}
      </SectionAccordion>

      {/* 현장 채취 탭과 같은 자리에 둔다 — 섹션을 접거나 끝까지 스크롤해도 다운로드가 늘 손에 닿는다.
          모달은 액션 바 밖(탭 본문 최상위)에 둬 아코디언의 접힘 상태와 무관하게 살아 있게 한다. */}
      <StickyActionBar className="rounded-t-panel">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsDialogOpen(true)}
          disabled={isExporting}
        >
          <Download size={19} />
          {isExporting ? "생성 중..." : "채취기록부 다운로드"}
        </Button>
      </StickyActionBar>

      <ExportReportModal
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        template={template}
        isLoading={isExporting}
        onSubmit={handleExport}
      />
    </div>
  );
};
