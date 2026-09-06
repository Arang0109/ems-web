import { SectionAccordion } from "@shared/ui/accordion";
import { UnitField } from "@shared/ui/form";

import { THIMBLE_HINT } from "../../model/field-hints";
import { fieldPath } from "../../model/required-fields";
import type { ParticleForm } from "../../model/types";
import { FIELD_GRID, type FieldStateProps, type SectionShellProps } from "./shell-props";

interface Props extends SectionShellProps, FieldStateProps {
  particle: ParticleForm;
  editable: boolean;
  onParticleChange: (patch: Partial<ParticleForm>) => void;
}

// 원통여지 번호만 담는 섹션. 입자상 시트에서만 노출된다.
// (시료채취 입력은 모든 기록지가 쓰는 항목이라 "가스상 물질" 섹션으로 이관했다.)
export const ThimbleSection = ({
  particle, editable, onParticleChange, fieldTone, onFieldFocus, ...shell
}: Props) => (
  <SectionAccordion
    {...shell}
    title="여지"
    subtitle="채취에 사용한 원통여지 정보를 입력합니다."
  >
    <div className={FIELD_GRID}>
      <UnitField
        label="측정여지번호" required
        hint={THIMBLE_HINT.thimbleFilter}
        value={particle.thimbleFilter} disabled={!editable}
        tone={fieldTone(fieldPath.particle("thimbleFilter"))}
        onFocus={() => onFieldFocus(fieldPath.particle("thimbleFilter"))}
        onChange={(v) => onParticleChange({ thimbleFilter: v })}
      />
      <UnitField
        label="바탕여지번호" required
        hint={THIMBLE_HINT.bgThimbleFilter}
        value={particle.bgThimbleFilter} disabled={!editable}
        tone={fieldTone(fieldPath.particle("bgThimbleFilter"))}
        onFocus={() => onFieldFocus(fieldPath.particle("bgThimbleFilter"))}
        onChange={(v) => onParticleChange({ bgThimbleFilter: v })}
      />
    </div>
  </SectionAccordion>
);
