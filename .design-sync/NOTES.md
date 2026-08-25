# design-sync 작업 메모 (ems-web)

claude.ai/design 프로젝트: `EMS Design System`
https://claude.ai/design/p/69ff3e66-cd6f-4ac3-849d-b802d9080744

---

## 이 저장소가 표준 경로에서 벗어나는 지점

**ems-web 은 라이브러리가 아니라 앱이다.** 컨버터는 "빌드된 `dist/` 엔트리 + `.d.ts` 트리를
가진 npm 패키지"를 전제하는데 여기엔 둘 다 없다. 아래 넷이 그 간극을 메운다.

### 1. 엔트리 — 그룹 배럴을 직접 넘긴다

- `.design-sync/entry.ts` (생성물) = `shared/ui/<group>/index.ts` 를 전부 `export *`.
- `node .design-sync/gen-entry.mjs` 로 다시 만든다. **`shared/ui` 에 그룹이 추가되면 반드시 재실행.**
  같은 스크립트가 `config.json` 의 `componentSrcMap`(77개)·`docsMap`(그룹 추론 보정 7건)도 갱신한다.
- 컨버터 기본 동작(합성 엔트리 = `shared/ui` 아래 모든 `.tsx` 를 별표 재export)을 쓰면
  `primitives/` 와 이름이 겹치는 **InputGroup / Pagination / Textarea 가 ESM 규칙상 통째로
  사라진다**(`[EXPORT_COLLISION]` → `[BUNDLE_EXPORT]`). 배럴 엔트리는 이 문제를 구조적으로 없앤다.
- 한때 `.design-sync/ambiguous-exports.ts` 로 사라진 이름을 되살리려 했으나 실패했다
  (`[EXPORT_COLLISION]` — 별표 재export 는 extraEntries 로 덮어쓸 수 없다). 배럴 엔트리로
  바꾸면서 불필요해져 삭제했다. 같은 함정에 다시 빠지지 말 것.
- 부수 효과(의도한 것): 배럴에 없는 내부 전용 컴포넌트(ConfirmDialog, FormDialogShell,
  StepViewport, SortableItem, SortIcon)와 `primitives/` 전체가 카드에서 빠진다.
  `primitives/index.ts` 가 스스로 "업무 코드에서 직접 쓰지 않는다"고 못박은 대로다.

### 2. 경로 별칭 — 전용 tsconfig 를 만든다

- `.design-sync/tsconfig.paths.json` (생성물, `node .design-sync/gen-paths.mjs`).
- 원본 `tsconfig.app.json` 은 `paths` 끝에 **trailing comma** 가 있어 표준 JSON 파서인
  컨버터가 통째로 못 읽는다 (TS 는 허용하지만 JSON.parse 는 아니다).
- 컨버터의 alias 플러그인은 확장자 후보를 `''` 부터 시도해서 `@shared/ui/badges` 같은
  **디렉터리 배럴이 디렉터리로 먼저 매칭**돼 esbuild 가 디렉터리를 파일로 읽으려다 실패한다.
  그래서 배럴 28개는 `index.ts` 를 가리키는 정확 매핑을 먼저 박아 둔다.

### 3. `.d.ts` — `lib/dts.mjs` 를 포크한다

- `.design-sync/overrides/dts.mjs` (`cfg.libOverrides` 에 선언됨).
- 바꾼 곳은 `projectFor` 한 군데뿐: 엔트리가 없으면 `.design-sync/entry.ts` 를 쓰고,
  그때 `src/{shared,components,lib}` 의 `.ts/.tsx` 를 ts-morph 프로젝트에 넣고,
  `tsconfig.paths.json` 의 별칭을 컴파일러 옵션에 준다.
- **이게 없으면 77개 전부 `[key: string]: unknown` 스텁이 된다.** `.d.ts` 는 디자인
  에이전트가 보는 유일한 API 계약이라 치명적이다. 포크 후에는 variant 유니온·JSDoc까지
  제대로 나온다 (`Button.variant`, `Badge.tone`, `StatusDot.tone` 등).
