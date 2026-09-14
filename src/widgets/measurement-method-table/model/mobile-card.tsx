import type { MobileCardConfig } from "@shared/model";

import type { MeasurementMethodTableRow } from "./types";

/** 모바일 카드 배치. 데스크탑 컬럼 정의(`columns.ts`)와 독립적이다. */
export const measurementMethodCardConfig: MobileCardConfig<MeasurementMethodTableRow> = {
  title: (row) => row.name,
  subtitle: (row) => row.sampleGrouping,
  columns: 2,
  fields: [
    { label: "기록지 통칭명", content: (row) => row.mergedSampleName },
    { label: "표준 채취시간", content: (row) => row.samplingMinutes },
    { label: "표준 흡인유량", content: (row) => row.suctionFlowRate },
  ],
};
