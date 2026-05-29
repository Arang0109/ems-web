
interface SummaryCardProps {
  count: number,
  label: string,
  unit: string,
  icon: React.ReactNode,
  color?: string,
  ring?: string,
}

export const SummaryCard = ({
  count,
  label,
  unit,
  icon,
  color = 'bg-blue-50 text-blue-600',
  ring = 'ring-blue-100',
}: SummaryCardProps) => {
  return(
    <div
      className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4 flex items-center gap-4"
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ring-2 shrink-0 ${color} ${ring}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 truncate">{label}</p>
        <p className="text-2xl font-bold text-gray-800 leading-tight">
          {count}
          <span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>
        </p>
      </div>
    </div>
  );
}