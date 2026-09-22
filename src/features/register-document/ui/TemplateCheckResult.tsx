import type { TemplateCheckResult as Result } from "@entities/schedule";
import { describeTemplateIssue } from "@entities/schedule";
import { Badge } from "@shared/ui/badges";

interface Props {
  result: Result;
}

/** 양식 검사 결과 — 문제가 없으면 한 줄, 있으면 시트·셀·종류·이름을 줄마다. */
export const TemplateCheckResult = ({ result }: Props) => {
  if (result.valid) {
    return (
      <p className="mt-3 flex items-center gap-2 text-caption text-muted-foreground">
        <Badge tone="brand">검사 통과</Badge>
        양식의 이름이 모두 유효합니다.
      </p>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      <p className="flex items-center gap-2 text-caption text-destructive">
        <Badge tone="danger">문제 {result.issues.length}건</Badge>
        아래 이름은 빈칸으로 출력됩니다. 양식을 고친 뒤 새 버전으로 등록해 주세요.
      </p>
      <ul className="max-h-48 space-y-1 overflow-y-auto rounded-md border border-rule p-2 text-caption">
        {result.issues.map((issue, index) => {
          const { location, title, detail } = describeTemplateIssue(issue);
          return (
            <li key={`${location}-${issue.name}-${index}`} className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
              <span className="shrink-0 font-mono text-muted-foreground">{location}</span>
              <span className="shrink-0 font-medium">{title}</span>
              <span className="break-all text-muted-foreground">{detail}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
