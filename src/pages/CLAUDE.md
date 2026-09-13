# pages 레이어

라우트 단위 컴포넌트 — widget을 조합하는 역할만 담당합니다.

---

## 책임 범위

- 라우트 URL에 대응하는 페이지 컴포넌트
- widget 조합 및 레이아웃 배치
- 페이지 제목(`<title>`) 등 메타 설정

---

## 페이지 셸 — `PageLayout` 사용

페이지 최상단은 `@shared/ui/layout`의 `PageLayout`으로 감싼다.
제목·설명·우측 액션 슬롯과 세로 간격(`space-y-5`)을 담당한다.

```tsx
<PageLayout title="측정 계획" description="..." actions={<Button>등록</Button>}>
  <ScheduleTable />
</PageLayout>
```

### 제목 옆 동적 정보는 `subtitle`·`actions` 슬롯으로 — 데이터는 위젯이 소유한다

상세 페이지가 제목 옆에 대상 식별자·상태 배지·생애주기 버튼을 보여야 할 때, 페이지가
entity 훅으로 데이터를 받아 내려보내지 않는다. **위젯이 슬롯용 조각 컴포넌트를 export** 하고
페이지는 그것을 슬롯에 꽂기만 한다. 조각은 본문 위젯과 같은 react-query 키를 구독하므로
요청은 한 번이고, 저장·상태 변경으로 캐시가 갱신되면 제목 옆 정보도 함께 바뀐다.

```tsx
<PageLayout
  title="측정계획 상세"
  subtitle={<ScheduleProfileHeadline />}   // 측정시설명 · 접수번호 · 상태
  actions={<ScheduleProfileActions />}     // 완료·취소·삭제·재개방
  showBack backTo={backTo}
>
  <ScheduleProfile />
</PageLayout>
```

반대로 위젯이 `PageLayout` 을 렌더해 제목까지 가져가지도 않는다 — 셸의 주인은 페이지다.

### 목록에서 진입하는 페이지는 `showBack` 을 넘긴다

상세·등록 페이지는 `showBack backTo="/목록경로"` 를 넘긴다. 뒤로가기 버튼은 **모바일(md 미만)
에서만** 노출된다 — 데스크탑은 사이드바가 상시 진입점이지만 모바일은 오프캔버스라 돌아갈 UI 가 없다.

```tsx
<PageLayout title="측정계획 상세" description="..." showBack backTo="/schedule">
```

`backTo` 없이 `showBack` 만 주면 히스토리 뒤로(-1)가 되는데, URL 로 직접 열린 경우 앱 밖으로
나가므로 **목록 경로를 명시**한다. 저장 확인 등 커스텀 동작이 필요하면 `onBackClick` 을 쓴다.

### 좌우·상하 여백은 페이지가 주지 않는다

여백의 소유자는 레이아웃(`MainLayout`·`PlatformLayout`)이며 `px-4 py-6 md:px-7.5 md:py-10`로 통일되어 있다.
페이지가 `p-6` 등을 다시 걸면 **이중 패딩**이 된다.

```tsx
// ❌ 레이아웃 패딩 위에 다시 패딩
<div className="p-6 space-y-5 min-h-full">

// ✅
<PageLayout title="..." description="...">
```

모바일 여백을 좁히는 등 규격 자체를 바꿔야 하면 레이아웃을 수정한다.

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

| 그룹 / sub-domain | 라우트 | 페이지 | 가드 |
|------------------|--------|--------|------|
| `sign-in` | `/` | SignInPage | PublicRoute |
| `dashboard` | `/dashboard` | Dashboard | ProtectedRoute |
| `client/client` | `/clients` | ClientManagementPage | ProtectedRoute |
| `client/client` | `/stacks` | StackPage | ProtectedRoute |
| `client/client` | `/stacks/:stackId` | StackDetailPage | ProtectedRoute |
| `client/contract` | `/contracts` | ContractPage | ProtectedRoute |
| `client/contract` | `/contracts/register` | ContractRegisterPage | ProtectedRoute |
| `client/contract` | `/contracts/:contractId` | ContractDetailPage | ProtectedRoute |
| `client/pollutant` | `/pollutants` | PollutantPage | ProtectedRoute |
| `equipment` | `/equipment` | EquipmentPage | ProtectedRoute |
| `staff` | `/staff` | StaffPage | ProtectedRoute |
| `schedule` | `/schedule` | SchedulePage | ProtectedRoute |
| `schedule` | `/schedule/register` | ScheduleRegisterPage | ProtectedRoute |
| `schedule` | `/schedule/canceled` | CanceledSchedulePage | ProtectedRoute |
| `schedule` | `/schedule/:scheduleId` | ScheduleDetailPage | ProtectedRoute |
| `chat` | `/chat` | ChatPage | ProtectedRoute |
| `chat` | `/chat/:roomId` | ChatPage | ProtectedRoute |
| `admin/member` | `/admin/members` | AdminMemberPage | **AdminRoute** |
| `admin/document` | `/admin/documents` | AdminDocumentPage | **AdminRoute** |
| `platform/tenant` | `/platform/tenants` | PlatformTenantPage | **PlatformRoute** |
| `platform/pollutant-catalog` | `/platform/pollutant-catalog` | PlatformPollutantCatalogPage | **PlatformRoute** |

> 단일 페이지 도메인(`equipment`, `staff`, `schedule`, `chat`)은 sub-domain 폴더 없이
> 그룹 폴더 직하에 페이지를 두는 평면 배치를 허용한다. 페이지가 늘어나면 분리한다.

### 화면 높이에 맞춰야 하는 페이지 — 라우트 `handle`

채팅처럼 **스크롤이 페이지 안쪽에만 있어야 하는** 화면은 `MainLayout` 의 기본 규격
(`min-h-screen` + 넉넉한 상하 여백)과 맞지 않는다. 그렇다고 페이지가 여백을 되돌리면
"여백의 주인은 레이아웃"이라는 규칙이 깨지므로, **라우트가 규격을 선언하고 레이아웃이 읽는다.**

```tsx
<Route path="/chat" element={<ChatPage />} handle={CHAT_ROUTE_HANDLE} />  // { fill: true }
```

레이아웃 인스턴스는 하나로 둔다 — 별도 레이아웃 라우트를 만들면 사이드바가 새 트리로
리마운트되어 펼쳐 둔 메뉴가 접히고 전환이 깜빡인다. 타입은
`widgets/layouts/route-handle.ts` 의 `MainRouteHandle` 이다.
