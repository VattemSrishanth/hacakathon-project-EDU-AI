import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PublicRouteProps {
  children: React.ReactElement;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const { isAuthenticated } = useAuth();

  // Only redirect if user is authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Allow access to public routes (login, register) when not authenticated
  return children;
};

export default PublicRoute;
