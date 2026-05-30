import { Separator } from "@/components/ui/separator";

interface DividerProps {
  text?: string;
}

export const Divider = ({ text }: DividerProps) => {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <Separator />
      </div>
      <div className="relative flex justify-center text-[11px]">
        <span className="px-2 bg-white/95 text-neutral-500">{text}</span>
      </div>
    </div>
  );
}