import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";

export const SortIcon = ({ sorted }: { sorted: false | 'asc' | 'desc' }) => {
  if (sorted === 'asc')  return <ChevronUp  size={14} className="ml-1 shrink-0 text-blue-500" />;
  if (sorted === 'desc') return <ChevronDown size={14} className="ml-1 shrink-0 text-blue-500" />;
  return <ChevronsUpDown size={14} className="ml-1 shrink-0 text-gray-300" />;
};