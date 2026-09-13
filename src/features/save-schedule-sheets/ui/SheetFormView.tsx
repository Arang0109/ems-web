import { useMemo, useState } from "react";
import { Check } from "lucide-react";

import type { SheetCalcExternals, SheetCalcPreview } from "@entities/schedule";
import { addMinutes } from "@shared/lib";
import type { SectionHighlight } from "@shared/ui/accordion";
import { Button } from "@shared/ui/buttons";
import { useRemountKey } from "@shared/model";

import type {
  SheetForm, WeatherForm, MoistureForm, ExhaustGasForm, GasColumnKey,
  SamplingPointForm, SampleForm, ParticleForm,
} from "../model/types";
import {
  getDefaultSampleForm,
  isParticleCategory,
} from "../model/types";
import { getProgressTone, getSectionProgress, type SheetSectionId } from "../model/section-progress";
import { sectionDomId, type SectionNav } from "../model/hooks/use-section-nav";
import { fieldPath, getMissingRequiredFields } from "../model/required-fields";
import type { AssignedPollutants, ExhaustGasVisibility } from "../model/measured-pollutants";
import { getExhaustGasVisibility, hasSavedExhaustGasValue } from "../model/measured-pollutants";
import {
  DEFAULT_TARGET_VOLUME, calcNozzleEstimates, findNozzleEstimate,
} from "../model/nozzle-estimate";
import { calcParticleSamplingMinutes } from "../model/derived-times";
import { appendPoint, applyPointPatch, copyPreviousPointValues } from "../model/point-chain";
import type { GasSampleGroup } from "../model/gaseous-rows";
import { toSampleForm } from "../model/gaseous-rows";
import { checkMoistureWeightGain } from "../model/validator";
import type { SheetFieldState } from "./sheet-field-state";
import { WeatherSection } from "./sections/WeatherSection";
import { MoistureSection } from "./sections/MoistureSection";
import { ExhaustGasSection } from "./sections/ExhaustGasSection";
import { SamplingPointSection } from "./sections/sampling-point";
import { SheetCalcDrawer } from "./calc";
import { ThimbleSection } from "./sections/ThimbleSection";
import { GaseousSection } from "./sections/GaseousSection";

interface Props {
  sheet: SheetForm;
  previewCalc: SheetCalcPreview | null;
  externals: SheetCalcExternals;
  /** 이 측정계획에 배정된 THC·NOx·SOx — 배출가스 섹션의 입력칸 노출을 결정한다 */
  assignedPollutants: AssignedPollutants;
  /** 칸 단위 강조(불러온 값·미입력 필수) — 판정 규칙은 SheetsEditor 가 소유한다 */
  fieldState: SheetFieldState;
  editable: boolean;
  /**
   * 아직 어느 기록지에도 적히지 않은 가스상 항목. 판정이 기록지 전체를 가로지르므로
   * 이 기록지가 아니라 **측정계획 단위**의 목록이다.
   */
  unassignedGroups: GasSampleGroup[];
  /** 카탈로그 투영값이 없어 자동으로 만들 수 없는 항목 — 수동 추가를 안내한다 */
  unresolvedItemNames: string[];
  /** 다른 사용자의 저장으로 방금 갱신된 섹션 — 어디가 바뀌었는지 짚어준다 */
  updatedSections?: SheetSectionId[];
  /** 계산값 드로어의 열림 상태 — 입구가 액션 바에 있어 SheetsEditor 가 소유한다 */
  calcDrawerOpen: boolean;
  onCalcDrawerOpenChange: (open: boolean) => void;
  /** 섹션 펼침 상태 — 바로가기가 공통 정보까지 가리키므로 SheetsEditor 가 소유한다 */
  nav: Pick<SectionNav, "isOpen" | "setSectionOpen">;
  onChange: (updater: (sheet: SheetForm) => SheetForm) => void;
}

// 채취 종료시간 = 시작시간 + Σ지점별 채취시간(분). 시작이 없으면 빈 값.
// 합산 규칙은 타임라인과 공유한다 — 두 곳이 다른 종료시각을 말하면 안 된다.
const calcSamplingEndTime = (start: string, points: SamplingPointForm[]): string =>
  addMinutes(start, calcParticleSamplingMinutes(points)) ?? "";

