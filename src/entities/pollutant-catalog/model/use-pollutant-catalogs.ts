import { unwrapMessage } from "@shared/api";
import { useFetch } from "@shared/model";
import type { MeasurementField } from "@shared/model";

import { pollutantCatalogApi } from "../api/api";
import { toPollutantCatalogs } from "../api/mapper";
import type { PollutantCatalog } from "./types";

interface Props {
  field?: MeasurementField;
  /** 폐지된 항목까지 포함할지 여부 */
  includeInactive?: boolean;
}

/** 타입 A(자동 로드): 전역 측정물질 카탈로그(플랫폼 운영자용). */
export const usePollutantCatalogs = ({ field, includeInactive }: Props = {}) =>
  useFetch<PollutantCatalog[]>(
    async () =>
      toPollutantCatalogs(unwrapMessage(await pollutantCatalogApi.getPollutantCatalogs({ field, includeInactive }))),
    [],
    { deps: [field, includeInactive] },
  );
