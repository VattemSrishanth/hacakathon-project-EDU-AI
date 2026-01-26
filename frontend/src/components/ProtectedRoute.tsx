import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuth();

  // If not logged in (either logged_out or guest), redirect to login for restricted routes
  if (!isAuthenticated) {
    // If it's a guest, they can remain on public pages, but restricted pages should send them to login
    // or we can allow guests on some pages but App.tsx wraps restricted ones with ProtectedRoute.
    return <Navigate to="/login" replace state={{ message: 'Please log in to access this feature' }} />;
  }

  return children;
};

export default ProtectedRoute;
