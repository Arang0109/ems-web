import { useRegisterSW } from "virtual:pwa-register/react";

import { toast } from "@shared/ui/toasts";

/** 새 배포를 확인하는 주기. 홈 화면 앱은 며칠씩 켜 둔 채 쓰여 탐색만으로는 업데이트를 늦게 알아챈다 */
const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

/**
 * PWA 서비스워커 등록 + 새 버전 안내.
 *
 * `registerType: 'prompt'` 라 새 SW 는 대기 상태로 머문다 — 작성 중인 폼이 강제 새로고침으로
 * 날아가지 않게, 사용자가 [새로고침] 을 누를 때만 교체한다.
 * 프로덕션 빌드에서만 렌더한다(개발 모드는 MSW 서비스워커가 같은 scope 를 쓴다).
 */
export const PwaUpdatePrompt = () => {
  const { updateServiceWorker } = useRegisterSW({
    onRegisteredSW: (_url, registration) => {
      if (!registration) return;
      setInterval(() => void registration.update(), UPDATE_CHECK_INTERVAL_MS);
    },
    onNeedRefresh: () => {
      toast.prompt("새 버전이 있습니다.", {
        label: "새로고침",
        onClick: () => void updateServiceWorker(true),
      });
    },
  });

  return null;
};
