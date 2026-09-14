import { createColumnHelper } from "@tanstack/react-table";

import { RowActionCell } from "@shared/ui/table";

import type { MeasurementMethodTableRow } from "./types";

const columnHelper = createColumnHelper<MeasurementMethodTableRow>();

export const defaultColumns = [
  columnHelper.accessor("name", {
    header: "측정방법",
  }),
  columnHelper.accessor("sampleGrouping", {
    header: "채취 단위",
  }),
  columnHelper.accessor("mergedSampleName", {
    header: "기록지 통칭명",
    enableSorting: false,
  }),
  columnHelper.accessor("samplingMinutes", {
    header: "표준 채취시간",
    enableSorting: false,
  }),
  columnHelper.accessor("suctionFlowRate", {
    header: "표준 흡인유량",
    enableSorting: false,
  }),
  columnHelper.display({
    id: "actions",
    cell: RowActionCell,
  }),
];
