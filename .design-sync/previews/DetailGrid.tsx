import { Badge, DetailGrid, DetailRow } from "ems-web";

/**
 * 배출구 상세 — `stack-profile` 위젯의 실제 배치.
 * 데스크탑에서 라벨 폭이 고정이라 값의 시작 x축이 모든 행에서 일치한다.
 */
export const StackDetail = () => (
  <DetailGrid cols={3}>
    <DetailRow label="측정분야" value="대기" />
    <DetailRow label="배출구명" value="1호기 보일러 배출구" />
    <DetailRow label="SEMS 번호" value="12345678" />
    <DetailRow label="등급" value="3종" />
    <DetailRow label="주생산품" value="전기" />
    <DetailRow label="표준산소농도" value="6 %" />
    <DetailRow label="높이" value="45 m" />
    <DetailRow label="직경" value="1.2 m" />
    <DetailRow label="형상" value="원형" />
  </DetailGrid>
);

/** 2열 배치 + `span="full"` — 주소처럼 긴 값은 한 행을 통째로 쓴다 */
export const TwoColumnWithSpan = () => (
  <DetailGrid cols={2}>
    <DetailRow label="의뢰기관" value="한국환경공단" />
    <DetailRow label="사업자번호" value="123-45-67890" />
    <DetailRow label="대표자" value="김민수" />
    <DetailRow label="담당자" value="이서연" />
    <DetailRow
      label="주소"
      span="full"
      value="인천광역시 서구 환경로 42 한국환경공단 본사 3층 대기측정관리팀"
    />
  </DetailGrid>
);

/** 값에 노드를 넣는 경우 — 빈 값은 `-` 로 정규화하면 muted 로 죽는다 */
export const NodeAndEmptyValues = () => (
  <DetailGrid cols={2}>
    <DetailRow label="진행 상태" value={<Badge tone="brand">측정 완료</Badge>} />
    <DetailRow label="성적서" value={<Badge tone="warning">발행 대기</Badge>} />
    <DetailRow label="비고" value="-" />
    <DetailRow label="재측정 사유" value="-" />
  </DetailGrid>
);
