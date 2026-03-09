import { BookmarkIcon, BookmarkXIcon } from 'lucide-react';

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

interface BookmarkItem {
  id: number;
  title: string;
  bookmarkedAt: number;
  postedAt: number;
  bookmarked: boolean;
}

const MOCK_DATA: BookmarkItem[] = [
  { id: 1, title: 'React 상태 관리 완벽 정리', bookmarkedAt: Date.now() - 1000 * 60 * 60 * 2,  postedAt: Date.now() - 1000 * 60 * 60 * 24 * 10, bookmarked: true },
  { id: 2, title: 'TypeScript 제네릭 활용법',  bookmarkedAt: Date.now() - 1000 * 60 * 60 * 5,  postedAt: Date.now() - 1000 * 60 * 60 * 24 * 20, bookmarked: true },
  { id: 3, title: 'TanStack Router 시작하기',  bookmarkedAt: Date.now() - 1000 * 60 * 60 * 24, postedAt: Date.now() - 1000 * 60 * 60 * 24 * 5,  bookmarked: false },
  { id: 4, title: 'Tailwind CSS 고급 패턴',    bookmarkedAt: Date.now() - 1000 * 60 * 60 * 48, postedAt: Date.now() - 1000 * 60 * 60 * 24 * 30, bookmarked: true },
];

const formatDate = (ts: number) =>
  new Date(ts).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });

const MyBookmark = () => {
  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-4 p-4">
        <h2 className="text-lg font-semibold">북마크 목록</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16 text-center">북마크</TableHead>
              <TableHead>제목</TableHead>
              <TableHead className="w-36">포스트 등록일</TableHead>
              <TableHead className="w-36">북마크 등록일</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_DATA.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="text-center">
                  <Button variant="ghost" size="icon">
                    {item.bookmarked ? (
                      <BookmarkIcon className="size-4 fill-amber-400 text-amber-400" />
                    ) : (
                      <BookmarkXIcon className="size-4 text-muted-foreground" />
                    )}
                  </Button>
                </TableCell>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(item.postedAt)}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(item.bookmarkedAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ProtectedRoute>
  );
};

export default MyBookmark;
