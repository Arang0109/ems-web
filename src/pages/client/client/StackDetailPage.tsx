import { PageTitle } from '@shared/ui/semantics';

import { StackProfile } from '@widgets/stack-profile';

export const StackDetailPage = () => {

  return (
    <div className="p-6 space-y-5 min-h-full">
      <PageTitle title="측정시설 상세" description="측정시설 상세정보 관리 페이지입니다." />

      <StackProfile />
    </div>
  );
};
