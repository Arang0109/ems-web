# pages 레이어

라우트 단위 컴포넌트 — widget을 조합하는 역할만 담당합니다.

---

## 책임 범위

- 라우트 URL에 대응하는 페이지 컴포넌트
- widget 조합 및 레이아웃 배치
- 페이지 제목(`<title>`) 등 메타 설정

## 금지 사항

- 비즈니스 로직 작성 금지 — feature 훅에 위임
- API 호출 직접 작성 금지 — entity 훅에 위임
- feature나 entity를 페이지에서 직접 import 하는 것 지양 (widget에서 조합)

---

## 현재 페이지

| 슬라이스 | 경로 | 설명 |
|---------|------|------|
| `sign-in` | `/sign-in` | 로그인 페이지 |
| `dashboard` | `/dashboard` | 대시보드 |
| `client` | `/client/*` | 고객사 관리 (회사/사업장/스택/계약) |

---

## 파일 구조

```
page-name/
├── index.ts          # Public API
└── PageName.tsx      # 페이지 컴포넌트 (단일 파일)
```

페이지가 복잡하면 복수 파일 허용 (예: `client/` — `ClientManagementPage.tsx`, `ContractPage.tsx`, `ContractRegisterPage.tsx`).
