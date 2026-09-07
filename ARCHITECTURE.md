# Architecture — ems-web

Feature-Sliced Design (FSD) 아키텍처 문서입니다.

---

## 레이어 구조

```
src/
├── app/          # 앱 진입점, providers, routes
├── pages/        # 페이지 컴포넌트 (라우트 단위)
├── widgets/      # 독립적인 복합 UI 블록
├── features/     # 사용자 시나리오, 비즈니스 액션
├── entities/     # 비즈니스 엔티티 (도메인 타입 + API + 상태)
├── shared/       # 재사용 가능한 공통 모듈
│   ├── api/      # axios 인스턴스, MSW 핸들러, blob 에러 처리
│   ├── config/   # 공통 레이블맵(labels.ts), 공통 상수(constants.ts)
│   ├── lib/      # 유틸리티 (format/, string/, file/)
│   ├── model/    # 공통 타입·상수(types/), 공통 훅(hooks/)
│   └── ui/       # 공통 UI 컴포넌트 (20개 카테고리)
│       ├── accordion/   ├── layout/
│       ├── badges/      ├── links/
│       ├── borders/     ├── nav/
│       ├── buttons/     ├── pagination/
│       ├── cards/       ├── primitives/
│       ├── dialogs/     ├── semantics/
│       ├── feedback/    ├── sidebar/
│       ├── form/        ├── skeletons/
│       ├── table/       ├── tabs/
│       ├── theme/       └── toasts/
├── components/   # shadcn/ui CLI 자동 생성 경로 (FSD 예외 허용)
└── lib/          # shadcn/ui 유틸 (cn 함수 등) (FSD 예외 허용)
```

> `src/components/`와 `src/lib/`는 shadcn/ui CLI가 자동 생성하는 표준 경로로, FSD 규칙 예외를 허용합니다.

---

## 핵심 FSD 규칙

### Import 방향 (엄격 적용)

```
app → pages → widgets → features → entities → shared
```

- 상위 레이어는 하위 레이어만 import 가능
- **같은 레이어 간 직접 import 금지** (shared 제외)
- `@/components/ui/*`는 shadcn/ui 원본 컴포넌트(`src/components/`)에서만 직접 참조 허용
- 비즈니스 로직 코드(features, widgets 등)에서는 `@shared/ui/*`를 통해 사용

### Public API

- 각 슬라이스는 `index.ts`를 Public API로 사용
- 슬라이스 외부에서는 `index.ts`를 통해서만 import하며, 내부 구현 경로에는 의존하지 말 것

---

## 현재 구현된 슬라이스

| 레이어 | 개수 | 슬라이스 |
|--------|------|---------|
| pages | 8 그룹 / 라우트 19개 | `sign-in`, `dashboard`, `client`(하위 `client`·`contract`·`pollutant`), `equipment`, `schedule`, `staff`, `admin`(하위 `member`·`document`), `platform`(하위 `tenant`·`pollutant-catalog`) |
| widgets | 22 | `sign-in`, `layouts`, `metrics`, `dashboard-stats`, `dashboard-alerts`, `client-table`, `workplace-table`, `stack-table`, `stack-list-table`, `stack-profile`, `contract-table`, `pollutant-table`, `pollutant-catalog-table`, `document-table`, `equipment-table`, `member-table`, `team-table`, `team-schedule-table`, `schedule-table`, `canceled-schedule-table`, `schedule-profile`, `tenant-table` |
| features | 45 | `sign-in`, `sign-out`, `dashboard-summary`, `provision-tenant`, `record-inspection`, `download-document`, `add-document-version`, `delete-document-version`, `export-schedule-report`, `manage-schedule-lifecycle`, `save-schedule-sheets`, `save-schedule-analysis`, `register-*`(client·workplace·stack·contract·pollutant·pollutant-catalog·facility·prevention·stack-pollutant·document·equipment·member·schedule·team), `update-*`(client·contract·workplace·stack·stack-pollutant·facility·prevention·document·equipment·member·pollutant·pollutant-catalog·team·schedule-basic-info·schedule-client·schedule-equipments·schedule-item·schedule-items·schedule-stack) |
| entities | 16 | `auth`, `client`, `workplace`, `stack`, `stack-pollutant`, `contract`, `dashboard`, `pollutant`, `pollutant-catalog`, `document`, `equipment`, `measurement-record`, `member`, `schedule`, `team`, `tenant` |
| shared | — | `api`, `config`, `lib`, `model`, `ui` |

> 슬라이스가 추가·삭제되면 이 표를 갱신한다. 개수는 `ls -1 src/<레이어> | grep -v CLAUDE.md | wc -l` 로 실측한다.

---

## 슬라이스 표준 내부 구조

```
slice-name/
├── index.ts       # Public API (필수 — 외부 노출은 여기서만)
├── ui/            # UI 컴포넌트 (컴포넌트 파일은 반드시 ui/ 안에)
├── model/         # 비즈니스 도메인 타입, state, hook, types
├── api/           # API 호출 함수 + DTO
├── lib/           # 순수 유틸리티 (mapper, formatter, validator 등)
├── config/        # 슬라이스 전용 설정값 (constants, routes 등)
└── assets/        # 슬라이스 전용 리소스
```

