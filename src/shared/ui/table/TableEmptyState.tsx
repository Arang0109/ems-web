interface TableEmptyStateProps {
  icon: React.ReactNode;
  label: React.ReactNode;
  subLabel: React.ReactNode;
}

export const TableEmptyState = ({
  icon, label, subLabel
}: TableEmptyStateProps) => {
  return(
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-xs text-muted-foreground/70 mt-0.5">{subLabel}</p>
      </div>
    </div>
  );
}