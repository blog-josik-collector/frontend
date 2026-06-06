import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { BookmarkIcon } from 'lucide-react';

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
import {
  usePostingBookmarkStore,
  usePostingDetailStore,
} from '@/stores/posting/postingStore';

const pageSize = 20;

const formatDate = (ts: number) =>
  new Date(ts).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });

const MyBookmark = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const { bookmarks, loading, error, fetchBookmarks, deleteBookmark } =
    usePostingBookmarkStore();
  const { postingDetailEntity, fetchPostingDetail } = usePostingDetailStore();

  useEffect(() => {
    fetchBookmarks({ page, size: pageSize });
  }, [fetchBookmarks, page]);

  useEffect(() => {
    bookmarks.forEach((bookmark) => {
      if (!postingDetailEntity[bookmark.postId]) {
        fetchPostingDetail(bookmark.postId);
      }
    });
  }, [bookmarks, fetchPostingDetail, postingDetailEntity]);

  const handleNavigateToPost = (postId: string) => {
    navigate({ pathname: '/post', search: `?post-id=${postId}` });
  };

  const handleDeleteBookmark = async (postId: string) => {
    if (window.confirm('북마크를 해제하시겠습니까?')) {
      const shouldMoveToPreviousPage = page > 0 && bookmarks.length === 1;

      await deleteBookmark(postId);

      if (shouldMoveToPreviousPage) {
        setPage((prev) => Math.max(0, prev - 1));
        return;
      }

      await fetchBookmarks({ page, size: pageSize });
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">북마크 목록</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {loading ? '불러오는 중' : `${bookmarks.length.toLocaleString()}개 표시 중`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0 || loading}
              onClick={() => setPage((prev) => Math.max(0, prev - 1))}
            >
              이전
            </Button>
            <span className="text-muted-foreground text-sm">{page + 1}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={bookmarks.length < pageSize || loading}
              onClick={() => setPage((prev) => prev + 1)}
            >
              다음
            </Button>
          </div>
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20 text-center">해제</TableHead>
              <TableHead>제목</TableHead>
              <TableHead className="w-36">포스트 등록일</TableHead>
              <TableHead className="w-36">북마크 등록일</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookmarks.map((bookmark) => {
              const post = postingDetailEntity[bookmark.postId];

              return (
                <TableRow key={bookmark.postId}>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={loading}
                      onClick={() => handleDeleteBookmark(bookmark.postId)}
                    >
                      <BookmarkIcon className="size-4 fill-amber-400 text-amber-400" />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="link"
                      className="h-auto max-w-xl justify-start p-0 text-left whitespace-normal"
                      onClick={() => handleNavigateToPost(bookmark.postId)}
                    >
                      {post?.title ?? bookmark.postId}
                    </Button>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {post ? formatDate(post.publishedAt) : '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(bookmark.createdAt)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {loading && (
          <div className="text-muted-foreground py-8 text-center">
            북마크 목록을 불러오는 중입니다.
          </div>
        )}
        {!loading && !error && bookmarks.length === 0 && (
          <div className="text-muted-foreground py-8 text-center">등록된 북마크가 없습니다.</div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default MyBookmark;
