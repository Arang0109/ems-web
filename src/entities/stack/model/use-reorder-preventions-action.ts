import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { stackApi } from '../api/api';

/**
 * 방지시설 표시 순서 변경.
 *
 * `orderedIds` 는 이 측정지점의 방지시설 **전체**여야 하며, 배열 순서가 곧 표시 순위다.
 * 집합이 서버와 다르면(내가 화면을 연 뒤 누군가 시설을 추가·삭제했다면) 서버가 저장을 거절한다.
 */
export const useReorderPreventionsAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (stackId: number, orderedIds: number[]) => {
    unwrapMessage(await stackApi.reorderPreventions({ stackId, orderedIds }));
  });

  return { reorderPreventions: run, isLoading, error };
};