- 이 저장소는 props 인터페이스 이름이 `Props` 라서 `<Name>Props` 이름 조회로는 절대 안 잡힌다 —
  엔트리 export 의 첫 call signature 파라미터 타입을 푸는 폴백 경로가 실제로 동작하는 길이다.
- **재동기화 시** 번들 `lib/dts.mjs` 와 diff 해서 상류 변경을 병합할 것.
- 포크가 `ts-morph` 를 bare import 하므로 `ln -sfn ../.ds-sync/node_modules .design-sync/node_modules`
  가 필요하다. gitignore 대상이라 **새로 클론할 때마다 다시 만들어야 한다.**

### 4. CSS — 앱 빌드 산출물을 스타일시트로 쓴다

- Tailwind v4 라 정적 스타일시트가 없다. `cfg.buildCmd` 가 하는 일:
  ```
  npx vite build && cp dist/assets/index-*.css .design-sync/.cache/ds-styles.css
  ```
  (`npm run build` 은 `tsc -b` 를 먼저 돌려 WIP 타입 오류에 걸릴 수 있어 `npx vite build` 를 쓴다.)
- 파일명이 해시라 매 재동기화마다 복사가 필요하고, 결과물은 gitignore 된 캐시다.
- 폰트는 `cfg.extraFonts` 로 `node_modules/pretendard/.../pretendardvariable.css` (단일 2MB woff2)를
  붙인다. dynamic-subset(100+ 파일)은 쓰지 않는다.

> ⚠️ **Tailwind v4 는 소스에 리터럴로 등장한 클래스만 생성한다.**
> 즉 이 디자인 시스템의 CSS 는 "앱이 실제로 쓴 유틸리티"의 스냅샷이다.
> `max-w-40`·`max-w-md`·`rounded-input` 처럼 앱이 안 쓴 클래스는 조용히 무시된다.
> `node .design-sync/check-classes.mjs` 가 프리뷰의 className 을 번들 CSS 와 대조한다 —
> **프리뷰를 고칠 때마다 돌릴 것.** 같은 제약이 디자인 에이전트에도 적용되므로
> `conventions.md` 에 명시해 두었다.

---

## 알려진 렌더 경고 (새 경고가 아님)

재동기화에서 아래가 다시 떠도 정상이다.

- `[FONT_MISSING] "Pretendard", "Apple SD Gothic Neo", "source-code-pro"`
  — `--font-sans` 스택의 **OS 폴백 이름**이다. 첫 순위인 `Pretendard Variable` 은 번들에 실려 있고
  (`fonts/PretendardVariable.woff2`), 나머지는 애초에 배포 대상이 아니다. 의도된 상태다.
- `[RENDER_THIN] ConfirmProvider` — children 만 그리는 컨텍스트 제공자라 높이가 0 이다. floor 카드.
- `[RENDER_THIN] FormDialog` — 모달이 portal + fixed 로 뜨므로 측정 높이가 0 이다.
  스크린샷상 오버레이·폼·액션 버튼까지 정상 렌더된다(확인함).

## 정지 화면에서 표현할 수 없어 생략한 상태

- `Tooltip` 말풍선 열림 — hover/focus 로만 열리고 `open` prop 이 없다. 트리거만 보여준다.
- `FilterPopover` 열림 — 열림 상태를 컴포넌트가 소유한다(`open` prop 없음). 트리거만 보여준다.
  (`Popover` 는 `open` 이 있어 열린 상태를 카드에 담았다.)
- `Pagination`·`TablePagination` 의 "페이지 1개" 상태 — 컴포넌트가 아무것도 그리지 않아
  빈 셀이 된다. 해당 export 를 뺐다.
- `SortableList` 드래그 중 — 프리뷰 미작성(floor 카드).

## 카드 레이아웃 오버라이드 (`cfg.overrides`)

- `cardMode: "single"` — `FormDialog`(primaryStory `Open`, 1000×760), `Popover`(`Open`, 720×420).
  오버레이가 셀 밖으로 새거나 높이 0 이 되는 것을 막는다.
- `cardMode: "column"` — `BasicTable`, `TablePanel`, `DetailGrid`, `SummaryCardGroup`,
  `StickyActionBar`, `TableLabelCell`, `TableInputCell`, `TableResultCell`, `TableSelectCell`.
  넓은 컴포넌트를 한 행에 하나씩 전체 폭으로 그린다.

