import { Skeleton } from '@shared/ui/skeletons';
import { EmptyText } from '@shared/ui/feedback';

/** 서버가 목록 개수를 제한하지 않으므로 표시 개수는 여기서 자른다. */
const MAX_VISIBLE = 5;

interface AlertItem {
  id: string;
  title: string;
  caption: string;
  /** 우측 액세서리(D-day 배지 등). 임박도 계산은 호출부 책임 */
  trailing?: React.ReactNode;
}

interface Props {
  title: string;
  items: AlertItem[];
  emptyMessage: string;
  isLoading?: boolean;
}

/**
 * 대시보드 우측 알림 패널의 공통 프레젠테이션.
 *
 * 만료 기한이 임박한 항목을 "제목 + 액세서리 / 보조정보" 두 줄로 나열한다.
 * 읽기 전용이라 항목에 클릭 동작을 두지 않는다.
 *
 * 면·그림자는 바깥 열(`DashboardAlerts` 의 aside)이 소유한다 — 중첩 그림자 방지.
 */
export const AlertPanel = ({ title, items, emptyMessage, isLoading }: Props) => {
  const visible = items.slice(0, MAX_VISIBLE);
  const hiddenCount = items.length - visible.length;

  return (
    <section className="ring-1 ring-rule py-4">
      <header className="px-4 py-3">
        <span className='text-body-1 text-ink'>{title}</span>
      </header>

      {isLoading ? (
        <ul>
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="px-4 py-3 space-y-2">
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-2.5 w-1/2" />
            </li>
          ))}
        </ul>
      ) : visible.length === 0 ? (
        <EmptyText className="px-4 py-6">{emptyMessage}</EmptyText>
      ) : (
        <ul className="list-disc">
          {visible.map((item) => (
            <li key={item.id} className="pl-2 ml-8 mr-4 py-1 space-y-1 marker:text-danger">
              <div className="flex items-start justify-between gap-2">
                <p className="text-body-3 text-ink-soft truncate">{item.title}</p>
                {item.trailing}
              </div>
              <p className="text-caption text-muted-ink truncate">{item.caption}</p>
            </li>
          ))}
        </ul>
      )}

      {hiddenCount > 0 && (
        <p className="px-4 py-2 text-caption text-muted-ink">
          +{hiddenCount}건 더
        </p>
      )}
    </section>
  );
};
