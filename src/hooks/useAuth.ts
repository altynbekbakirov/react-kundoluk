import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const navigate = useNavigate();

  const getAuthData = () => {
    const localAuth = localStorage.getItem('studentLogin');
    if (localAuth) {
      try {
        return JSON.parse(localAuth);
      } catch {
        localStorage.removeItem('studentLogin');
      }
    }

    const sessionAuth = sessionStorage.getItem('studentLogin');
    if (sessionAuth) {
      try {
        return JSON.parse(sessionAuth);
      } catch {
        sessionStorage.removeItem('studentLogin');
      }
    }

    return null;
  };

  const logout = () => {
    localStorage.removeItem('studentLogin');
    sessionStorage.removeItem('studentLogin');
    navigate('/auth');
  };

  const isAuthenticated = () => {
    return getAuthData() !== null;
  };

  return {
    authData: getAuthData(),
    isAuthenticated: isAuthenticated(),
    logout,
  };
}