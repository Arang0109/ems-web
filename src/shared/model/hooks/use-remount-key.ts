import { useState } from "react";

/**
 * 다이얼로그가 열릴 때마다 새 key 를 준다 — 내용물을 리마운트해 폼을 초기 상태로 되돌린다.
 *
 * 폼 상태는 feature 훅에 있고 그 훅은 다이얼로그 팝업 **바깥**에 있어서,
 * Base UI 가 닫으면서 팝업을 언마운트해도 입력값이 그대로 남는다.
 * 같은 행의 상세를 다시 열었을 때 `key={item.id}` 가 바뀌지 않는 경우도 마찬가지다.
 *
 * ```tsx
 * const formKey = useRemountKey(updateModalOpen);
 * <UpdateClientForm key={formKey} open={updateModalOpen} ... />
 * ```
 *
 * 닫힐 때가 아니라 **열릴 때** 리마운트하므로 닫힘 애니메이션은 그대로 재생된다.
 */
export const useRemountKey = (open: boolean) => {
  const [key, setKey] = useState(0);

  // 열림 전환을 렌더 중에 감지한다 — effect + setState 는 cascading render 를 부른다.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setKey((prev) => prev + 1);
  }

  return key;
};
