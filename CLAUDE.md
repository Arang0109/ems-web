# ensolution-front-fsd

> ⚠️ 이 프로젝트는 `c:\dev\projects\new\ensolution-front-fsd` 입니다.
> `c:\dev\projects\ensolution-front` (기존 프로젝트)와 **다른 별개의 프로젝트**입니다.

---

## 프로젝트 정보

- **경로:** `c:\dev\projects\new\ensolution-front-fsd`
- **아키텍처:** Feature-Sliced Design (FSD)
- **스택:** React + TypeScript + Vite + TailwindCSS v4 + shadcn/ui + MSW
- **아키텍처 상세:** [ARCHITECTURE.md](./ARCHITECTURE.md) 참조

---

## 핵심 FSD 규칙

### Import 방향 (엄격 적용)

```
app → pages → widgets → features → entities → shared
```

- 상위 레이어는 하위 레이어만 import 가능
- **같은 레이어 간 직접 import 금지** (shared 제외)

### Public API

- 각 슬라이스는 반드시 `index.ts`를 통해서만 외부에 노출
- 내부 구현 파일(`ui/`, `hooks/`, `api/`, `model/`)을 직접 import하지 말 것

---

## 환경 설정

- **CSS:** TailwindCSS v4 (`postcss.config.js` 기반, `tailwind.config.js` 없음)
- **Mock API:** MSW (개발 환경에서 자동 활성화)
- **Path Aliases:**
  - `@/` → `src/`
  - `@shared/` → `src/shared/`
  - `@entities/` → `src/entities/`
  - `@features/` → `src/features/`

---

## 주요 명령어

```bash
npm run dev       # 개발 서버 (MSW 포함)
npm run build     # 빌드
npm run preview   # 빌드 미리보기
npx tsc --noEmit  # 타입 체크
```

---

## React 패턴 규칙

### prop → state 동기화 — `useEffect` 금지

외부 prop을 내부 state의 초기값으로 사용할 때 `useEffect` + `setState` 조합을 쓰지 말 것.
Effect 내부의 동기적 `setState`는 cascading render를 유발한다.

**금지 패턴**
```tsx
// ❌ useEffect로 prop을 state에 동기화
useEffect(() => {
  setForm({ name: company.name, ... });
}, [company]);
```

**올바른 패턴 — `key` + 초기값**
```tsx
// ✅ 부모에서 key를 변경하면 컴포넌트가 리마운트되어 초기값이 재적용됨
<DetailForm key={selectedItem?.id} item={selectedItem} />

// 자식 컴포넌트에서는 prop을 useState 초기값으로만 사용
const [form, setForm] = useState({
  name: item?.name ?? '',
});
```

`key`가 바뀌면 React는 컴포넌트를 언마운트 후 다시 마운트하므로 `useState` 초기값이 새로 적용된다.
이 방식은 "외부 데이터를 편집하는 폼"(상세 모달, 수정 다이얼로그 등) 패턴에 항상 적용한다.

---

## 레이어별 세부 규칙

각 레이어 디렉토리 하위 `CLAUDE.md`에 세부 지침이 있습니다.

| 레이어 | 세부 규칙 위치 |
|--------|--------------|
| app | [src/app/CLAUDE.md](./src/app/CLAUDE.md) |
| pages | [src/pages/CLAUDE.md](./src/pages/CLAUDE.md) |
| widgets | [src/widgets/CLAUDE.md](./src/widgets/CLAUDE.md) |
| features | [src/features/CLAUDE.md](./src/features/CLAUDE.md) |
| entities | [src/entities/CLAUDE.md](./src/entities/CLAUDE.md) |
| shared | [src/shared/CLAUDE.md](./src/shared/CLAUDE.md) |
