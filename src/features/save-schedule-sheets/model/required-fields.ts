import type { AssignedPollutants } from "./measured-pollutants";
import type { SheetSectionId } from "./section-progress";
import type {
  MoistureForm, ParticleForm, SampleForm, SamplingPointForm,
  ScheduleBasicInfoForm, SheetForm, WeatherForm
} from "./types";
import { GAS_READING_COUNT, isParticleCategory } from "./types";

/**
 * 기록지 입력 칸의 **단일 소스**.
 *
 * 이전에는 "필수"의 정의가 세 군데로 갈려 있었다 — UI 의 `required` 별표, 진행도 배지의 분모,
 * 그리고 저장 검증. 셋이 어긋나면 별표는 붙었는데 저장은 통과하고, 배지는 미완성인데
 * 제출은 되는 화면이 된다. 여기 한 곳에서만 정의하고 나머지는 전부 파생시킨다.
 *
 * 칸을 가리키는 방법은 **경로 문자열**이다. 배열(측정점·시료·회차)이 섞여 있어 `keyof` 하나로는
 * 짚을 수 없고, 값 강조·미입력 표시가 칸 단위로 오가야 하기 때문이다.
 * 오타를 컴파일러가 잡도록 경로는 반드시 {@link fieldPath} 빌더로만 만든다.
 */
export type SheetFieldPath = string;

export const fieldPath = {
  weather: (key: keyof WeatherForm): SheetFieldPath => `weather.${key}`,
  moisture: (key: keyof MoistureForm): SheetFieldPath => `moisture.${key}`,
  /** 회차별 성분 농도 — `i` 는 0-based 회차 */
  exhaustReading: (key: GasColumnPath, index: number): SheetFieldPath => `exhaustGas.${key}.${index}`,
  exhaustTime: (key: ExhaustTimePath): SheetFieldPath => `exhaustGas.${key}`,
  point: (index: number, key: keyof SamplingPointForm): SheetFieldPath => `points.${index}.${key}`,
  sample: (index: number, key: keyof SampleForm): SheetFieldPath => `samples.${index}.${key}`,
  particle: (key: keyof ParticleForm): SheetFieldPath => `particle.${key}`,
} as const;

type GasColumnPath = "o2" | "co2" | "co" | "nox" | "sox";
type ExhaustTimePath = "gasAnalyzerStartTime" | "thcAnalyzerStartTime";

const GAS_COLUMNS: GasColumnPath[] = ["o2", "co2", "co", "nox", "sox"];

/** 경로로 폼 값을 읽는다. 없는 칸(지워진 측정점 등)은 빈 문자열이다 */
export const readField = (sheet: SheetForm, path: SheetFieldPath): string => {
  const [head, a, b] = path.split(".");

  switch (head) {
    case "weather":
      return sheet.weather[a as keyof WeatherForm] ?? "";
    case "moisture":
      return sheet.moisture[a as keyof MoistureForm] ?? "";
    case "exhaustGas":
      return b === undefined
        ? sheet.exhaustGas[a as ExhaustTimePath] ?? ""
        : sheet.exhaustGas[a as GasColumnPath]?.[Number(b)] ?? "";
    case "points":
      return sheet.samplingPoints[Number(a)]?.[b as keyof SamplingPointForm] ?? "";
    case "samples":
      return sheet.samples[Number(a)]?.[b as keyof SampleForm] ?? "";
    case "particle":
      return sheet.particle[a as keyof ParticleForm] ?? "";
    default:
      return "";
  }
};

/** 그 경로가 속한 섹션 — 섹션별 배지 개수를 셀 때 쓴다 */
export const sectionOfPath = (path: SheetFieldPath): SheetSectionId | null => {
  const [head, a] = path.split(".");

  switch (head) {
    case "weather":
      return "weather";
    case "moisture":
      return "moisture";
    case "exhaustGas":
      return "exhaust";
    case "points":
      return "point";
    case "samples":
      return "gaseous";
    // 시트 단위 입자상 값은 화면상 두 섹션으로 갈린다 — 여지 번호만 `여지` 섹션이다
    case "particle":
      return a === "thimbleFilter" || a === "bgThimbleFilter" ? "sample" : "point";
    default:
      return null;
  }
};

