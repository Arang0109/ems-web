import {
  Tabs as TabsPrimitive,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

interface TabOption {
  value: string;
  label: string;
  content: React.ReactNode;
}

interface Props {
  gap?: number;
  options: TabOption[];
}

export const Tabs = ({
  gap=0,
  options
}: Props) => {
  const defaultValue = options[0]?.value;

  return(
    <TabsPrimitive defaultValue={defaultValue}>
      <TabsList className={`gap-${gap}`} >
        {options.map((opt) => {
          return(
            <TabsTrigger key={opt.value} value={opt.value}>{opt.label}</TabsTrigger>
          );
        })}
      </TabsList>
        {options.map((opt) => {
          return(
            <TabsContent key={opt.value} value={opt.value}>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                {opt.content}
              </div>
            </TabsContent>
          );
        })}
    </TabsPrimitive>
  );
}