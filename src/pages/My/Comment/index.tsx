import { Trash2 } from 'lucide-react';

import { useNavigate } from 'react-router';

import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface MyCommentData {
  id: string;
  postTitle: string;
  content: string;
  createdAt: string;
  postId: string;
}

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

const MyComment = () => {
  const navigate = useNavigate();

  // Mock data - 실제로는 API를 통해 데이터를 가져와야 합니다
  const myComments: MyCommentData[] = [
    {
      id: '1',
      postTitle: '블로그 포스트 제목',
      content: '첫 번째 댓글입니다.',
      createdAt: '2024-03-01',
      postId: '1',
    },
    {
      id: '2',
      postTitle: '또 다른 포스트',
      content: '@댓글 작성자1 대댓글입니다.',
      createdAt: '2024-03-02',
      postId: '2',
    },
    {
      id: '3',
      postTitle: '기술 관련 글',
      content: '좋은 정보 감사합니다!',
      createdAt: '2024-03-03',
      postId: '3',
    },
  ];

  const handleDeleteComment = (commentId: string) => {
    // 실제로는 API를 통해 댓글 삭제
    if (window.confirm('댓글을 삭제하시겠습니까?')) {
      alert(`댓글 ${commentId}가 삭제되었습니다.`);
      // 여기에서 실제 삭제 로직 구현
    }
  };

  const handleNavigateToPost = (postId: string) => {
    // 포스트로 이동하는 로직
    navigate({ pathname: '/post', search: `?post-id=${postId}` });
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-4 p-4">
        <h2 className="text-lg font-semibold">내가 작성한 댓글</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>포스트 이름</TableHead>
              <TableHead>댓글 내용</TableHead>
              <TableHead className="w-36">작성일</TableHead>
              <TableHead className="w-24 text-center">삭제</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {myComments.map((comment) => (
              <TableRow key={comment.id}>
                <TableCell>
                  <Button
                    variant="link"
                    className="h-auto p-0 text-left"
                    onClick={() => handleNavigateToPost(comment.postId)}
                  >
                    {comment.postTitle}
                  </Button>
                </TableCell>
                <TableCell className="max-w-md">
                  <p className="truncate text-sm">{comment.content}</p>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDate(comment.createdAt)}
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {myComments.length === 0 && (
          <div className="text-muted-foreground py-8 text-center">작성한 댓글이 없습니다.</div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default MyComment;
