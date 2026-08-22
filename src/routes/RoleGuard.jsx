import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function RoleGuard({ children, allowedRole }) {
  const { profile, loading } = useAuth();
  if (loading) return null;

  if (allowedRole === 'HR/Admin' && profile?.role !== 'HR/Admin') {
    return <Navigate to="/employee/dashboard" replace />;
  }
  if (allowedRole === 'Employee' && profile?.role === 'HR/Admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
}
