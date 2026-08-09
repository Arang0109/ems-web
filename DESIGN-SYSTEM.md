# 디자인 시스템

피그마에 정의된 디자인 시스템을 코드 토큰으로 옮기고, shadcn/ui(Base UI) 의존을 걷어내는 작업의 기록.

> 최종 갱신: 2026-07-30

---

## 피그마 출처

Figma MCP 로 직접 조회한다. **레이어 이름으로 찾지 말고 노드 ID 로 접근한다** —
섹션 03·04·05 의 레이어 이름이 전부 `Section - Space / Round` 로 중복돼 있다.

- **fileKey** : `JUsYqubPZugaaM0ErbsGe5` (파일명 "민수님 외주", 단일 페이지 `0:1`)
- **Design System 프레임** : `7:6901`

| 노드 | 섹션 |
|---|---|
| `7:6921` | 01 컬러 |
| `7:7828` | 02 타이포 |
| `7:8468` | 03 간격과 코너 |
| `7:9592` | 04 아이콘과 버튼 상태별 컴포넌트 |
| `7:9788` | 05 데이터 입력 및 테이블 |

그 외 참고 섹션 — `9:2723` 아이콘 목록, `11:4620` Input, `44:4288` Aside(사이드바).

**화면 시안**

| 노드 | 화면 | 비고 |
|---|---|---|
| `247:5214` | 측정계획 상세_MO | 모바일(390px) 기준. 데스크탑 시안 없음 → 파생 규칙은 아래 참조 |
| `541:11826` | 측정계획-측정장비_MO | 장비별 접이식 카드 + 라벨/값 행. 다중값(피토관 계수·노즐 직경)은 Soft 칩 |
| `541:12556` | 측정계획-측정정보_MO | 사전정보·의뢰기관·측정시설·측정항목 4개 카드. 측정항목은 주기별 상자 + 오염물질 칩(현재=Soft 면·브랜드 테두리) |

> 측정계획 상세는 **현장 입력 화면이라 모바일이 1순위**다(피그마 메모 `43:2604`).
> 데스크탑은 모바일 시안에서 파생한다 — 입력 48px→38px, 버튼 44px→36px,
> 필드 1열→`md:` 2열→`xl:` 3열, 카드 패딩 16px→20px.

> 컬러·타이포는 피그마 **Variables** 로 등록돼 있어 `get_variable_defs` 로 정확한 값을 받을 수 있다.
> 간격·코너·컴포넌트 치수는 변수가 아니므로 섹션 본문 설명문과 노드 width/height 로 확인한다.

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

> ✅ **2026-07-30 피그마 대조 완료** — Figma Variables 및 03 섹션 노드 치수와 1:1 검증.
> 컬러 15개 · 타이포 10단계(size·line-height·letter-spacing·weight) · 간격 space-1~10 · 코너 6토큰+full
> **전부 일치**. 아래 표의 값은 추정이 아니라 검증된 값이다.
> 단, `--chart-2~5` 는 피그마에 정의가 없는 **잠정값**으로 남아 있다(3순위 참조).

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

### 그림자

| 유틸리티 | 값 | 용도 |
|---|---|---|
| `shadow-panel` | `0 2px 8px 0 rgba(18,31,24,.06)` | 섹션 카드 · 패널의 기본 입체감 |

Tailwind 기본 `shadow-sm` 대신 이 값을 쓴다 (피그마 카드 그림자와 1:1).

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
| `Tabs` | `shared/ui/tabs/Tabs.tsx` | 언더라인형. Base UI `tabs` 직접 사용 (shadcn 래퍼 미경유) |
| `SectionAccordion` | `shared/ui/accordion/SectionAccordion.tsx` | 섹션 카드 — 제목 + 진행도 배지 + 접이식 본문. 제어/비제어 모두 지원 |
| `SubAccordion` | `shared/ui/accordion/SubAccordion.tsx` | 섹션 안의 중첩 그룹 (`bg-canvas`) |
| `UnitField` | `shared/ui/form/UnitField.tsx` | 라벨 + 입력(+단위 박스) + 완료 체크 + 보조 행. Select 모드 지원 |
| `CalcResultRow` | `shared/ui/form/CalcResultRow.tsx` | 자동계산 결과 행 (좌 라벨 / 우 값+단위) |
| `DetailRow` | `shared/ui/form/DetailRow.tsx` | 읽기 전용 상세 행 (좌 라벨 / 우 값 + 하단 구분선). MO 48px → 데스크탑 38px |
| `ChipNav` | `shared/ui/nav/ChipNav.tsx` | 가로 스크롤 pill 칩 — 긴 폼의 섹션 바로가기 |
| `StickyActionBar` | `shared/ui/layout/StickyActionBar.tsx` | 하단 고정 액션 바 (블러 + 상단 구분선) |

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
>
> `tabs` 는 **사용처가 0이다** — `shared/ui/tabs/Tabs.tsx` 가 Base UI `tabs` 를 직접 쓰도록 바뀌었다.
> 파일만 삭제하면 되며, 삭제 시 12개 · 1,555줄이 된다.

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
| 8 | **피그마 MCP 대조** — 토큰 전부 일치 확인, 컴포넌트 치수·상태 스펙 정합 (아래) |

