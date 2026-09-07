import { unwrapMessage } from "@shared/api";
import { useEntityQuery } from "@shared/model";
import type { MeasurementField } from "@shared/model";

import { pollutantApi } from "../api/api";
import { toPollutantCandidates } from "../api/mapper";
import { pollutantKeys } from "./query-keys";
import type { PollutantCandidate } from "./types";

interface Props {
  /** 지정하면 그 측정분야만 조회한다 */
  field?: MeasurementField;
  /** false 면 조회하지 않는다. 모달이 닫혀 있는 동안 불필요한 요청을 막는 용도. 기본 true. */
  enabled?: boolean;
}

/** 가이드에는 있으나 이 고객사가 아직 채택하지 않은 측정물질(채택 후보). */
export const usePollutantCandidates = ({ field, enabled = true }: Props = {}) =>
  useEntityQuery<PollutantCandidate[]>({
    queryKey: pollutantKeys.candidates(field),
    queryFn: async () =>
      toPollutantCandidates(unwrapMessage(await pollutantApi.getPollutantCandidates({ field }))),
    initialData: [],
    enabled,
    invalidateKey: pollutantKeys.all,
  });
