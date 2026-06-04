# app 레이어

FSD 최상위 레이어 — 앱 초기화와 라우팅만 담당합니다.

---

## 책임 범위

- React 앱 진입점 (`main.tsx`, `App.tsx`)
- Provider 등록 및 조합 (`providers/`)
- 라우트 정의 및 가드 (`routes/`)

## 금지 사항

- 비즈니스 로직 작성 금지 — feature/entity 레이어에 위임
- 도메인 타입 정의 금지
- API 호출 직접 작성 금지

---

## 현재 구조

```
app/
├── main.tsx              # Vite 앱 진입점, MSW 초기화
├── App.tsx               # 루트 컴포넌트
├── App.css
├── index.css
├── providers/
│   ├── index.ts
│   ├── app-provider.tsx  # 모든 provider를 하나로 통합
│   └── auth-provider.tsx # 인증 Context Provider
└── routes/
    ├── index.ts
    ├── app-routes.tsx    # 라우트 정의
    ├── protected-route.tsx
    └── public-route.tsx
```

---

## Provider 규칙

- 새 provider는 `app-provider.tsx`에 통합
- provider 순서가 중요한 경우 (의존성) 주석으로 명시
- Context는 `entities/auth/model/` 등 해당 도메인 entity에서 정의하고, app에서는 Provider 컴포넌트만 등록
