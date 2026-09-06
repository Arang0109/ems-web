// design-sync 전용 별칭 테이블 생성기.
//
// 왜 필요한가:
//  1) tsconfig.app.json 의 compilerOptions.paths 끝에 trailing comma 가 있어
//     컨버터의 표준 JSON 파서가 통째로 읽지 못한다.
//  2) 컨버터의 tsconfig-paths 플러그인은 확장자 후보를 '' 부터 시도하는데,
//     `@shared/ui/badges` 같은 디렉터리 배럴이 '' 에서 디렉터리로 먼저 매칭돼
//     esbuild 가 디렉터리를 파일로 읽으려다 실패한다.
//     -> 배럴 디렉터리는 index.ts 를 가리키는 "정확 매핑"으로 미리 박아둔다.
//
// 실행: node .design-sync/gen-paths.mjs   (shared/ 아래 슬라이스가 늘면 다시 실행)
import { readdirSync, statSync, existsSync, writeFileSync } from "node:fs";

const ALIASES = {
  "@": "src",
  "@app": "src/app",
  "@entities": "src/entities",
  "@features": "src/features",
  "@pages": "src/pages",
  "@shared": "src/shared",
  "@widgets": "src/widgets",
};

// 번들 그래프는 shared/ 안에서만 돈다 (FSD 상 shared 는 상위 레이어를 import 하지 않는다).
const exact = {};
const scan = (alias, dir) => {
  for (const name of readdirSync(dir)) {
    const p = dir + "/" + name;
    if (!statSync(p).isDirectory()) continue;
    const idx = ["index.ts", "index.tsx"].find((f) => existsSync(p + "/" + f));
    if (idx) exact[alias + "/" + name] = ["../" + p + "/" + idx];
    if (name === "ui") scan(alias + "/ui", p);
  }
};
scan("@shared", "src/shared");

const wild = Object.fromEntries(
  Object.entries(ALIASES).map(([a, d]) => [a + "/*", ["../" + d + "/*"]]),
);

writeFileSync(
  ".design-sync/tsconfig.paths.json",
  JSON.stringify(
    {
      _comment:
        "생성 파일 - 직접 고치지 말고 `node .design-sync/gen-paths.mjs` 로 다시 만들 것. 이유는 gen-paths.mjs 주석 참고.",
      compilerOptions: { baseUrl: ".", paths: { ...exact, ...wild } },
    },
    null,
    2,
  ),
);
console.log(
  `generated ${Object.keys(exact).length} exact + ${Object.keys(wild).length} wildcard rules`,
);
