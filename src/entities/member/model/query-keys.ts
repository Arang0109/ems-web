export const memberKeys = {
  all: ["member"] as const,
  lists: () => [...memberKeys.all, "list"] as const,
  list: () => [...memberKeys.lists()] as const,
  details: () => [...memberKeys.all, "detail"] as const,
  detail: (id: number) => [...memberKeys.details(), id] as const,
};

/** 권한 목록은 구성원과 수명주기가 다르다(거의 바뀌지 않는 마스터 데이터). 키를 분리한다. */
export const roleKeys = {
  all: ["role"] as const,
  list: () => [...roleKeys.all, "list"] as const,
};
