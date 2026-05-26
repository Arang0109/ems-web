import { useNavigate } from 'react-router';
import { useAuth } from '@entities/auth/model';

export const useSignOut = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  return {
    logout: handleSignOut
  };
};