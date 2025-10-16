import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  redirectPath?: string;
}

function ProtectedRoute({ redirectPath = '/auth' }: ProtectedRouteProps): JSX.Element {
  const isAuthenticated = checkAuth();

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
}

function checkAuth(): boolean {
  // Check localStorage first
  const localAuth = localStorage.getItem('studentLogin');
  if (localAuth) {
    try {
      const auth = JSON.parse(localAuth);
      // Add additional validation if needed (e.g., token expiration)
      return !!auth;
    } catch {
      localStorage.removeItem('studentLogin');
    }
  }

  // Check sessionStorage
  const sessionAuth = sessionStorage.getItem('studentLogin');
  if (sessionAuth) {
    try {
      const auth = JSON.parse(sessionAuth);
      return !! auth;
    } catch {
      sessionStorage.removeItem('studentLogin');
    }
  }

  return false;
}

export default ProtectedRoute;