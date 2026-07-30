# 디자인 시스템

피그마에 정의된 디자인 시스템을 코드 토큰으로 옮기고, shadcn/ui(Base UI) 의존을 걷어내는 작업의 기록.

> 최종 갱신: 2026-07-29

---

## 설계 원칙

### 1. 토큰은 2단 구조

```
[원시 팔레트]  --brand-primary, --ink, --rule ...   ← 피그마와 1:1. 영속 레이어
      ↓ 참조
[shadcn shim]  --primary, --foreground, --border ... ← shadcn 제거 시 함께 사라질 레이어
```

피그마 값이 바뀌면 원시 팔레트만 고친다. shadcn을 걷어낼 때는 shim 블록만 삭제한다.
원시 팔레트는 `@theme` 에도 등록되어 `bg-canvas`, `text-ink-soft`, `border-rule-dark` 같은
유틸리티로 바로 쓸 수 있다. **신규 코드는 shim(`bg-background`)이 아니라 팔레트 이름을 쓴다.**

### 2. shadcn ≠ Base UI

- **shadcn 스타일 레이어** — cva 클래스와 마크업. 걷어내는 대상.
- **Base UI(`@base-ui/react`) 동작 레이어** — 포커스 트랩, 키보드 내비게이션, 팝오버 포지셔닝, ARIA.
  **유지한다.** 직접 구현하면 접근성 회귀 위험이 크다.

### 3. shadcn 접점은 `shared/ui` 로만

비즈니스 코드(features/widgets/pages)에서 `@/components/ui/*` 를 직접 import 하지 않는다.
현재 **위반 0건**. 덕분에 앞으로의 교체는 `shared/ui` 내부만 고치면 앱 전체가 따라온다.

---

## 토큰 레퍼런스

정의 위치: **`src/app/index.css`** (이 파일 하나가 디자인 시스템의 단일 출처)

### 컬러

| 그룹 | 토큰 | 값 | 용도 |
|---|---|---|---|
| Brand | `--brand-primary` | `#239861` | Primary action · Selected — **면(fill) 전용** |
| | `--brand-dark` | `#197347` | **밝은 배경 위 글씨·아이콘** |
| | `--brand-soft` | `#edf8f2` | Selected background |
| Neutral | `--canvas` | `#f7f8f8` | App background |
| | `--surface` | `#ffffff` | Panel · Field |
| | `--ink` | `#161b22` | Primary text |
| | `--ink-soft` | `#4b5563` | Secondary text |
| | `--muted-ink` | `#8b95a1` | Caption · Hint |
| | `--rule` | `#e5e9e7` | Divider · Border |
| | `--rule-dark` | `#d7ddda` | 입력 테두리 · Strong divider |
| Status | `--danger` | `#e5484d` | Delay · Error |
| | `--danger-soft` | `#fff0f1` | Error background |
| | `--warning` | `#f59e0b` | Attention |
| | `--warning-ink` | `#a45108` | Warning text · Icon |
| | `--warning-soft` | `#fff7e6` | Warning background |

> **Primary 는 면, Dark 는 글씨.** 피그마 라벨(Dark="Hover")과 다르게 쓴다.
> Primary 글씨는 흰 배경에서 3.44:1 이라 읽기 어렵고, Dark 는 5.86:1 로 편하다.

**대비 검증 (WCAG 2.1)** — 사용자 결정에 따라 **값 조정은 하지 않음**. 기록용.

<details>
<summary>미달 항목</summary>

| 조합 | 대비 | 기준 |
|---|---|---|
| Primary + 흰 글씨 | 3.66:1 | 본문 4.5 미달 |
| Primary 글씨 on Canvas | 3.44:1 | 4.5 미달 |
| Muted on Surface | 3.04:1 | 4.5 미달 |
| Danger 글씨 on Surface | 3.91:1 | 4.5 미달 |
| Rule 테두리 | 1.23:1 | UI 경계 3:1 미달 |
| Rule Dark 테두리 | 1.38:1 | UI 경계 3:1 미달 |

통과: Ink 17.30 / Warning+Ink 8.05 / Ink Soft 7.56 / **Dark 5.86** / Warning Ink 5.59 / Dark on Soft 5.39
</details>

### 타이포그래피

