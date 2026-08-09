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
├── index.css             # Tailwind v4 @theme inline — 디자인 토큰 정의
├── providers/
│   ├── index.ts
│   ├── app-provider.tsx  # 모든 provider를 하나로 통합
│   └── auth-provider.tsx # 인증 Context Provider
└── routes/
    ├── index.ts
    ├── app-routes.tsx    # 라우트 정의
    ├── public-route.tsx     # 미인증 전용 (로그인 페이지)
    ├── protected-route.tsx  # 인증 필요
    ├── admin-route.tsx      # 인증 + ADMIN 역할
    └── platform-route.tsx   # 인증 + 플랫폼 운영자 역할
```

---

## 인증·인가

라우트 가드는 **3단 구조**다.

```
PublicRoute      → 미인증 전용 (인증 상태면 /dashboard 로 보냄)
ProtectedRoute   → 인증 필요. MainLayout 하위 라우트를 감싼다
  ├─ AdminRoute     → 추가로 ADMIN 역할 필요 (/admin/*)
  └─ PlatformRoute  → 추가로 플랫폼 운영자 역할 필요 (/platform/*)
```

역할 상수와 판별 함수는 `entities/auth/model/roles.ts` 에 있다.

| 심볼 | 용도 |
|------|------|
| `isAdmin(role)` | tenant 관리자 여부 |
| `PLATFORM_ROLE`, `isPlatformAdmin(role)` | 플랫폼 운영자(tenant 소속 아님) 여부 |
| `toRoleLabel(role)` | 역할 → 한글 라벨 |
| `TOKEN_KEY` (`entities/auth/model/auth-context.ts`) | 액세스 토큰 저장 키 |

> 역할 union(`USER_ROLES`, `UserRole`)과 라벨맵(`USER_ROLE_LABEL`)은 공용이라
> `shared/model` · `shared/config` 에 있다.

### 레이아웃

`/platform/*` 는 `MainLayout` 이 아니라 **별도의 `PlatformLayout`** 트리를 쓴다
(플랫폼 운영자 콘솔은 tenant 사이드바 메뉴와 정보 구조가 다르다).

---

## Provider 규칙

- 새 provider는 `app-provider.tsx`에 통합
- provider 순서가 중요한 경우 (의존성) 주석으로 명시
- Context는 `entities/auth/model/` 등 해당 도메인 entity에서 정의하고, app에서는 Provider 컴포넌트만 등록
