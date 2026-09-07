import { unwrapMessage } from "@shared/api";
import { useEntityQuery } from "@shared/model";
import type { MeasurementField } from "@shared/model";

import { pollutantCatalogApi } from "../api/api";
import { toPollutantCatalogs } from "../api/mapper";
import { pollutantCatalogKeys } from "./query-keys";
import type { PollutantCatalog } from "./types";

interface Props {
  field?: MeasurementField;
  /** 폐지된 항목까지 포함할지 여부 */
  includeInactive?: boolean;
}

/** 전역 측정물질 카탈로그(플랫폼 운영자용). 거의 바뀌지 않아 오래 캐시한다. */
export const usePollutantCatalogs = ({ field, includeInactive }: Props = {}) =>
  useEntityQuery<PollutantCatalog[]>({
    queryKey: pollutantCatalogKeys.list(field, includeInactive),
    queryFn: async () =>
      toPollutantCatalogs(
        unwrapMessage(await pollutantCatalogApi.getPollutantCatalogs({ field, includeInactive })),
      ),
    initialData: [],
    staleTime: 5 * 60_000,
    invalidateKey: pollutantCatalogKeys.lists(),
  });
