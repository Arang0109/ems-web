import { Plus } from "lucide-react";

import type { SheetCalcPreview } from "@entities/schedule";
import { displayValue } from "@shared/lib";
import { SectionAccordion } from "@shared/ui/accordion";
import { Button } from "@shared/ui/buttons";

import type { ParticleForm, SamplingPointForm } from "../../../model/types";
import type { FieldStateProps, SectionShellProps } from "../shell-props";
import type { NozzleBasis } from "./NozzleBasisNote";
import { PointCards } from "./PointCards";
import { PointCommonValues } from "./PointCommonValues";
import { PointFlowTable } from "./PointFlowTable";
import { PointTable } from "./PointTable";
import { buildIsokineticGroup } from "./point-results";

interface Props extends SectionShellProps, FieldStateProps {
  isParticle: boolean;
  points: SamplingPointForm[];
  particle: ParticleForm;
  preview: SheetCalcPreview | null;
  /** 고른 노즐의 예상 채취시간·채취량 — 채취시간 입력 아래 기준선으로 붙는다 */
  nozzleBasis: NozzleBasis;
  editable: boolean;
  onPointChange: (index: number, patch: Partial<SamplingPointForm>) => void;
  onAddPoint: () => void;
  onRemovePoint: (index: number) => void;
  onCopyPreviousPoint: (index: number) => void;
  onParticleChange: (patch: Partial<ParticleForm>) => void;
}

/**
 * 측정점 정보.
 *
 * 입력은 현장의 기입 순서대로 세 덩이다.
 *
 * 1. 지점별 **배출가스 온도·동정압** (`PointFlowTable`, 행=지점·열=항목) — 모든 지점을 먼저 재고
 *    나서 채취를 시작하므로 맨 앞에 온다. 모든 카테고리가 입력한다.
 * 2. 지점과 무관한 **공통 값** (`PointCommonValues`, 채취 시작시각) — 입자상 전용.
 * 3. 지점별 **등속흡인 정보** — 입자상 전용. 표현만 둘로 갈린다: 지점별 카드(`PointCards`, 모바일)와
 *    행=항목·열=측정점인 전치 표(`PointTable`, md 이상). 다열 그리드로 펴면 "지점 간 값 비교" 라는
 *    이 표의 목적이 사라지기 때문이다.
 *
 * 지점 삭제는 1 의 표에서만 한다 — 지점 목록의 주인이 그 표다.
 * 표현들이 어긋나지 않도록 **항목 스펙은 `point-fields`, 파생값은 `point-results`** 한 곳에서만 온다.
 */
export const SamplingPointSection = ({
  isParticle, points, particle, preview, nozzleBasis, editable,
  onPointChange, onAddPoint, onRemovePoint, onCopyPreviousPoint,
  onParticleChange, fieldTone, onFieldFocus,
  ...shell
}: Props) => {
  const fieldState = { fieldTone, onFieldFocus };

  return (
    <SectionAccordion
      {...shell}
      title="측정점 정보"
      subtitle="지점별 측정값을 입력하면 주요 계산값이 자동 산출됩니다."
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-col text-body-3">
          <p className="flex items-center gap-1 text-body-3 text-ink">
            연도 단면적 <span className="text-body-4 text-brand-primary">{displayValue(preview?.quantity?.area)}</span>m³
          </p>
          <p className="flex items-center gap-1 text-body-3 text-ink">
            규정 요구 측정점 수 <span className="text-body-4 text-brand-primary">{displayValue(preview?.samplingPointCnt)}</span>
          </p>
        </div>
        {editable && (
          <Button type="button" variant="outline" size="sm" onClick={onAddPoint}>
            <Plus size={14} />측정점 추가
          </Button>
        )}
      </div>

      <PointFlowTable
        {...fieldState}
        points={points}
        editable={editable}
        onPointChange={onPointChange}
        onRemovePoint={onRemovePoint}
      />

      {/* 채취 시작시각과 등속흡인 정보는 입자상 기록지에만 있다 */}
      {isParticle && (
        <>
          <PointCommonValues
            {...fieldState}
            particle={particle}
            editable={editable}
            onParticleChange={onParticleChange}
          />

          <PointCards
            {...fieldState}
            points={points}
            preview={preview}
            nozzleBasis={nozzleBasis}
            editable={editable}
            onPointChange={onPointChange}
            onCopyPreviousPoint={onCopyPreviousPoint}
          />

          <PointTable
            {...fieldState}
            points={points}
            preview={preview}
            groups={[buildIsokineticGroup(preview)]}
            nozzleBasis={nozzleBasis}
            editable={editable}
            onPointChange={onPointChange}
            onCopyPreviousPoint={onCopyPreviousPoint}
          />
        </>
      )}
    </SectionAccordion>
  );
};
