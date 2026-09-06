import { EmptyText, Panel } from "ems-web";

/** 패널 안 좁은 슬롯의 한 줄 안내문 */
export const Default = () => <EmptyText>등록된 배출시설이 없습니다.</EmptyText>;

/** 실제 쓰임 — 아코디언·패널 본문이 비었을 때 */
export const InPanel = () => (
  <Panel>
    <h3 className="text-h3">배출시설</h3>
    <EmptyText>등록된 배출시설이 없습니다.</EmptyText>
  </Panel>
);

/**
 * 로딩·오류 문구도 같은 슬롯을 쓴다.
 * 아이콘·부제가 있는 큰 빈 상태는 `TableEmptyState` 쪽이다.
 */
export const Messages = () => (
  <div className="flex flex-col">
    <EmptyText>불러오는 중...</EmptyText>
    <EmptyText>측정 항목을 불러오지 못했습니다.</EmptyText>
    <EmptyText>검색 결과가 없습니다.</EmptyText>
  </div>
);
