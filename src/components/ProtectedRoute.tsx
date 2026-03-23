import { Navigate } from 'react-router';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredAuth?: boolean;
  redirectTo?: string;
}

const ProtectedRoute = ({ 
  children, 
  requiredAuth = true, 
  redirectTo = '/signin' 
}: ProtectedRouteProps) => {
  // TODO: 실제 권한 검사 로직 구현
  const hasAuth = true; // 임시: 실제로는 auth context나 store에서 확인

  if (!hasAuth && requiredAuth) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
