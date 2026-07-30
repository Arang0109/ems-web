import type { LucideIcon } from "lucide-react";

interface SummaryCardProps {
  count: number,
  label: string,
  unit: string,
  icon: LucideIcon,
}

export const SummaryCard = ({
  count,
  label,
  unit,
  icon: Icon,
}: SummaryCardProps) => {

  return(
    <div
      className="bg-canvas rounded-panel p-3 flex items-center gap-4"
    >
      <div className={`
        flex items-center justify-center
        p-2.5 w-11 h-11 bg-surface
        rounded-panel ring-1 ring-rule shrink-0
        `}>
        <Icon size={19} className="text-brand-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-label text-link-soft">{label}</p>
        <p className="text-h1 text-ink">
          {count}
          <span className="text-body-2 text-muted-ink ml-1">{unit}</span>
        </p>
      </div>
    </div>
  );
}