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
  - 불가피하게 페이지 레벨에서 여러 feature hook을 조합해야 할 경우 `model/` 폴더에 page-scoped hook으로 분리

---

## pages/model 배치 기준

`model/` 폴더에는 page-scoped coordinator 훅 외에 **이 페이지에서만 쓰이는 선택 훅**도 위치할 수 있다.

### 선택 훅(selection hook) 배치 판단

선택 훅을 `features/select-xxx`로 분리하려면 **여러 페이지에서 실제로 재사용**되어야 한다.
한 페이지에서만 쓰인다면 `pages/<sub-domain>/model/`에 두는 것이 적절하다.

```
# ✅ 재사용 없음 → pages/model에 배치
pages/client/client/model/
├── use-client-management.ts   # coordinator
├── use-client-selection.ts    # 이 페이지 전용 선택 훅
└── use-workplace-selection.ts # 이 페이지 전용 선택 훅

# ✅ 여러 페이지에서 재사용 → features에 배치
features/select-client/
└── hooks/use-client-selection.ts
```

재사용 계획이 없는 시점에 features 슬라이스로 미리 분리하는 것은 과설계다.
실제 재사용 시점에 features로 승격한다.

---

## 폴더 구조 원칙

### 슬라이스 단위 = sub-domain

`client/`, `contract/` 등 **sub-domain이 독립 슬라이스**이며, 각자 `index.ts`를 보유합니다.
도메인 그룹 폴더(`client/`)는 라우팅 네임스페이스 역할만 하며, `index.ts`에서 sub-domain을 re-export만 합니다.

```
client/
├── index.ts          # export * from "./client"; export * from "./contract"; ...
├── client/
│   ├── index.ts      # sub-domain public API
│   └── ...
├── contract/
│   ├── index.ts
│   └── ...
└── pollutant/
    ├── index.ts
    └── ...
```

### 신규 도메인 추가

`client/`의 형제 레벨로 독립 추가. 기존 도메인 그룹 폴더에 밀어넣지 않는다.

```
pages/
├── client/       ← 기존
├── dashboard/
├── measurement/  ← 신규 도메인
└── report/       ← 신규 도메인
```

---

## 페이지 복잡도별 파일 구조

### 단순 페이지 — widget 조합만

```
sub-domain/
└── SimplePage.tsx
```

### 중간 복잡도 — sub-domain 내 페이지들이 coordinator hook 공유

```
sub-domain/
├── index.ts
├── PageA.tsx
├── PageB.tsx
└── model/
    └── use-sub-domain-coordinator.ts
```

### 고복잡도 — 탭·서브뷰 등 페이지 자체가 복잡할 때

페이지를 자체 폴더로 승격한다. **승격 기준: 전용 `model/` 또는 `ui/`가 생길 때.**

```
sub-domain/
└── complex-page/
    ├── index.ts          # 선택적
    ├── ComplexPage.tsx
    ├── model/
    │   └── use-complex-page.ts
    └── ui/
        ├── TabA.tsx
        └── TabB.tsx
```

---

## 현재 페이지 목록

| sub-domain | 라우트 | 페이지 |
|------------|--------|--------|
| `client/client` | `/clients` | ClientManagementPage |
| `client/client` | `/stacks` | StackPage |
| `client/client` | `/stacks/:stackId` | StackDetailPage |
| `client/contract` | `/contracts` | ContractPage |
| `client/contract` | `/contracts/register` | ContractRegisterPage |
| `client/contract` | `/contracts/:contractId` | ContractDetailPage |
| `client/pollutant` | `/pollutants` | PollutantPage |
| `dashboard` | `/dashboard` | Dashboard |
| `sign-in` | `/` | SignInPage |
