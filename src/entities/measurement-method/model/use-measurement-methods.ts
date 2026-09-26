import { unwrapMessage } from "@shared/api";
import { useEntityQuery } from "@shared/model";

import { measurementMethodApi } from "../api/api";
import { toMeasurementMethods } from "../api/mapper";
import { measurementMethodKeys } from "./query-keys";
import type { MeasurementMethod } from "./types";

interface Props {
  /** false 면 조회하지 않는다 — 모달이 열릴 때만 목록이 필요한 폼이 쓴다 */
  enabled?: boolean;
}

/** 이 고객사의 측정방법 목록. 표시 순서대로 온다. */
export const useMeasurementMethods = ({ enabled = true }: Props = {}) =>
  useEntityQuery<MeasurementMethod[]>({
    queryKey: measurementMethodKeys.list(),
    queryFn: async () => toMeasurementMethods(unwrapMessage(await measurementMethodApi.getMeasurementMethods())),
    initialData: [],
    enabled,
  });
