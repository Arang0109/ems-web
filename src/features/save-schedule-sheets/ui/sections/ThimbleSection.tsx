import { SectionAccordion } from "@shared/ui/accordion";
import { TableLabelCell, TableInputCell } from "@shared/ui/table";

import type { ParticleForm } from "../../model/types";

interface Props {
  particle: ParticleForm;
  editable: boolean;
  onChange: (patch: Partial<ParticleForm>) => void;
}

// 원통여지 — 입자상 시트 전용 (측정여지번호 / 바탕여지번호)
export const ThimbleSection = ({ particle, editable, onChange }: Props) => (
  <SectionAccordion title="원통여지" defaultOpen>
    <div className="overflow-x-auto border-x border-b border-border rounded-b-lg">
      <table className="w-full border-collapse min-w-[480px]">
        <tbody>
          <tr>
            <TableLabelCell>측정여지번호</TableLabelCell>
            <TableInputCell value={particle.thimbleFilter}
              onChange={(v) => onChange({ thimbleFilter: v })} disabled={!editable} />
            <TableLabelCell>바탕여지번호</TableLabelCell>
            <TableInputCell value={particle.bgThimbleFilter}
              onChange={(v) => onChange({ bgThimbleFilter: v })} disabled={!editable} />
          </tr>
        </tbody>
      </table>
    </div>
  </SectionAccordion>
);
