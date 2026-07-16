import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";

export const SortIcon = ({ sorted }: { sorted: false | 'asc' | 'desc' }) => {
  if (sorted === 'asc')  return <ChevronUp  size={14} className="ml-1 shrink-0 text-blue-500 dark:text-blue-400" />;
  if (sorted === 'desc') return <ChevronDown size={14} className="ml-1 shrink-0 text-blue-500 dark:text-blue-400" />;
  return <ChevronsUpDown size={14} className="ml-1 shrink-0 text-muted-foreground/40" />;
};