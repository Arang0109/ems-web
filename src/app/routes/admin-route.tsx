import { Navigate } from 'react-router';
import { useAuth, isAdmin } from '@entities/auth';

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  if (!isAdmin(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