유틸리티 하나가 **size·line-height·letter-spacing·weight 4개 속성**을 모두 적용한다.
`font-*` 를 덧붙일 필요가 없다(필요하면 개별 항목만 덮어쓸 수 있다).

| 유틸리티 | Size | LH | LS | Weight | 용도 |
|---|---|---|---|---|---|
| `text-display` | 32px | 1.2 | -0.05em | 700 | 페이지 인트로 |
| `text-h1` | 25px | 1.2 | -0.03em | 700 | 페이지 제목 |
| `text-h2` | 21px | 1.35 | -0.02em | 700 | 섹션 제목 |
| `text-h3` | 18px | 1.35 | -0.02em | 600 | 패널 제목 |
| `text-body-1` | 14px | 1.4 | -0.02em | 700 | 사이드 메뉴 선택 |
| `text-body-2` | 14px | 1.4 | -0.02em | 400 | 설명 · 본문 |
| `text-body-3` | 13px | 1.4 | -0.03em | 400 | 폼 · 테이블 본문 |
| `text-body-4` | 13px | 1.4 | -0.03em | 600 | 버튼 |
| `text-label` | 12px | 1.4 | -0.03em | 600 | 폼 · 테이블 제목 |
| `text-caption` | 11px | 1.4 | -0.02em | 400 | 보조 정보 |

> 피그마의 `%` 단위는 무손실 변환된다 (letter-spacing % = em, line-height % = 비율).
> **스펙에 weight 500(`font-medium`)은 없다.** 400 / 600 / 700 만 쓴다.

### 간격

**Tailwind 기본 스케일과 정확히 일치하므로 별도 토큰이 없다.**
4px 기본 단위: `1`=4px `2`=8px `3`=12px `4`=16px `5`=20px `6`=24px `8`=32px `10`=40px

4px 그리드를 벗어난 `gap-0.5`(2px) `py-1.5`(6px) `px-2.5`(10px) 37곳은 **의도적으로 유지**한다.
아이콘·뱃지 내부 간격에 실질적으로 필요하고, 4px로 올리면 조밀한 UI가 헐거워진다.

### 코너 반경

용도로 이름 붙인다. t-shirt 사이즈(`rounded-md` 등)는 shadcn shim 전용.

| 유틸리티 | 값 | 용도 |
|---|---|---|
| `rounded-row-action` | 5px | 테이블 행 액션 *(아직 사용처 없음)* |
| `rounded-button` | 6px | 버튼 |
| `rounded-nav` | 8px | 내비게이션 · 폼 그룹 박스 |
| `rounded-icon-tile` | 10px | 아이콘 타일 · 소형 카드 |
| `rounded-panel` | 11px | 패널 · 카드 |
| `rounded-dialog` | 13px | 다이얼로그 |
| `rounded-full` | — | count 뱃지 · 아바타 |

`--radius: 11px`(panel)로 두면 shadcn 내부 계산식이 저절로 맞는다:
`calc(var(--radius) - 5px)` → 6px(button), `min(var(--radius-md), 8px)` → 6px(button).

---

## 컴포넌트

### 자체 구현 (shadcn 의존 없음)

| 컴포넌트 | 위치 | 비고 |
|---|---|---|
| `Button` | `shared/ui/buttons/Button.tsx` | 순수 `<button>` + cva. 7개 상태 |
| `IconButton`, `DetailViewButton` | `shared/ui/buttons/` | 위 Button 조합 |
| `Badge` | `shared/ui/badges/Badge.tsx` | pill. 5개 톤 |
| `StatusDot` | `shared/ui/badges/StatusDot.tsx` | 운영 상태 — 점 + 텍스트 |
| `Toaster` | `shared/ui/toasts/Toaster.tsx` | sonner 래퍼 |

**Button variant** (이름은 기존 호출부 호환을 위해 유지)

| 피그마 | variant | 스타일 |
|---|---|---|
| PRIMARY | `default` | `bg-brand-primary text-surface` → hover `bg-brand-dark` |
| DEFAULT | `outline` | `bg-surface border-rule text-ink` → hover `bg-brand-soft` |
| SELECTED | `selected` | `bg-brand-soft border-brand-primary text-brand-dark` |
| DESTRUCTIVE | `destructive` | `bg-surface border-danger text-danger` → hover `bg-danger-soft` |
| ICON ONLY | `outline` + `size="icon"` | — |
| FOCUS / DISABLED | base 상태 | 초록 링 / 회색 면 |

