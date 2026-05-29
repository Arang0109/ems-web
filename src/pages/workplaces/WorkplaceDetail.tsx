import { PageTitle } from "@shared/ui/semantics";

import { useWorkplaceDetailViewModel } from "@/features/workplace-detail";

export const WorkplaceDetail = () => {
  const { workplace } = useWorkplaceDetailViewModel();

  const workplaceD = workplace?.workplace;

  return (
    <div className="p-6">
      <PageTitle title={`${workplaceD?.name}`} description="사업장 상세정보를 확인할 수 있습니다."/>
    </div>
  );
};