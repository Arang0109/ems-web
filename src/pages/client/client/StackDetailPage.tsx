import { PageLayout } from '@shared/ui/layout';

import { StackProfile } from '@widgets/stack-profile';

export const StackDetailPage = () => {

  return (
    <PageLayout title="측정시설 상세" description="측정시설 상세정보 관리 페이지입니다.">
      <StackProfile />
    </PageLayout>
  );
};