### 8단계 — 컴포넌트 치수·상태 스펙 정합 (2026-07-30)

피그마 **Variables 로는 잡히지 않는** 값들이다. 04·05 섹션 본문 설명문과 노드 width/height 가 출처다.

| 스펙 | 피그마 | 이전 | 반영 위치 |
|---|---|---|---|
| 입력 필드 높이 | 38px | `h-9`(36) | `components/ui/input.tsx` · `select.tsx` · `primitives/InputGroup.tsx` |
| 폼 본문 글씨 | Body 3 (13px) | `text-base md:text-sm` | 위 3개 + `primitives/Textarea.tsx` |
| 포커스 링 | 브랜드 초록 **12%** | `/50` · `/25` | 위 + `checkbox.tsx` · `radio-group.tsx` |
| Read-only 면 | 회색 | 스타일 없음 | `input.tsx` · `Textarea.tsx` (`read-only:bg-canvas`) |
| 테이블 헤더 행 | 42px | `h-10`(40) | `primitives/Table.tsx` |
| 테이블 본문 행 | 52px | 패딩 의존(~34) | `primitives/Table.tsx` `py-2` + `BasicTable.tsx` `h-[52px]` |
| 페이지네이션 | 28px 정사각 · 아이콘 12px | 36px · 16px | `primitives/Pagination.tsx` |
| 현재 페이지 | PRIMARY(초록 면) | `outline`(흰 면) | `primitives/Pagination.tsx` |
| 하단 바 | 높이 28px · 표와 간격 10px | `py-1` | `table/TableFooterBar.tsx` |

- 헤더 텍스트의 `uppercase`·`tracking-wide` 제거 — 한글 헤더에 무의미하고 `text-label` 의 `-0.03em` 을 덮어썼다.
  피그마 헤더 행 변수는 `Neutral_Ink Soft` + `Label_SBold`(12/600) + Canvas 면 + Rule Dark 선으로,
  나머지는 이미 일치했다.
- `Pagination` 은 `variant` prop 을 받도록 바꿨다. 이전·다음은 아이콘 전용 정사각이 되어
  `이전`/`다음` 텍스트를 `sr-only` 로 옮겼다(접근성 이름은 그대로 한글).
- 28px 은 `Button` size 램프(24·32·36·40)에 없어 `Pagination` 내부에서만 `size-7` 로 덮어썼다.
  버튼 높이 36px(`h-9`)은 피그마와 이미 일치해 손대지 않았다.

### 고친 버그

- **`index.css` 의 `body { font-family }` 가 `html` 의 `font-sans` 를 덮어써 웹폰트가 미적용이던 문제.**
  Noto Sans 를 로드만 하고 실제로는 Segoe UI 가 렌더링되고 있었다. 재발 방지 주석을 달았다.
- `@layer base` 가 두 번 중복 선언되어 `html { @apply font-sans }` 가 이중 적용되던 문제.
- `IconButton` 의 수동 variant 타입 목록에 실재하지 않는 `secondary` 가 남아 있던 문제
  (`VariantProps` 파생으로 교체).
- **`primitives/Pagination.tsx` 의 `mx-auto` 때문에 하단 바 페이지네이션이 우측 끝에 붙지 않던 문제.**
  auto margin 은 부모의 `justify-between`·`justify-end` 보다 우선해 남은 여백을 좌우로 나눠 먹으므로
  호출부에서 override 가 불가능했다. shadcn 원본의 `mx-auto w-full justify-center` 를 제거하고
  정렬은 호출부(부모 레이아웃)가 정하도록 바꿨다. 테이블 위젯 9개가 함께 고쳐졌다.

### 해소한 중복

테이블 위젯 9개(`contract` `schedule` `stack` `stack-list` `workplace` `equipment` `member` `team` `tenant`)가
각자 인라인으로 갖고 있던 하단 바 JSX(`총 N건` + `Pagination` 7줄)를 `table/TableFooterBar` 로 통합했다.
패딩·보더는 호출부가 `className` 으로 주입한다(예: `border-t border-border px-5 py-3`).

- `TableFooterBar` 의 높이는 `h-7` → `min-h-7`. 고정 높이면 호출부가 얹은 패딩에 내용(28px 버튼)이 눌린다.
  페이지가 1장이면 `Pagination` 이 렌더되지 않으므로 최소 높이 28px 는 유지한다.
- 배경(`bg-canvas`)은 `TableFooterBar` 에서 빼고 셸(`TablePanel`)의 footer 슬롯으로 옮겼다.
  아직 흰 `Panel` 안에 있는 미마이그레이션 위젯이 회색 띠를 얻지 않도록.

