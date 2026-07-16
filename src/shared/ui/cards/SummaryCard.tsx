
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
  color = 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400',
  ring = 'ring-blue-100 dark:ring-blue-500/20',
}: SummaryCardProps) => {
  return(
    <div
      className="bg-card rounded-2xl shadow-sm border border-border px-5 py-4 flex items-center gap-4"
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ring-2 shrink-0 ${color} ${ring}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className="text-2xl font-bold text-foreground leading-tight">
          {count}
          <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>
        </p>
      </div>
    </div>
  );
}