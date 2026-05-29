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
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{subLabel}</p>
      </div>
    </div>
  );
}