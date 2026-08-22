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
      <div className="relative flex justify-center text-caption">
        <span className="px-2 bg-background/95 text-muted-foreground">{text}</span>
      </div>
    </div>
  );
}