const isFilled = (value: string): boolean => value.trim() !== "";

// ── 필수 칸 정의 ────────────────────────────────────────────────────────────────

/**
 * 기상정보 필수 — **풍향은 뺀다.** 풍속 0.5m/s 미만이면 `정온` 하나뿐이라 사실상 선택 입력이고,
 * 피그마의 기상정보 배지도 5/5 다. UI 의 `required` 별표도 풍향에는 붙어 있지 않다.
 */
const WEATHER_REQUIRED: (keyof WeatherForm)[] = [
  "pressure", "temperature", "humidity", "weatherCondition", "windSpeed",
];

/** 수분량 필수 — 채취 시각(시작·종료)은 선택 입력이라 뺀다 */
const MOISTURE_REQUIRED: (keyof MoistureForm)[] = [
  "weightBefore", "weightAfter",
  "gasMeterTempIn", "gasMeterTempOut",
  "dryGasVolumeBefore", "dryGasVolumeAfter",
  "gasMeterGaugePressure", "suctionVelocity",
];

/** 가스분석기가 항상 읽는 3성분 — NOx·SOx 는 배정됐을 때만 붙는다 */
const BASE_GAS_COLUMNS: GasColumnPath[] = ["o2", "co2", "co"];

/** 측정점 필수 — 유량(Ts/Pv/Ps)은 모든 시트, 나머지는 입자상 시트만 */
const POINT_FLOW_REQUIRED: (keyof SamplingPointForm)[] = ["Ts", "Pv", "Ps"];
const POINT_ISOKINETIC_REQUIRED: (keyof SamplingPointForm)[] = [
  "inTm", "outTm", "samplingTime", "beforeVm", "afterVm",
  "vacuumGaugePressure", "finalImpingerTemperature",
];

/**
 * 가스상 채취 항목의 필수 칸. **`GaseousSection` 의 별표도 이 목록에서 파생시킨다** —
 * 바탕시료(`blankSampleNumber`)만 선택 입력이다(채취하지 않고 운반만 한 대조용).
 */
export const REQUIRED_SAMPLE_FIELDS: (keyof SampleForm)[] = [
  "sampleName", "startTime", "endTime",
  "suctionQuantity", "gasMeterGaugePressure", "inTemperature", "outTemperature",
  "samplingVolume", "beforeVolume", "afterVolume", "sampleNumber",
];

/**
 * 섹션의 필수 칸 경로.
 *
 * 배출가스 노출 판정은 `visiblePollutants`(= 배정 ∪ 저장값 있음) 가 아니라 **배정(`assigned`)만**
 * 본다. 배정되지 않았는데 옛 값이 남아 보이는 칸은 이번 회차의 필수가 아니고, 무엇보다
 * `visiblePollutants` 는 `SheetFormView` 마운트 시점에 고정되는 값이라 저장 검증(상위)이 읽을 수 없다.
 * 두 곳이 같은 판정을 보려면 기준이 `assigned` 여야 한다.
 */
export const getRequiredFields = (
  sheet: SheetForm,
  id: SheetSectionId,
  assigned: AssignedPollutants,
): SheetFieldPath[] => {
  const particle = isParticleCategory(sheet.category);
  const readings = (column: GasColumnPath): SheetFieldPath[] =>
    Array.from({ length: GAS_READING_COUNT }, (_, i) => fieldPath.exhaustReading(column, i));

  switch (id) {
    case "weather":
      return WEATHER_REQUIRED.map(fieldPath.weather);

    case "moisture":
      return MOISTURE_REQUIRED.map(fieldPath.moisture);

    case "exhaust":
      return [
        ...(assigned.thc ? [fieldPath.exhaustTime("thcAnalyzerStartTime")] : []),
        ...BASE_GAS_COLUMNS.flatMap(readings),
        ...(assigned.nox ? readings("nox") : []),
        ...(assigned.sox ? readings("sox") : []),
      ];

    case "point": {
      const perPoint = particle
        ? [...POINT_FLOW_REQUIRED, ...POINT_ISOKINETIC_REQUIRED]
        : POINT_FLOW_REQUIRED;

      return [
        ...sheet.samplingPoints.flatMap((_, i) => perPoint.map((key) => fieldPath.point(i, key))),
        // 노즐경·채취 시작시각은 지점이 아니라 시트 단위 입력이다
        ...(particle
          ? [fieldPath.particle("nozzleSize"), fieldPath.particle("samplingStartTime")]
          : []),
      ];
    }

    case "sample":
      return [fieldPath.particle("thimbleFilter"), fieldPath.particle("bgThimbleFilter")];

    // 가스상 물질은 **미입력 경고를 띄우지 않는다.** 채취 항목 수가 회차마다 갈리고 행을
    // 미리 만들어 두는 흐름이라, 비어 있다는 사실만으로 빠뜨린 것이라 볼 수 없다.
    // 칸의 별표(`REQUIRED_SAMPLE_FIELDS`)는 그대로 남아 "채운다면 이 칸들"을 안내한다.
    case "gaseous":
      return [];
  }
};

