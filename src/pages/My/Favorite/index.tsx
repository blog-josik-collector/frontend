import ProtectedRoute from '@/components/ProtectedRoute';

const MyFavorite = () => {
  return (
    <ProtectedRoute>
      <div>My Favorite Page</div>
    </ProtectedRoute>
  );
};

export default MyFavorite;
