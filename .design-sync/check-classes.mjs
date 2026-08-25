// 프리뷰가 쓰는 Tailwind 클래스가 실제로 번들 CSS 에 존재하는지 검사한다.
//
// 왜 필요한가:
//   Tailwind v4 는 "소스에 리터럴로 등장한 클래스"만 생성한다. 이 디자인 시스템의
//   스타일시트는 ems-web 앱 빌드 산출물이므로, 앱이 한 번도 쓴 적 없는 유틸리티
//   (`max-w-40`, `max-w-md` ...)는 아무 효과가 없다 — 조용히 무시된다.
//
// 실행: node .design-sync/check-classes.mjs
import { readdirSync, readFileSync } from "node:fs";

const CSS = ".design-sync/.cache/ds-styles.css";
const DIR = ".design-sync/previews";

const css = readFileSync(CSS, "utf8");
// CSS 에 정의된 클래스 이름을 전부 모은다 (이스케이프된 콜론/슬래시 포함).
const defined = new Set();
for (const m of css.matchAll(/\.((?:[\w-]|\\.)+)/g)) {
  defined.add(m[1].replace(/\\(.)/g, "$1"));
}

// 앱 전역에서 쓰는 base 스타일이라 유틸리티가 아닌 것들
const IGNORE = /^(group|peer|dark|toaster|cn-toast)$/;

let bad = 0;
for (const file of readdirSync(DIR).filter((f) => f.endsWith(".tsx"))) {
  const src = readFileSync(`${DIR}/${file}`, "utf8");
  const missing = new Set();
  for (const m of src.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\})/g)) {
    for (const cls of (m[1] ?? m[2]).split(/\s+/)) {
      if (!cls || cls.includes("${") || IGNORE.test(cls)) continue;
      // variant 접두어(md:, hover:)는 CSS 안에서도 그대로 이름에 남는다
      if (!defined.has(cls)) missing.add(cls);
    }
  }
  if (missing.size) {
    bad += missing.size;
    console.log(`${file}: ${[...missing].join(" ")}`);
  }
}
console.log(bad ? `\n${bad} class(es) not in the shipped CSS — 앱이 쓰는 클래스로 바꿀 것` : "모든 클래스가 번들 CSS 에 존재한다");
process.exit(bad ? 1 : 0);
