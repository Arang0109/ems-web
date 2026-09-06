import { unwrapMessage } from "@shared/api";
import { useFetch } from "@shared/model";
import type { MeasurementField } from "@shared/model";

import { pollutantApi } from "../api/api";
import { toPollutants } from "../api/mapper";
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
  useFetch<Pollutant[]>(
    async () => toPollutants(unwrapMessage(await pollutantApi.getPollutants({ field }))),
    [],
    // 객체를 그대로 의존성에 두면 매 렌더 새 참조라 무한 재조회가 된다 — 원시값으로 편다.
    { deps: [field] },
  );