**상태 톤** (`shared/ui/badges/tones.ts`) — 도메인 variant 가 아니라 의미 톤으로 표현한다.

| 톤 | 피그마 | 색 |
|---|---|---|
| `pending` | 예정 | Ink |
| `progress` | 진행 중 | brand |
| `done` | 완료 | muted |
| `danger` | 지연 | danger |
| `warning` | 확인 필요 | warning |

> **"상태는 텍스트와 점을 함께 표시하고, 색상만으로 구분하지 않습니다."**
> `StatusDot` 은 `label` 을 필수 prop 으로 두어 이 원칙을 타입으로 강제한다.
> 같은 톤을 여러 상태가 공유해도 무방하다 (측정중·분석중은 둘 다 `progress`).

### shadcn 이관분 — `shared/ui/primitives/`

Base UI 를 쓰지 않는 순수 마크업 컴포넌트. **비즈니스 코드에서 직접 쓰지 말 것.**

`Field` `InputGroup` `Table` `Pagination` `Calendar` `Label` `Textarea`

### 잔존 shadcn — `src/components/ui/` (13개 · 1,635줄)

| 파일 | 줄 | Base UI 의존 |
|---|---|---|
| `sidebar` | 721 | merge-props, use-render |
| `select` | 199 | select |
| `dialog` | 155 | dialog |
| `sheet` | 135 | dialog |
| `popover` | 88 | popover |
| `tabs` | 80 | tabs |
| `tooltip` | 66 | tooltip |
| `radio-group` | 36 | radio, radio-group |
| `checkbox` | 27 | checkbox |
| `separator` | 25 | separator |
| `button` | 23 | button |
| `input` | 20 | input |
| `skeleton` | 13 | — |

> `sheet` `tooltip` `skeleton` `button` `input` `separator` 는 **전부 `sidebar.tsx` 가 물고 있다.**
> sidebar 하나를 처리하면 6개가 함께 풀린다.

---

## 완료된 작업

| 단계 | 내용 |
|---|---|
| 1 | **컬러 토큰** — oklch 기본 팔레트 → 피그마 브랜드 팔레트. 2단 구조 도입 |
| 2 | **폰트** — Noto Sans → Pretendard(dynamic-subset). `body` font-family 버그 수정 |
| 3 | **타이포그래피** — 10단계 스케일 등록, 167곳 치환 (`font-medium` 60곳 재배정 포함) |
| 4 | **간격·코너** — 코너 6토큰 신설 + shim 재지정, 36곳 치환. 간격은 변경 없음 |
| 5 | **버튼** — 자체 Button 구현, shadcn Button 직접 import 7곳 전환 |
| 6 | **배지·상태** — 톤 체계 도입, `Badge`·`StatusDot` 자체 구현, `BadgeWithIcon` 삭제 |
| 7 | **shadcn 제거 1~3단계** — 4개 삭제 · 접점 격리 · 7개 이관. `components/` 2,927 → 1,635줄 |

### 고친 버그

- **`index.css` 의 `body { font-family }` 가 `html` 의 `font-sans` 를 덮어써 웹폰트가 미적용이던 문제.**
  Noto Sans 를 로드만 하고 실제로는 Segoe UI 가 렌더링되고 있었다. 재발 방지 주석을 달았다.
- `@layer base` 가 두 번 중복 선언되어 `html { @apply font-sans }` 가 이중 적용되던 문제.
- `IconButton` 의 수동 variant 타입 목록에 실재하지 않는 `secondary` 가 남아 있던 문제
  (`VariantProps` 파생으로 교체).

### 해소한 컨벤션 위반

`CLAUDE.md` 의 "알려진 위반 사항"에 등재돼 있던 `@/components/ui/*` 직접 import 4건
(`SignInForm` `SocialSignIn` `RegisterClientForm` `RegisterPollutantForm`) 전부 해소.

---

## 앞으로의 작업

### 1순위 — 이미 결정됐으나 미실행

