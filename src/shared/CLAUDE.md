# shared 레이어

비즈니스 도메인에 무관한 순수 재사용 유틸과 UI 기본 요소입니다.

---

## 책임 범위

- 공통 UI 컴포넌트 (shadcn/ui 래퍼)
- axios 인스턴스 (인증/비인증)
- MSW 핸들러 (개발 Mock API)
- 공통 타입, 상수, 레이블맵
- 입력 포맷팅 유틸

## 금지 사항

- 비즈니스 도메인 로직 작성 금지
- 특정 feature/entity에 종속된 코드 금지

---

## `ui/` — 공통 UI 컴포넌트

shadcn/ui를 래핑하거나 직접 작성한 공통 컴포넌트. 카테고리별 디렉토리 구조:

| 디렉토리 | 내용 |
|----------|------|
| `badges/` | BadgeWithIcon 등 |
| `borders/` | Divider 등 |
| `buttons/` | IconButton, DetailViewButton 등 버튼 컴포넌트 |
| `cards/` | SummaryCard 등 |
| `dialogs/` | FormDialog 등 |
| `form/` | Input, Select, DatePicker, Checkbox 등 폼 요소 |
| `links/` | Link |
| `pagination/` | Pagination |
| `semantics/` | PageTitle 등 시맨틱 요소 |
| `table/` | TanStack Table 기반 공통 테이블 (BasicTable, TableEmptyState) |

**비즈니스 로직 코드에서 반드시 `@shared/ui/*`를 통해 사용할 것**
(`@/components/ui/*` 직접 import 금지 — shadcn/ui 원본 컴포넌트 파일 내에서만 허용)

---

## `model/common-types.ts` — 상수 + 타입 + 레이블맵 패턴

도메인 전역 상수와 표시 레이블을 한 곳에서 관리:

```typescript
// 1. 상수 배열 (as const → 유니온 타입 추론)
export const CONTRACT_STATUS = ['active', 'expiringSoon', 'expired'] as const;
export type ContractStatus = (typeof CONTRACT_STATUS)[number];

// 2. 표시 레이블맵 (UI에서 한글 표시용)
export const CONTRACT_STATUS_LABEL: Record<ContractStatus, string> = {
  active: '계약중',
  expiringSoon: '만료 예정',
  expired: '만료',
};

// 3. 선택지 배열 생성 (폼 select 옵션)
export const contractStatusOptions = CONTRACT_STATUS.map((value) => ({
  value,
  label: CONTRACT_STATUS_LABEL[value],
}));
```

feature의 폼 선택지나 widget mapper의 라벨 변환에서 이 패턴을 재사용합니다.

---

## `lib/formatters/input.ts` — 입력 포맷팅 유틸

| 함수 | 용도 |
|------|------|
| `formatBusinessNumber(s)` | `'2383248234'` → `'238-32-48234'` |
| `formatPhoneNumber(s)` | `'01012345678'` → `'010-1234-5678'` |
| `stripFormatting(s)` | `'010-1234-5678'` → `'01012345678'` (API 전송 전 정규화) |
| `trimValue(s)` | 앞뒤 공백 제거 |

- 입력 필드에서 실시간 포맷팅에 사용
- feature mapper에서 API 전송 전 정규화에 사용
- widget mapper에서 테이블 표시 포맷팅에 사용

---

## `api/` — HTTP 클라이언트

```
api/
├── axios-public.ts   # 인증 불필요 요청용 (로그인 등)
├── axios-private.ts  # 인증 토큰 필요 요청용 (자동 헤더 추가)
├── index.ts
└── mocks/
    ├── browser.ts    # MSW 브라우저 워커 설정
    └── handlers/
        ├── index.ts  # 핸들러 통합
        ├── auth.ts
        ├── company.ts
        ├── contract.ts
        ├── dashboard.ts
        └── stack.ts
```

새 도메인 MSW 핸들러는 `handlers/` 하위에 도메인별 파일로 분리하고 `handlers/index.ts`에 통합합니다.
