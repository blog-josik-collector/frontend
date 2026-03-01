import { useParams } from '@tanstack/react-router';

const PostDetail = () => {
  const { postId } = useParams({ from: '/post/$postId' });
  return <div className="flex flex-col gap-4 p-4">{postId}</div>;
};

export default PostDetail;