### 해소한 컨벤션 위반

`CLAUDE.md` 의 "알려진 위반 사항"에 등재돼 있던 `@/components/ui/*` 직접 import 4건
(`SignInForm` `SocialSignIn` `RegisterClientForm` `RegisterPollutantForm`) 전부 해소.

---

## 앞으로의 작업

### 피그마 대조에서 남긴 항목 (8단계 범위 밖)

토큰·치수는 맞췄으나 아래는 호출부 변경 규모가 커서 의도적으로 남겼다.

- **행 액션 형태** — 피그마 05 는 `··· 상세보기`(more-horizontal + 텍스트, DEFAULT 톤) 와
  `작업시작`(check-square, PRIMARY) 두 버튼이다. 코드는 `shared/ui/table/RowActionCell.tsx` 의
  아이콘 전용 `IconButton`. 테이블 위젯 5개 + `RowActionCell` 재설계가 뒤따른다.
  3순위 "`IconButton` 기본 variant" 결정과 함께 처리하는 편이 낫다.
- **아이콘 규격 통일** — 피그마 04 는 **기본 19px · stroke 1.46px**, 49개 목록에 lucide 이름이 명시돼 있다
  (노드 `9:2723`). 코드는 14~19px 혼용(`SortIcon` 14, 피그마 헤더 정렬 아이콘은 16,
  `SummaryCard` 19, `Button` 내부 `size-4`). 아이콘 크기 토큰을 세울지 결정이 필요하다.
- **Code Connect 매핑** — 피그마 컴포넌트 ↔ `shared/ui` 연결. 등록하면 이후 design-to-code 시
  피그마가 우리 컴포넌트를 직접 추천한다. `Button`·`Badge`·`StatusDot`·테이블부터 매핑할 수 있다.
- **입력값 18px Regular 이 타이포 10단계에 없다** — 측정계획 상세_MO 의 입력창 값은 18px/400 인데
  스케일의 18px 는 `text-h3`(600) 뿐이다. 현재는 `UnitField` 안에서
  `text-body-2 max-md:text-[1.125rem]` 로 **한 곳에만 격리**해 두었다.
  모바일 입력 전용 단계를 스케일에 추가할지 결정이 필요하다.
- **배지 글씨색** — 피그마 진행도 배지는 Brand Soft 면에 **Primary**(#239861) 글씨지만,
  "Primary 는 면 전용, 밝은 배경 위 글씨는 Dark" 원칙에 따라 `Badge tone="brand"`(Dark)를 썼다.
  대비 3.44 → 5.86. 원칙을 유지할지 피그마에 맞출지 확인이 필요하다.

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
- ~~**폼 입력 글씨 16px 문제**~~ — **완료(8단계).** `text-base md:text-sm` → `text-body-3`
- ~~**기존 타입 오류 8건**~~ — **해소됨.** `features/update-schedule-client` 리팩터링 과정에서 정리되어
  2026-07-30 기준 `npx tsc -b --force` 오류 0건
- **`ring-ring/50` 잔존 3곳** — `primitives/Calendar.tsx` · `components/ui/tabs.tsx` ·
  `components/variants/buttonVariants.ts`. 피그마의 12% 규정은 **입력 필드** 스펙이고 이 3개는
  입력 필드가 아니어서 8단계 범위에서 제외했다. 통일할지는 판단 필요

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

정확도 순서: **Variables(`get_variable_defs`) > 노드 치수(`get_metadata`) > 섹션 본문 텍스트 > 스크린샷**.
스크린샷은 압축 때문에 색상 hex 를 정확히 읽을 수 없다. 레이아웃·상태 확인용으로는 유용하다.

Figma MCP 사용 순서 (fileKey·노드 ID 는 위 "피그마 출처" 참조):

1. `get_variable_defs` — 컬러·타이포는 변수로 등록돼 있어 여기서 정확한 값이 나온다.
   특정 노드에 걸린 변수만 반환하므로 **노드를 좁혀 조회**하면 그 컴포넌트가 쓰는 토큰을 알 수 있다
   (예: 테이블 헤더 행 `11:5844` → `Neutral_Ink Soft` + `Label_SBold`).
2. `get_metadata` — 치수 확인용. **Design System 페이지 전체(`0:1`)는 응답이 43만 자로 잘리므로**
   프레임 단위로 조회하거나, 저장된 결과 파일을 파싱해서 필요한 노드만 추린다.
3. `get_screenshot` — 상태(hover·focus·selected)와 배치 확인용.

> 간격·코너·컴포넌트 치수(버튼 36 · 입력 38 · 헤더 42 · 행 52 · 페이지네이션 28)는
> **변수가 아니다.** 섹션 본문 설명문과 노드 width/height 로만 확인된다.
