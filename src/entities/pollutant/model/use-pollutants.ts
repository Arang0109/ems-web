import { unwrapMessage } from "@shared/api";
import { useEntityQuery } from "@shared/model";
import type { MeasurementField } from "@shared/model";

import { pollutantApi } from "../api/api";
import { toPollutants } from "../api/mapper";
import { pollutantKeys } from "./query-keys";
import type { Pollutant } from "./types";

interface Props {
  /** 지정하면 그 측정분야만 조회한다 */
  field?: MeasurementField;
}

/**
 * 이 고객사가 채택한 측정물질 목록.
 *
 * 가이드에만 있고 아직 채택하지 않은 항목은 오지 않는다 — 채택 후보는 `usePollutantCandidates` 로
 * 따로 조회한다. 그래서 한 번도 채택하지 않은 고객사는 빈 목록을 본다.
 */
export const usePollutants = ({ field }: Props = {}) =>
  useEntityQuery<Pollutant[]>({
    queryKey: pollutantKeys.list(field),
    queryFn: async () => toPollutants(unwrapMessage(await pollutantApi.getPollutants({ field }))),
    initialData: [],
    // 채택하면 후보에서 빠지고 목록에 들어온다 — 둘은 항상 함께 갱신돼야 한다.
    invalidateKey: pollutantKeys.all,
  });
