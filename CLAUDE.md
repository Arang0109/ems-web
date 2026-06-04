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
