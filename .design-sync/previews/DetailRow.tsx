import { Badge, DetailGrid, DetailRow } from "ems-web";

/**
 * 읽기 전용 상세 표시 행. 항상 `DetailGrid` 안에 둔다 —
 * 데스크탑에서 라벨 열 폭이 고정이라 값의 시작 x축이 모든 행에서 맞는다.
 */
export const Default = () => (
  <DetailGrid cols={1}>
    <DetailRow label="배출구명" value="1호기 보일러 배출구" />
    <DetailRow label="SEMS 번호" value="12345678" />
    <DetailRow label="높이" value="45 m" />
  </DetailGrid>
);

/** `span` — 주소처럼 긴 값은 열을 더 차지한다 */
export const Span = () => (
  <DetailGrid cols={2}>
    <DetailRow label="등급" value="3종" />
    <DetailRow label="형상" value="원형" />
    <DetailRow label="주소" span="full" value="인천광역시 서구 환경로 42 한국환경공단 본사 3층" />
  </DetailGrid>
);

/** 값은 ReactNode — 배지·칩을 그대로 넣을 수 있다. 빈 값은 `-` 로 정규화하면 muted 로 죽는다 */
export const NodeAndEmpty = () => (
  <DetailGrid cols={1}>
    <DetailRow label="진행 상태" value={<Badge tone="brand">측정 완료</Badge>} />
    <DetailRow label="비고" value="-" />
  </DetailGrid>
);
