import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';





const AdminRoute = ({ children }) => {
  const { auth, isAuthenticated } = useAuth();

  // Redirect if not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ message: 'Please log in to access admin panel' }} />;
  }

  // Redirect if not an admin
  if (auth?.user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;