import ProtectedRoute from '@/components/ProtectedRoute';

const MyBookmark = () => {
  return (
    <ProtectedRoute>
      <div>My Bookmark Page</div>
    </ProtectedRoute>
  );
};

export default MyBookmark;
