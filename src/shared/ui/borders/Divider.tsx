interface DividerProps {
  text?: string;
}

export const Divider = ({ text }: DividerProps) => {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-slate-200"></div>
      </div>
      <div className="relative flex justify-center text-[11px]">
        <span className="px-2 bg-white/95 text-neutral-500">{text}</span>
      </div>
    </div>
  );
}