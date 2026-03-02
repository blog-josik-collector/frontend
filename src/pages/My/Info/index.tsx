import ProtectedRoute from '@/components/ProtectedRoute';

const MyInfo = () => {
  return (
    <ProtectedRoute>
      <div>My Info Page</div>
    </ProtectedRoute>
  );
};

export default MyInfo;
