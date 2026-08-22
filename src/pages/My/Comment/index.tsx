import { useState } from 'react';

import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { handleApiError } from '@/services/api';
import { useDeleteComment } from '@/stores/comments/commentsStore';
import { useMyComments } from '@/stores/comments/meStore';
import { useDeleteReply } from '@/stores/comments/repliesStore';

const pageSize = 20;

const formatDate = (date: number) =>
  new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

const MyComment = () => {
  const [page, setPage] = useState(0);
  const [deleteError, setDeleteError] = useState('');
  const myComments = useMyComments({ page, size: pageSize });
  const deleteComment = useDeleteComment();
  const deleteReply = useDeleteReply();

  const comments = myComments.data?.items ?? [];
  const totalCount = myComments.data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handleDeleteComment = (commentId: string, isReply: boolean) => {
    if (isReply === false) {
      // Handle comment deletion
      if (window.confirm('댓글을 삭제하시겠습니까?')) {
        const shouldMoveToPreviousPage = page > 0 && comments.length === 1;

        deleteComment.mutate(
          { commentId },
          {
            onSuccess: () => {
              setDeleteError('');
              if (shouldMoveToPreviousPage) {
                setPage((prev) => Math.max(0, prev - 1));
              }
            },
            onError: (error) => {
              setDeleteError(handleApiError(error).message);
            },
          },
        );
      }
    } else {
      // Handle reply deletion
      if (window.confirm('대댓글을 삭제하시겠습니까?')) {
        const shouldMoveToPreviousPage = page > 0 && comments.length === 1;

        deleteReply.mutate(
          { replyId: commentId },
          {
            onSuccess: () => {
              setDeleteError('');
              if (shouldMoveToPreviousPage) {
                setPage((prev) => Math.max(0, prev - 1));
              }
            },
            onError: (error) => {
              setDeleteError(handleApiError(error).message);
            },
          },
        );
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">내가 작성한 댓글</h2>
          <p className="text-muted-foreground mt-1 text-sm">총 {totalCount.toLocaleString()}개</p>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0 || myComments.isFetching}
              onClick={() => setPage((prev) => Math.max(0, prev - 1))}
            >
              이전
            </Button>
            <span className="text-muted-foreground text-sm">
              {page + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page + 1 >= totalPages || myComments.isFetching}
              onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
            >
              다음
            </Button>
          </div>
        )}
      </div>

      {deleteError && <p className="text-destructive text-sm">{deleteError}</p>}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>댓글 내용</TableHead>
            <TableHead className="w-36">작성일</TableHead>
            <TableHead className="w-24 text-center">삭제</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {comments.map((comment) => (
            <TableRow key={comment.id}>
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
                  onClick={() => handleDeleteComment(comment.id, comment.hasParentComment)}
                  disabled={deleteComment.isPending}
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {myComments.isLoading && (
        <div className="text-muted-foreground py-8 text-center">댓글을 불러오는 중입니다.</div>
      )}
      {myComments.isError && (
        <div className="text-destructive py-8 text-center">
          {handleApiError(myComments.error).message}
        </div>
      )}
      {!myComments.isLoading &&
        !myComments.isFetching &&
        !myComments.isError &&
        comments.length === 0 && (
          <div className="text-muted-foreground py-8 text-center">작성한 댓글이 없습니다.</div>
        )}
    </div>
  );
};

export default MyComment;
