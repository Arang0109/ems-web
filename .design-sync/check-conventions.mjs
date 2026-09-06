// conventions.md 가 언급한 클래스·컴포넌트가 실제 빌드 산출물에 존재하는지 검증한다.
//
// 존재하지 않는 이름을 적어 두면 디자인 에이전트가 그걸 믿고 쓴다 —
// 조용히 스타일 없는 화면이 나오므로, 문서를 고칠 때마다 돌린다.
//
// 실행: node .design-sync/check-conventions.mjs
import { readFileSync, readdirSync } from "node:fs";

const css = readFileSync(".design-sync/.cache/ds-styles.css", "utf8");
const defined = new Set();
for (const m of css.matchAll(/\.((?:[\w-]|\\.)+)/g)) {
  defined.add(m[1].replace(/\\(.)/g, "$1"));
}

const raw = readFileSync(".design-sync/conventions.md", "utf8");
// 펜스 코드블록은 인라인 백틱 짝을 깨뜨리므로 먼저 떼어내고 따로 다룬다.
const fences = [...raw.matchAll(/```[\s\S]*?```/g)].map((m) => m[0]);
const doc = raw.replace(/```[\s\S]*?```/g, "\n");

// ── 유틸리티 클래스 ───────────────────────────────────────────────────────
const UTIL =
  /^(text|bg|border|rounded|shadow|flex|grid|gap|p|px|py|items|justify|max-w|w|grid-cols|md:grid-cols|flex-col)-[\w./[\]-]+$/;
const classes = new Set();
const add = (tok) => {
  const t = tok.replace(/^[.,()]+|[.,()]+$/g, "");
  if (UTIL.test(t)) classes.add(t);
};
for (const m of doc.matchAll(/`([^`]+)`/g)) for (const t of m[1].split(/[\s·]+/)) add(t);
// 예시 코드의 className 리터럴도 검사한다
for (const f of fences) {
  for (const m of f.matchAll(/className="([^"]*)"/g)) {
    for (const t of m[1].split(/\s+/)) add(t);
  }
}
// 문서가 "이건 동작하지 않는다"고 명시적으로 든 반례는 검사 대상이 아니다.
const COUNTEREXAMPLES = new Set([
  "max-w-40", "max-w-md", "w-[37px]", "text-gray-500", "bg-blue-600",
]);
const missingClasses = [...classes]
  .filter((c) => !COUNTEREXAMPLES.has(c))
  .filter((c) => !defined.has(c) && !defined.has(c.split("/")[0]))
  .sort();

// ── 컴포넌트 이름 ────────────────────────────────────────────────────────
const comps = new Set();
for (const g of readdirSync("ds-bundle/components")) {
  for (const n of readdirSync(`ds-bundle/components/${g}`)) comps.add(n);
}
const bundle = readFileSync("ds-bundle/_ds_bundle.js", "utf8");
const named = new Set();
for (const m of doc.matchAll(/`([A-Z][A-Za-z0-9]+)`/g)) named.add(m[1]);
for (const m of doc.matchAll(/<([A-Z][A-Za-z0-9]+)/g)) named.add(m[1]);
for (const f of fences) for (const m of f.matchAll(/<([A-Z][A-Za-z0-9]+)/g)) named.add(m[1]);

// 번들 밖에서 오는 것 + 문서상의 자리표시자
const EXTERNAL = new Set([
  "ThemeProvider", "MemoryRouter", "Plus", "Schedule", "Name", "ScheduleList",
]);
const missingComps = [...named]
  .filter((n) => !EXTERNAL.has(n) && !comps.has(n))
  .filter((n) => !new RegExp(`[^A-Za-z0-9_$]${n}\\s*:\\s*\\(\\)\\s*=>`).test(bundle))
  .sort();

console.log(
  `classes: ${classes.size} checked, ${missingClasses.length} missing`,
  missingClasses.length ? missingClasses : "",
);
console.log(
  `components: ${named.size} checked, ${missingComps.length} not in build`,
  missingComps.length ? missingComps : "",
);
process.exit(missingClasses.length || missingComps.length ? 1 : 0);