const withAutoEndTime = (sheet: SheetForm): SheetForm => ({
  ...sheet,
  particle: {
    ...sheet.particle,
    samplingEndTime: calcSamplingEndTime(sheet.particle.samplingStartTime, sheet.samplingPoints),
  },
});

export const SheetFormView = ({
  sheet, previewCalc, externals, assignedPollutants, unassignedGroups, unresolvedItemNames,
  fieldState, editable, updatedSections,
  calcDrawerOpen, onCalcDrawerOpenChange, nav, onChange,
}: Props) => {
  // 차압 범위 슬라이더는 열릴 때마다 초기 상태로 되돌린다 (희망 흡입량은 아래에서 유지한다)
  const nozzleFormKey = useRemountKey(calcDrawerOpen);

  // 희망 흡입량은 드로어 밖에 둔다 — 노즐을 고른 뒤에도 같은 기준의 예상치를 계속 보여줘야 한다.
  const [nozzleTargetVolume, setNozzleTargetVolume] = useState(DEFAULT_TARGET_VOLUME);

  const particle = isParticleCategory(sheet.category);

  // 이미 입력된 값이 있는 항목은 배정 여부와 무관하게 계속 보여준다.
  // 판정을 마운트 시점으로 고정하는 것이 핵심 — 매 렌더 폼 값을 다시 보면 마지막 글자를
  // 지우는 순간 입력칸이 사라지고 포커스가 날아간다. 시트가 바뀌면 key 리마운트로 갱신된다.
  const [hadSavedValue] = useState<ExhaustGasVisibility>(() => ({
    thc: hasSavedExhaustGasValue(sheet.exhaustGas, "thc"),
    nox: hasSavedExhaustGasValue(sheet.exhaustGas, "nox"),
    sox: hasSavedExhaustGasValue(sheet.exhaustGas, "sox"),
  }));

  const visiblePollutants = useMemo(
    () => getExhaustGasVisibility(assignedPollutants, hadSavedValue),
    [assignedPollutants, hadSavedValue],
  );

  // 접혀 있는 섹션이 갱신됐을 때도 눈에 띄어야 하므로 배지는 카드 헤더에 붙인다.
  const updated = useMemo(() => new Set(updatedSections ?? []), [updatedSections]);

  /**
   * 헤더 강조 배지. 카드 테두리는 **첫 배지의 톤**을 따르므로 순서가 곧 우선순위다 —
   * 화면 밖에서 일어난 일(다른 사용자의 저장)이 먼저고, 그다음이 잘못 들어간 값(법정 범위
   * 이탈), 마지막이 아직 채우지 않은 빈 칸이다.
   */
  const highlightsOf = (id: SheetSectionId, borrowed: number): SectionHighlight[] => {
    const missing = fieldState.showMissing
      ? getMissingRequiredFields(sheet, id, assignedPollutants).length
      : 0;
    // 섹션을 접어 둔 채로 저장하러 가는 흐름이 흔하므로, 칸 안의 경고를 헤더에도 올린다.
    const outOfRange = id === "moisture" && checkMoistureWeightGain(sheet.moisture) !== null;

    return [
      ...(updated.has(id) ? [{ label: "방금 갱신됨", tone: "brand" as const }] : []),
      ...(outOfRange ? [{ label: "무게차 범위 초과", tone: "danger" as const }] : []),
      ...(missing > 0 ? [{ label: `미입력 ${missing}`, tone: "danger" as const }] : []),
      ...(borrowed > 0 ? [{ label: `불러옴 ${borrowed}`, tone: "info" as const }] : []),
    ];
  };

  const shellProps = (id: SheetSectionId) => {
    const progress = getSectionProgress(sheet, id, assignedPollutants);
    const borrowedCount = fieldState.borrowedCountOf(id);

    return {
      id: sectionDomId(id),
      open: nav.isOpen(id),
      onOpenChange: (open: boolean) => nav.setSectionOpen(id, open),
      progress,
      progressTone: getProgressTone(progress),
      highlights: highlightsOf(id, borrowedCount),
      // 불러온 값이 남아 있는 동안만 뜬다 — 접어 둔 섹션에서도 눌러 한 번에 정리할 수 있다.
      trailing: borrowedCount > 0 ? (
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={() => fieldState.onAcknowledgeSection(id)}
        >
          <Check size={13} />전체 확인
        </Button>
      ) : undefined,
    };
  };

  // 섹션마다 한 벌씩 넘기는 칸 상태 창구 — 판정은 전부 SheetsEditor 가 한다.
  const fieldProps = {
    fieldTone: fieldState.fieldTone,
    onFieldFocus: fieldState.onFieldFocus,
  };

  const patchWeather = (patch: Partial<WeatherForm>) =>
    onChange((s) => ({ ...s, weather: { ...s.weather, ...patch } }));

  const patchMoisture = (patch: Partial<MoistureForm>) =>
    onChange((s) => ({ ...s, moisture: { ...s.moisture, ...patch } }));

  const patchExhaust = (patch: Partial<ExhaustGasForm>) =>
    onChange((s) => ({ ...s, exhaustGas: { ...s.exhaustGas, ...patch } }));

  const patchReading = (key: GasColumnKey, index: number, value: string) =>
    onChange((s) => ({
      ...s,
      exhaustGas: {
        ...s.exhaustGas,
        [key]: s.exhaustGas[key].map((v, i) => (i === index ? value : v)),
      },
    }));

  // 지점 간에 걸리는 규칙(채취시간 공통·DGM 적산값 잇기)은 `point-chain` 이 소유한다.
  const patchPoint = (index: number, patch: Partial<SamplingPointForm>) =>
    onChange((s) => {
      const next = { ...s, samplingPoints: applyPointPatch(s.samplingPoints, index, patch) };
      // 채취시간이 바뀌면 종료시간을 재계산한다.
      return "samplingTime" in patch ? withAutoEndTime(next) : next;
    });

  // 새 지점도 채취시간(공통값)을 물려받으므로 종료시간이 그만큼 늘어난다.
  const addPoint = () =>
    onChange((s) => withAutoEndTime({ ...s, samplingPoints: appendPoint(s.samplingPoints) }));

  const removePoint = (index: number) =>
    onChange((s) => withAutoEndTime({
      ...s,
      samplingPoints: s.samplingPoints.filter((_, i) => i !== index),
    }));

  // 채취시간도 함께 복사되므로 종료시간을 다시 계산한다.
  const copyPreviousPoint = (index: number) =>
    onChange((s) => withAutoEndTime({
      ...s,
      samplingPoints: copyPreviousPointValues(s.samplingPoints, index),
    }));

  const patchSample = (index: number, patch: Partial<SampleForm>) =>
    onChange((s) => ({
      ...s,
      samples: s.samples.map((sp, i) => (i === index ? { ...sp, ...patch } : sp)),
    }));

  const addSample = () => onChange((s) => ({ ...s, samples: [...s.samples, getDefaultSampleForm()] }));

  // 미배정 항목을 이 기록지에 적는다. 이미 있는 행은 건드리지 않고 뒤에 덧붙이기만 한다 —
  // 사용자가 정해 둔 구성을 자동 채움이 되돌려서는 안 된다.
  const addUnassignedSamples = () =>
    onChange((s) => ({ ...s, samples: [...s.samples, ...unassignedGroups.map(toSampleForm)] }));
  const removeSample = (index: number) =>
    onChange((s) => ({ ...s, samples: s.samples.filter((_, i) => i !== index) }));

  /**
   * 시료 행 순서 바꾸기.
   *
   * 자동 채움은 측정항목 순서(= 성적서 표기 순서)대로 넣지만, 현장에서 실제로 채취한 순서는
   * 다를 수 있고 기록지는 그 순서대로 적는다. 그래서 표 순서는 사용자가 정한다.
   */
  const moveSample = (from: number, to: number) =>
    onChange((s) => {
      if (to < 0 || to >= s.samples.length || from === to) return s;

      const samples = [...s.samples];
      const [moved] = samples.splice(from, 1);
      samples.splice(to, 0, moved);
      return { ...s, samples };
    });

  const patchParticle = (patch: Partial<ParticleForm>) =>
    onChange((s) => {
      const next = { ...s, particle: { ...s.particle, ...patch } };
      return "samplingStartTime" in patch ? withAutoEndTime(next) : next;
    });

  const nozzleOptions = externals.nozzleDiameters.map((d) => ({ value: String(d), label: `${d} cm` }));

  // 노즐경 후보별 추정치 — 추천 드로어와 "선택한 노즐 예상치"가 같은 목록을 본다.
  const nozzleEstimates = useMemo(
    () => (particle ? calcNozzleEstimates(sheet, externals, nozzleTargetVolume) : []),
    [particle, sheet, externals, nozzleTargetVolume],
  );

  const nozzleEstimate = useMemo(
    () => findNozzleEstimate(nozzleEstimates, sheet.particle.nozzleSize),
    [nozzleEstimates, sheet.particle.nozzleSize],
  );

  return (
    <div className="space-y-4">
      <WeatherSection {...fieldProps} {...shellProps("weather")}
        weather={sheet.weather} calc={previewCalc?.weather ?? null}
        editable={editable} onChange={patchWeather} />

      <MoistureSection {...fieldProps} {...shellProps("moisture")}
        moisture={sheet.moisture} calc={previewCalc?.moisture ?? null}
        editable={editable} onChange={patchMoisture} />

      <ExhaustGasSection {...fieldProps} {...shellProps("exhaust")}
        exhaustGas={sheet.exhaustGas}
        visiblePollutants={visiblePollutants}
        editable={editable} onChange={patchExhaust} onReadingChange={patchReading} />

      <SamplingPointSection {...fieldProps} {...shellProps("point")}
        isParticle={particle}
        points={sheet.samplingPoints}
        particle={sheet.particle}
        preview={previewCalc}
        nozzleBasis={{
          size: sheet.particle.nozzleSize,
          estimate: nozzleEstimate,
          targetVolume: nozzleTargetVolume,
          pointCount: sheet.samplingPoints.length,
        }}
        editable={editable}
        onPointChange={patchPoint}
        onAddPoint={addPoint}
        onRemovePoint={removePoint}
        onCopyPreviousPoint={copyPreviousPoint}
        onParticleChange={patchParticle}
      />

      {particle && (
        <ThimbleSection {...fieldProps} {...shellProps("sample")}
          particle={sheet.particle}
          editable={editable}
          onParticleChange={patchParticle}
        />
      )}

      {/* 가스상 물질은 카테고리와 무관하게 모든 기록지가 작성한다. */}
      <GaseousSection {...fieldProps} {...shellProps("gaseous")}
        samples={sheet.samples}
        unassignedGroups={unassignedGroups}
        unresolvedItemNames={unresolvedItemNames}
        editable={editable}
        onSampleChange={patchSample}
        onAddSample={addSample}
        onAddUnassignedSamples={addUnassignedSamples}
        onRemoveSample={removeSample}
        onMoveSample={moveSample}
      />


      <SheetCalcDrawer
        key={nozzleFormKey}
        open={calcDrawerOpen}
        onOpenChange={onCalcDrawerOpenChange}
        isParticle={particle}
        particle={sheet.particle}
        points={sheet.samplingPoints}
        preview={previewCalc}
        standardOxygen={externals.standardOxygen}
        visiblePollutants={visiblePollutants}
        nozzleOptions={nozzleOptions}
        recommendations={nozzleEstimates}
        nozzleEstimate={nozzleEstimate}
        targetVolume={nozzleTargetVolume}
        onTargetVolumeChange={setNozzleTargetVolume}
        editable={editable}
        onParticleChange={patchParticle}
        nozzleTone={fieldState.fieldTone(fieldPath.particle("nozzleSize"))}
        onNozzleFocus={() => fieldState.onFieldFocus(fieldPath.particle("nozzleSize"))}
      />
    </div>
  );
};
