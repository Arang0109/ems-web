import { FileX2, Inbox, SearchX } from "lucide-react";
import { TableEmptyState } from "ems-web";

/** 아이콘 + 제목 + 부제를 갖춘 큰 빈 상태 (한 줄 안내문은 `EmptyText` 쪽) */
export const NoData = () => (
  <TableEmptyState
    icon={<Inbox size={40} />}
    label="등록된 측정일정이 없습니다"
    subLabel="상단의 '측정일정 등록' 버튼으로 첫 일정을 만들어 보세요."
  />
);

/** 검색 결과 없음 */
export const NoSearchResult = () => (
  <TableEmptyState
    icon={<SearchX size={40} />}
    label="검색 결과가 없습니다"
    subLabel="다른 의뢰기관명이나 주소로 다시 검색해 보세요."
  />
);

/** 조회 실패 */
export const LoadFailed = () => (
  <TableEmptyState
    icon={<FileX2 size={40} />}
    label="목록을 불러오지 못했습니다"
    subLabel="잠시 후 다시 시도하거나 관리자에게 문의하세요."
  />
);
