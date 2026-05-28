import { Search } from 'lucide-react';

interface SearchInputProps {
  filter: string;
  setFilter: (value: React.SetStateAction<string>) => void;
}

export const SearchInput = ({ filter, setFilter }: SearchInputProps) => {
  return (
    <div className="relative w-full sm:w-72">
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <input
        type="text"
        placeholder="거래처명 검색…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition"
      />
    </div>
  );
}