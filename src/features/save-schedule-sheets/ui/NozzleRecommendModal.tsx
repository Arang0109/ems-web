import { useMemo, useState } from "react";

import type { SheetCalcExternals } from "@entities/schedule";
import { calcNozzleRecommendations } from "@entities/schedule";
import { toNumberOrNull } from "@shared/lib";
import { Input } from "@shared/ui/form";
import { FormDialog } from "@shared/ui/dialogs";

import type { SheetForm } from "../model/types";
import { toSheetSave } from "../model/mapper";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sheet: SheetForm;
  externals: SheetCalcExternals;
  onSelect: (nozzleSize: string) => void;
}

const display = (v: number | null): string => (v == null ? "-" : String(v));

// 적정 노즐사이즈 산정 — 희망 흡입량과 오리피스차압 허용범위로 노즐경 후보를 추천한다.
// 계산은 현재 시트 입력(수분량·배출가스·측정점 평균)을 기반으로 한 프론트 추정이다.
export const NozzleRecommendModal = ({ open, onOpenChange, sheet, externals, onSelect }: Props) => {
  const [vr, setVr] = useState("1");
  const [minDp, setMinDp] = useState(10);
  const [maxDp, setMaxDp] = useState(40);

  const recommendations = useMemo(
    () => (open ? calcNozzleRecommendations(toSheetSave(sheet), externals, toNumberOrNull(vr)) : []),
    [open, sheet, externals, vr],
  );

  // 오리피스차압이 허용범위 안에 드는 후보만 추천 목록에 노출한다.
  const filtered = recommendations.filter(
    (r) => r.orificeDp != null && r.orificeDp >= minDp && r.orificeDp <= maxDp,
  );

  const hasNozzles = externals.nozzleDiameters.length > 0;
  const calcReady = recommendations.some((r) => r.orificeDp != null);

  return (
    <FormDialog
      title="적정 노즐사이즈 산정"
      description="채취하고자 하는 흡입량과 오리피스차압 범위로 적정 노즐을 추천합니다."
      open={open}
      onOpenChange={onOpenChange}
      submitLabel=""
      cancelLabel="닫기"
    >
      <div className="space-y-5">
        <Input
          label="채취하고자 하는 흡입량 (m³)"
          type="number"
          value={vr}
          min={0}
          step={0.1}
          onChange={setVr}
        />

        <div className="space-y-2">
          <p className="text-body-4">오리피스 차압 범위 (mmH₂O)</p>
          <div className="flex items-center gap-3">
            <span className="text-caption text-muted-foreground w-14">최소 {minDp}</span>
            <input
              type="range" min={0} max={60} value={minDp}
              onChange={(e) => setMinDp(Math.min(Number(e.target.value), maxDp))}
              className="flex-1 accent-primary"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-caption text-muted-foreground w-14">최대 {maxDp}</span>
            <input
              type="range" min={0} max={60} value={maxDp}
              onChange={(e) => setMaxDp(Math.max(Number(e.target.value), minDp))}
              className="flex-1 accent-primary"
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-body-4">노즐 추천 목록 ({filtered.length}건)</p>

          {!hasNozzles && (
            <p className="text-body-2 text-muted-foreground py-2">
              배정된 노즐 장비의 노즐경 정보가 없습니다. 측정장비 탭에서 노즐을 배정해주세요.
            </p>
          )}
          {hasNozzles && !calcReady && (
            <p className="text-body-2 text-muted-foreground py-2">
              계산에 필요한 입력(대기압·수분량·배출가스 농도·측정점 온도/동압)이 부족합니다.
            </p>
          )}
          {hasNozzles && calcReady && filtered.length === 0 && (
            <p className="text-body-2 text-muted-foreground py-2">범위에 맞는 노즐이 없습니다. 차압 범위를 조정해주세요.</p>
          )}

          {filtered.map((r) => (
            <button
              key={r.nozzleSize}
              type="button"
              onClick={() => onSelect(String(r.nozzleSize))}
              className="w-full rounded-nav border border-border p-3 text-left transition-colors hover:border-primary hover:bg-primary/5"
            >
              <p className="text-body-4">노즐직경 {r.nozzleSize} cm</p>
              <p className="text-caption text-muted-foreground mt-1">
                오리피스차압 {display(r.orificeDp)} mmH₂O · 채취시간 {display(r.samplingTime)} 분 · 채취량 {display(r.Vm)} m³
              </p>
            </button>
          ))}
        </div>
      </div>
    </FormDialog>
  );
};
