import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';

interface Props {
  sorted: false | 'asc' | 'desc';
}

/** 정렬 가능 헤더의 방향 표시. 활성은 brand-dark(글씨용 초록), 비활성은 muted-ink. */
export const SortIcon = ({ sorted }: Props) => {
  if (sorted === 'asc') return <ChevronUp size={14} className="ml-1 shrink-0 text-brand-dark" />;
  if (sorted === 'desc') return <ChevronDown size={14} className="ml-1 shrink-0 text-brand-dark" />;
  return <ChevronsUpDown size={14} className="ml-1 shrink-0 text-muted-ink" />;
};