레이어마다 필요한 서브디렉토리만 포함합니다 (모두 필수는 아님).

---

## 레이어별 책임 요약

| 레이어 | 책임 |
|--------|------|
| app | 앱 초기화, provider 등록, 전역 설정, 라우트 구성 |
| pages | 라우트 단위 화면 — widget/feature/entity를 조합 |
| widgets | 여러 entity/feature를 조합하는 복합 UI 블록 |
| features | 사용자 시나리오 — 폼 상태, 제출 로직, 선택/액션 처리 |
| entities | 도메인 모델 — 타입, 표시용 UI, 도메인 API, 데이터 조회 훅 |
| shared | 비즈니스 무관 재사용 유틸, UI 기본 요소 |

---

## 데이터 흐름 패턴

> **서버 상태는 `@tanstack/react-query` 가 소유한다.** 조회 결과는 쿼리 캐시에 담기고,
> 갱신은 mutation 의 키 무효화로 전파된다. 규약은
> [src/entities/CLAUDE.md](./src/entities/CLAUDE.md) 의 "훅 패턴" 참조.

### 데이터 조회 (테이블 표시)

```
shared/api (axios) + shared/api/query-client (캐시·재시도 정책)
  → entities/*/api (도메인 API 호출)
  → entities/*/model/query-keys (쿼리 키)
  → entities/*/model (useXxx 훅 — useEntityQuery 어댑터)
  → widgets/*/model/mapper (Entity → TableRow 변환)
  → widgets/*/ui (테이블 렌더링)
```

같은 키를 여러 슬라이스에서 구독해도 **요청은 한 번만** 나간다(중복 요청 합치기).

### 데이터 등록·수정·삭제 (폼 제출)

```
features/*/ui (폼 입력)
  → features/*/model (폼 상태, 검증, 제출 로직, toast·모달 닫기)
  → features/*/model/mapper (Form → 도메인 입력 모델 변환)
  → entities/*/model (useXxxAction 훅 — useEntityMutation 어댑터)
  → entities/*/api (도메인 API 호출)
  → 성공 시 자기 도메인 키 무효화 → 그 키를 구독하는 화면이 저절로 갱신된다
```

**feature 는 목록을 다시 읽지 않는다.** 예전의 `onSuccess={refetch}` 배선은 없어졌다.
슬라이스를 넘는 갱신(의뢰기관 → 사업장)만 page 가 콜백으로 잇는다.

### 저장 결과를 그 자리에서 대조해야 할 때

```
features/save-schedule-sheets (409 충돌 복구)
  → entities/schedule (useFetchScheduleDetail — queryClient.fetchQuery)
  → 선언형 훅과 같은 쿼리 정의를 공유하므로 같은 캐시를 본다
```

### 상수/레이블 사용

```
shared/model/types/common-types (공통 enum/type)
  → shared/config/labels (공통 레이블맵)
  → features/*/model (폼 선택지 생성)
  → widgets/*/model/mapper (표시 라벨 변환)
```

---

## FSD 준수 현황

정기 점검 기준(최종 확인: Phase 1~3 정리 완료 시점):

| 항목 | 상태 |
|------|------|
| 레이어 단방향 의존성 위반 | **0건** |
| 슬라이스 간 cross-import (같은 레이어) | **0건** |
| `index.ts` 없는 슬라이스 | **0건** |
| 비즈니스 레이어의 `@/components/ui/*` 직접 import | **0건** (`src/shared/ui/` 래퍼 경유) |
| API 함수 네이밍(`get~`) | 전수 준수 |

### 남은 개선 항목

| 위치 | 문제 | 개선 방향 |
|------|------|-----------|
| `entities/auth/index.ts` | `SignInRequest`/`SignInResponse` DTO 를 public API 로 노출 | auth 액션 훅을 만들어 DTO 노출 제거 |
| `entities/dashboard` | `model/` 자체가 없어 DTO 4종을 그대로 노출 | `model/types.ts` + 페칭 훅 신설 |
| `features/{sign-in,sign-out}` | `entities/*/api/api.ts` 직접 호출 (entity 훅 부재가 원인) | 위 두 항목 해소 시 함께 정리 |
| `features/{sign-in,sign-out}` | 훅이 슬라이스 루트 `hooks/` 에 위치 | `model/hooks/` 로 이동 |
| `src/shared/ui/*`, `src/widgets/schedule-profile/**` | `@/lib/utils` 의 `cn` 직접 사용 | shadcn 관행으로 인정할지 `@shared/lib` 로 이전할지 미결정 |
| `src/components/variants/buttonVariants.ts` | `shared/ui/buttons/button-variants.ts` 와 중복 | `components/ui/button.tsx` → `sheet`/`dialog`/`sidebar` 체인과 함께 정리 |
