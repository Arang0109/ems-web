import { Fragment } from "react";

import type { HistoryRow } from "../../../model/measurement-history";

interface Props {
  rows: HistoryRow[];
}

/** 같은 회차의 연속 행을 하나로 묶는다 — 서버가 회차별로 이어 주므로 재정렬 없이 세기만 하면 된다. */
const toGroups = (rows: HistoryRow[]): HistoryRow[][] =>
  rows.reduce<HistoryRow[][]>((groups, row) => {
    const last = groups.at(-1);
    if (last && last[0].scheduleId === row.scheduleId) last.push(row);
    else groups.push([row]);
    return groups;
  }, []);

/**
 * 회차별 측정 기록.
 *
 * 한 회차에서 여러 항목을 측정하므로 측정일을 행마다 되풀이하지 않고 회차 단위로 한 번만 쓴다 —
 * 같은 날짜가 열 줄 반복되면 어디서 회차가 갈리는지 눈으로 짚을 수 없다.
 */
export const HistoryTable = ({ rows }: Props) => (
  // 좁은 화면에서 표가 페이지를 밀어내지 않도록 이 컨테이너 안에서만 가로 스크롤한다
  <div className="overflow-x-auto">
    <table className="w-full min-w-3xl text-body-3">
      <thead>
        <tr className="border-b border-rule">
          <th className="px-3 py-2 text-left text-label text-muted-ink">측정일</th>
          <th className="px-3 py-2 text-left text-label text-muted-ink">측정항목</th>
          <th className="px-3 py-2 text-left text-label text-muted-ink">주기</th>
          <th className="px-3 py-2 text-left text-label text-muted-ink">구간</th>
          <th className="px-3 py-2 text-right text-label text-muted-ink">농도</th>
          <th className="px-3 py-2 text-right text-label text-muted-ink">보정농도</th>
          <th className="px-3 py-2 text-right text-label text-muted-ink">배출량</th>
          <th className="px-3 py-2 text-right text-label text-muted-ink">허용기준</th>
          <th className="px-3 py-2 text-left text-label text-muted-ink">단위</th>
        </tr>
      </thead>
      <tbody>
        {toGroups(rows).map((group) => (
          <Fragment key={group[0].scheduleId}>
            {group.map((row, index) => (
              <tr
                key={row.recordId}
                // 회차가 바뀌는 첫 행에만 굵은 경계를 둬 회차 묶음이 눈에 들어오게 한다
                className={index === 0 ? "border-t border-rule-dark" : "border-t border-rule"}
              >
                <td className="px-3 py-2 text-muted-ink">{index === 0 ? row.sampledAt : ""}</td>
                <td className="px-3 py-2 text-ink">{row.nameKr}</td>
                <td className="px-3 py-2 text-muted-ink">{row.cycle}</td>
                <td className="px-3 py-2 text-muted-ink">{row.periodLabel}</td>
                {/* 초과 회차는 농도를 붉게 — 허용기준과 나란히 놓아도 대소를 눈으로 재게 하지 않는다 */}
                <td className={`px-3 py-2 text-right tabular-nums ${row.isExceeded ? "text-danger" : "text-ink"}`}>
                  {row.concentration}
                  {row.isExceeded && <span className="ml-1 text-caption">초과</span>}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-ink">{row.correctedConcentration}</td>
                <td className="px-3 py-2 text-right tabular-nums text-ink">{row.emission}</td>
                <td className="px-3 py-2 text-right tabular-nums text-muted-ink">{row.allowance}</td>
                <td className="px-3 py-2 text-muted-ink">{row.unit || "-"}</td>
              </tr>
            ))}
          </Fragment>
        ))}
      </tbody>
    </table>
  </div>
);
