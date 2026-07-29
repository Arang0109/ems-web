export type TenantTableRow = {
  tenantId: number;
  name: string;
  bizNumber: string;          // 포맷된 사업자번호 (238-32-48234)
  status: string;             // 한글 라벨 (운영중, 정지, ...)
  subscriptionPlan: string;   // 한글 라벨 (스탠다드, ...)
  createdAt: string;          // 포맷된 일시
};