## 프리뷰 작성 현황

- 작성·채점 완료 **38개** (셀 112개, 전부 `good`). 나머지 39개는 floor 카드.
- 아직 미작성 (다음 재동기화 후보): `AppSidebar`, `SidebarNav`, `SidebarBrandHeader`,
  `SidebarMobileBar`, `SidebarUserFooter`, `SectionAccordion`, `SubAccordion`, `Tabs`,
  `ChipNav`, `StepNav`, `Drawer`, `StepFormDialog`, `DocumentViewerDialog`, `PageLayout`,
  `PageTitle`, `Panel`, `Divider`, `Skeleton`, `SkeletonPanel`, `SortableList`, `HelpTip`,
  `AddressInput`, `FileInput`, `FilterSelect`, `SectionTitle`, `FieldGroup`, `TimeField`,
  `CalcResultRow`, `CalcResultGrid`, `Toaster`, `ThemeToggle`, `DesktopTable`, `MobileCardList`,
  `InputTable`, `RowActionCell`, `TableFooterBar`, `ConfirmProvider`, `DetailViewButton`.

### 프리뷰 작성 요령 (이 저장소 기준)

- `import { X } from "ems-web"` 로 쓴다 — 번들(`window.EmsUI`)로 치환된다.
- 레이아웃 접착제는 Tailwind 유틸리티를 쓰되 **반드시 `check-classes.mjs` 를 통과시킬 것.**
- 내용은 실제 EMS 도메인(사업장·의뢰기관·배출구·측정항목·성적서)으로 쓴다.
- `BasicTable`·`TablePagination` 은 `@tanstack/react-table` 인스턴스를 직접 만든다
  (앱의 `useDataTable` 은 `shared/model` 이라 이 번들에 없다).
- 표 셀 컴포넌트(`Table*Cell`)는 `<th>`/`<td>` 라서 반드시 `<table>` 안에 넣어야 한다.
- `NumericField` 는 `label` 을 화면에 그리지 않는다(접근성 이름 전용) — 캡션을 따로 붙여야
  셀이 읽힌다.

---

## 재동기화 위험 (다음 실행이 지켜봐야 할 것)

1. **`ds-styles.css` 는 gitignore 된 생성물이다.** 새로 클론하면 없다 —
   `cfg.buildCmd` 를 먼저 돌리지 않으면 `[CSS_PLACEHOLDER]` 또는 무스타일 카드가 된다.
2. **`.design-sync/node_modules` 심볼릭 링크도 클론마다 다시 만들어야 한다** (dts 포크가 ts-morph 를
   bare import 함). 없으면 포크 로드 실패 → `.d.ts` 가 조용히 스텁으로 되돌아간다.
3. **`shared/ui` 에 그룹·컴포넌트가 추가되면** `gen-entry.mjs`(+ 필요시 `gen-paths.mjs`)를
   다시 돌리지 않는 한 새 컴포넌트가 동기화되지 않는다. 조용히 빠지므로 눈치채기 어렵다.
4. **dts 포크는 상류 `lib/dts.mjs` 와 갈라진다.** 재동기화 때 diff 해서 병합할 것.
5. **프리뷰의 Tailwind 클래스**는 앱이 그 클래스를 계속 쓰는 한에서만 유효하다.
   앱에서 마지막 사용처가 사라지면 CSS 에서도 사라져 프리뷰가 조용히 깨진다 —
   `check-classes.mjs` 가 이걸 잡는다.
6. **`primitives/` 의 shadcn 잔재가 제거되면**(DESIGN-SYSTEM.md 의 계획) 이름 충돌 자체가
   사라진다. 그때는 배럴 엔트리 대신 합성 엔트리로 되돌릴 수 있는지 재검토할 것.
7. Playwright 는 chromium build **1234**(151.0.7922.34)를 쓰는 버전이어야 한다
   (현재 `playwright@1.62.1`). 로컬 캐시에 이미 있어 브라우저 재다운로드는 없었다.
8. 이번 실행은 `--render-sample` 없이 77개 전부 렌더 검사했다.
