
import { PollutantTable } from "@widgets/pollutant-table";
import { PageTitle } from "@shared/ui/semantics";

export const PollutantPage = () => {
  return(
    <div className="p-6 space-y-5 min-h-full">
      <PageTitle title="측정물질 조회/관리" description="측정물질 조회 및 관리 페이지입니다." />

      <PollutantTable />
    </div>
  );
}