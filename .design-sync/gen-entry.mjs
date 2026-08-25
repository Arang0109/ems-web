// design-sync 번들 엔트리 + 컴포넌트 목록 생성기.
//
// 왜 필요한가:
//   컨버터의 기본 동작(합성 엔트리)은 `src/shared/ui` 아래 모든 `.tsx` 를
//   `export *` 로 모은다. 그러면 `primitives/` 의 shadcn 이관분과 이름이 겹치는
//   InputGroup / Pagination / Textarea 가 ESM 규칙상 통째로 사라진다
//   (`[EXPORT_COLLISION]` -> `[BUNDLE_EXPORT]`).
//
//   대신 이 저장소의 진짜 공개 API 인 그룹 배럴(`shared/ui/<group>/index.ts`)을
//   엔트리로 쓴다. 배럴이 곧 "업무 코드가 import 해도 되는 것" 의 정의이므로
//   내부 전용 컴포넌트(ConfirmDialog, FormDialogShell, SortItem, SortIcon 등)와
//   primitives 가 자연히 빠지고, 이름 충돌도 사라진다.
//
// 생성물
//   .design-sync/entry.ts            — 번들 엔트리 (--entry 로 넘긴다)
//   .design-sync/docs/<Name>.md      — 그룹 추론이 어긋나는 컴포넌트의 재분류 스텁
//   .design-sync/config.json         — componentSrcMap / docsMap 필드만 갱신
//
// 실행: node .design-sync/gen-entry.mjs   (배럴이 바뀌면 다시 실행)
import { readdirSync, statSync, existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";

const UI = "src/shared/ui";
const SKIP_GROUPS = new Set(["primitives"]); // 업무 코드에서 직접 쓰지 않는 shadcn 이관분

// ── 배럴 파싱 ─────────────────────────────────────────────────────────────
// `export { A, B as C, type D } from "./X";` 에서 값 export 만 뽑는다.
const REEXPORT = /export\s*\{([^}]*)\}\s*from\s*["']([^"']+)["']/g;

const resolveSpec = (group, spec) => {
  const base = spec.startsWith("@/")
    ? "src/" + spec.slice(2)
    : spec.startsWith("./")
      ? `${UI}/${group}/${spec.slice(2)}`
      : null;
  if (!base) return null;
  for (const ext of [".tsx", ".ts", "/index.tsx", "/index.ts"]) {
    if (existsSync(base + ext)) return base + ext;
  }
  return null;
};

const isComponentName = (n) => /^[A-Z][A-Za-z0-9]*$/.test(n);

const groups = readdirSync(UI)
  .filter((g) => statSync(`${UI}/${g}`).isDirectory() && !SKIP_GROUPS.has(g))
  .filter((g) => existsSync(`${UI}/${g}/index.ts`))
  .sort();

const components = []; // {name, group, src}
for (const group of groups) {
  const text = readFileSync(`${UI}/${group}/index.ts`, "utf8");
  for (const m of text.matchAll(REEXPORT)) {
    const [, names, spec] = m;
    // `export type { ... } from` 은 REEXPORT 가 잡지 않는다 (export 와 { 사이에 type).
    if (/export\s+type\s*\{$/.test(m[0].slice(0, m[0].indexOf("{") + 1))) continue;
    const src = resolveSpec(group, spec);
    if (!src) continue;
    for (const raw of names.split(",")) {
      const item = raw.trim();
      if (!item || item.startsWith("type ")) continue;
      const name = (item.split(/\s+as\s+/)[1] ?? item).trim();
      if (!isComponentName(name)) continue;
      components.push({ name, group, src });
    }
  }
}
components.sort((a, b) => a.name.localeCompare(b.name));

// ── 엔트리 ───────────────────────────────────────────────────────────────
writeFileSync(
  ".design-sync/entry.ts",
  [
    "// 생성 파일 - `node .design-sync/gen-entry.mjs` 로 다시 만들 것.",
    "// shared/ui 의 그룹 배럴 = 이 디자인 시스템의 공개 API.",
    "",
    ...groups.map((g) => `export * from "@shared/ui/${g}";`),
    "",
  ].join("\n"),
);

// ── 그룹 추론 보정 ────────────────────────────────────────────────────────
// 컨버터는 src 경로의 마지막 세그먼트로 그룹을 정하되, 컴포넌트 이름과 같거나
// 일반 컨테이너 이름(components/ui/lib/src...)인 세그먼트는 건너뛴다.
// 그래서 `drawer/Drawer.tsx` 처럼 디렉터리명 = 컴포넌트명이면 'general' 로 떨어진다.
const GENERIC = new Set(["components", "component", "src", "lib", "ui", "packages", "react"]);
const derivedGroup = (name, src) => {
  const dir = src.slice(0, src.lastIndexOf("/"));
  const rel = dir.startsWith(UI + "/") ? dir.slice(UI.length + 1) : null;
  if (rel === null) return "general"; // srcRoot 밖 (예: src/components/ui/sidebar.tsx)
  const seg = rel
    .split("/")
    .filter((s) => s && s.toLowerCase() !== name.toLowerCase() && !GENERIC.has(s.toLowerCase()))
    .at(-1);
  return seg ?? "general";
};

mkdirSync(".design-sync/docs", { recursive: true });
const docsMap = {};
const regrouped = [];
for (const c of components) {
  if (derivedGroup(c.name, c.src) === c.group) continue;
  const path = `.design-sync/docs/${c.name}.md`;
  writeFileSync(path, `---\ncategory: ${c.group}\n---\n`);
  docsMap[c.name] = path;
  regrouped.push(`${c.name} -> ${c.group}`);
}

// ── config 갱신 ──────────────────────────────────────────────────────────
const cfgPath = ".design-sync/config.json";
const cfg = JSON.parse(readFileSync(cfgPath, "utf8"));
cfg.componentSrcMap = Object.fromEntries(components.map((c) => [c.name, c.src]));
cfg.docsMap = docsMap;
writeFileSync(cfgPath, JSON.stringify(cfg, null, 2) + "\n");

console.log(`entry: ${groups.length} group barrels`);
console.log(`components: ${components.length}`);
console.log(`regrouped: ${regrouped.length}${regrouped.length ? " — " + regrouped.join(", ") : ""}`);