**다크모드 제거** (라이트 전용으로 가기로 결정)
- `index.css` 의 `.dark` 블록 · `@custom-variant dark` 삭제
- `app-provider.tsx` 의 `ThemeProvider` 제거
- `shared/ui/theme/ThemeToggle.tsx` 삭제 (사용처: `SidebarUserFooter` 1곳)
- `shared/ui/toasts/Toaster.tsx` 의 `useTheme()` → `theme="light"` 고정
- `dark:` variant 제거 — **20개 파일**
- `package.json` 의 `next-themes` 제거
- ⚠️ 현재 다크 토글을 누르면 구 shadcn neutral 팔레트가 나온다. `defaultTheme="light"` 라 기본 사용엔 영향 없음

**하드코딩 팔레트 직색 치환 — 62곳** (Success/Info 는 브랜드 초록으로 통합하기로 결정)
- `widgets/metrics/SummaryCards.tsx` — 카드 색상 스킴. 대표 지표 1장만 초록, 나머지 중성
- ~~`widgets/metrics/MeasurementChart.tsx`~~ — **완료.** 피그마 차트 디자인 적용과 함께
  `#6366f1` 하드코딩을 걷어내고 `var(--chart-1)`·`var(--ink)`·`var(--rule)` 로 전환
- `widgets/contract-chart/ContractChart.tsx`
- `shared/ui/cards/SummaryCard.tsx` — default prop 의 파랑
- `widgets/stack-table` · `workplace-table` — 선택 항목 강조 파랑

### 2순위 — shadcn 제거 4단계

`sidebar`(721줄)를 중심으로 13개 처리. Base UI 는 유지하고 스타일 레이어만 벗긴다.
`shared/ui/primitives/field.tsx`·`input-group.tsx` 가 아직 참조하는 `separator`·`input` 도 여기서 해소된다.

### 3순위 — 미결정 사항

| 항목 | 선택지 |
|---|---|
| **사이드바 메뉴 글꼴** | `text-body-1`(14/700, 스펙) / `font-semibold`(14/600, 요청) / 활성 항목만 강조 |
| **`IconButton` 기본 variant** | `ghost`(현재, 테두리 없음) / `outline`(피그마 ICON ONLY) — 테이블 행 12곳에 영향 |
| **차트 시리즈 색상** | `--chart-2~5` 가 잠정값. `ContractChart` 가 다계열이면 초록 단색으로 구분 불가 |
| **`Danger Ink` 신설** | Warning 에는 텍스트용 `#a45108` 이 있으나 Danger 에는 없음 |

### 4순위 — 정리

- **`src/app/App.css` 삭제** — Vite 스캐폴딩 잔재, import 되는 곳 0건
- **전역 `* { user-select: none }`** (`index.css`) 재검토 — 테이블 값 복사가 전부 막혀 있다
- **`계약 상태` 배지 적용** — `CONTRACT_STATUS_LABEL`(정상/만료 임박/만료)이 라벨맵만 있고
  테이블에서 문자열 그대로 렌더된다. 피그마의 "만료 임박" 배지가 갈 자리
- **폼 입력 글씨 16px 문제** — shadcn `input`/`textarea` 가 `text-base`.
  스펙상 폼 본문은 Body 3(13px)이라 라벨(12px)과 입력값(16px) 사이가 어색하다. 4단계에서 해소
- **기존 타입 오류 8건** — `features/update-schedule-client/model/mapper.ts` 의
  `ScheduleClientUpdateForm` 속성 불일치. 디자인 작업과 무관하며 커밋 `2088422` 이전부터 존재.
  이 상태로는 `npm run build` 가 실패한다

---

## 작업 시 참고

### 검증 명령

```bash
npx tsc -b        # 타입 체크 (--noEmit 은 검사 파일이 0개라 항상 통과 — 쓰지 말 것)
npx vite build    # CSS 생성 확인
```

새 토큰을 등록했을 때 유틸리티가 실제로 생성되는지 확인하려면, 임시 프로브 파일에
클래스를 나열하고 빌드한 뒤 산출 CSS 를 grep 한다 (확인 후 프로브는 삭제).
Tailwind 는 소스에서 발견된 클래스만 생성하므로, 미사용 토큰은 CSS 에 나타나지 않는다.

### 피그마 값 수령

정확도 순서: **Variables JSON export > 텍스트 > 스크린샷**.
스크린샷은 압축 때문에 색상 hex 를 정확히 읽을 수 없다. 레이아웃·상태 확인용으로는 유용하다.
