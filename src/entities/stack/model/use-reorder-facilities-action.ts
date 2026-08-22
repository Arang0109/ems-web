import { useState } from 'react';
import { stackApi } from '../api/api';

/**
 * 배출시설 표시 순서 변경.
 *
 * `orderedIds` 는 이 측정지점의 배출시설 **전체**여야 하며, 배열 순서가 곧 표시 순위다.
 * 집합이 서버와 다르면(내가 화면을 연 뒤 누군가 시설을 추가·삭제했다면) 서버가 저장을 거절한다.
 */
export const useReorderFacilitiesAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reorderFacilities = async (stackId: number, orderedIds: number[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await stackApi.reorderFacilities({ stackId, orderedIds });
      if (!result.status) {
        throw new Error(result.message ?? '서버 연결에 실패했습니다.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '서버 연결에 실패했습니다.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { reorderFacilities, isLoading, error };
};
