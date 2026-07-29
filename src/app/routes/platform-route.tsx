import { Navigate } from 'react-router';
import { useAuth, isPlatformAdmin } from '@entities/auth';

export const PlatformRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  if (!isPlatformAdmin(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
