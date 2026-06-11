import { useNavigate } from 'react-router';
import { useAuth } from '@entities/auth';

import { toast } from '@shared/ui/toasts';

export const useSignOut = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    try {
      logout();
      toast.success("로그아웃 되었습니다.")
      navigate('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : '로그아웃에 실패했습니다.';
      toast.error(message);
    }
  };

  return {
    logout: handleSignOut
  };
};