// ── 공통 정보(측정계획 단위) ───────────────────────────────────────────────────

/**
 * 공통 정보의 필수 칸 — 총 채취시간뿐이다.
 *
 * 담당자는 넣지 않는다. 현장에서 나중에 채우거나 아예 비워 두는 칸이라 필수로 두면
 * 매 저장마다 경고가 뜬다. 총 채취시간은 모든 기록지가 공유하는 값이라 다르다.
 *
 * 기록지 필수 칸(`getRequiredFields`)과 모델이 달라 경로 문자열을 쓰지 않는다 —
 * 공통 정보는 배열이 없는 평평한 폼이라 `keyof` 로 충분하다.
 */
export const REQUIRED_BASIC_INFO_FIELDS: (keyof ScheduleBasicInfoForm)[] = [
  "samplingStartedAt", "samplingEndedAt",
];

/** 공통 정보에서 아직 비어 있는 필수 칸 */
export const getMissingBasicInfoFields = (
  form: ScheduleBasicInfoForm,
): (keyof ScheduleBasicInfoForm)[] =>
  REQUIRED_BASIC_INFO_FIELDS.filter((key) => !isFilled(form[key]));

/** 그 섹션에서 아직 비어 있는 필수 칸 */
export const getMissingRequiredFields = (
  sheet: SheetForm,
  id: SheetSectionId,
  assigned: AssignedPollutants,
): SheetFieldPath[] =>
  getRequiredFields(sheet, id, assigned).filter((path) => !isFilled(readField(sheet, path)));

// ── 전체 칸 열거 (불러온 값 추적용) ─────────────────────────────────────────────

/**
 * 시트의 **모든** 입력 칸 경로. 필수 여부와 무관하다 —
 * 이전 회차에서 불러온 값은 선택 입력 칸에도 채워지므로 강조 대상이 같지 않다.
 *
 * 자동 계산으로 채워지는 칸(입자상 채취 종료시각)은 사용자가 확인할 값이 아니라 뺀다.
 */
export const collectFieldPaths = (sheet: SheetForm): SheetFieldPath[] => [
  ...(Object.keys(sheet.weather) as (keyof WeatherForm)[]).map(fieldPath.weather),
  ...(Object.keys(sheet.moisture) as (keyof MoistureForm)[]).map(fieldPath.moisture),
  ...(["gasAnalyzerStartTime", "thcAnalyzerStartTime"] as ExhaustTimePath[]).map(fieldPath.exhaustTime),
  ...GAS_COLUMNS.flatMap((column) =>
    Array.from({ length: GAS_READING_COUNT }, (_, i) => fieldPath.exhaustReading(column, i)),
  ),
  ...sheet.samplingPoints.flatMap((point, i) =>
    (Object.keys(point) as (keyof SamplingPointForm)[]).map((key) => fieldPath.point(i, key)),
  ),
  ...sheet.samples.flatMap((sample, i) =>
    (Object.keys(sample) as (keyof SampleForm)[]).map((key) => fieldPath.sample(i, key)),
  ),
  ...(Object.keys(sheet.particle) as (keyof ParticleForm)[])
    .filter((key) => key !== "samplingEndTime")
    .map(fieldPath.particle),
];
