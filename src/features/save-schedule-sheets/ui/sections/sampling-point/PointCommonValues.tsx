import { UnitField, CalcResultRow } from "@shared/ui/form";

import { PARTICLE_HINT } from "../../../model/field-hints";
import { fieldPath } from "../../../model/required-fields";
import type { ParticleForm } from "../../../model/types";
import { FIELD_GRID, type FieldStateProps } from "../shell-props";

interface Props extends FieldStateProps {
  particle: ParticleForm;
  editable: boolean;
  onParticleChange: (patch: Partial<ParticleForm>) => void;
}

/**
 * 공통 값 — 지점과 무관한 시트 단위 **입력**. 입자상 기록지에만 있다.
 * 지점 카드보다 먼저 채우는 순서라 섹션 맨 위에 온다.
 *
 * 노즐 선택과 계산 결과(자동계산·실측 평균·산정 예상치)는 여기 두지 않는다 —
 * 액션 바의 `계산값` 이 여는 `SheetCalcDrawer` 가 소유한다.
 */
export const PointCommonValues = ({
  particle, editable, onParticleChange, fieldTone, onFieldFocus,
}: Props) => (
  <div className={FIELD_GRID}>
    {/* 종료시각은 시작시각 + Σ채취시간으로 자동 계산되므로 입력창 없이 보조 행으로 붙인다. */}
    <UnitField
      label="입자상 물질 채취 시작시각" type="time"
      hint={PARTICLE_HINT.samplingStartTime}
      value={particle.samplingStartTime} disabled={!editable}
      tone={fieldTone(fieldPath.particle("samplingStartTime"))}
      onFocus={() => onFieldFocus(fieldPath.particle("samplingStartTime"))}
      onChange={(v) => onParticleChange({ samplingStartTime: v })}
      helper={<CalcResultRow label="채취 종료시각" value={particle.samplingEndTime || "-"} />}
    />
  </div>
);
