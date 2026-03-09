import { HeartIcon, HeartOffIcon } from 'lucide-react';

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

interface FavoriteItem {
  id: number;
  title: string;
  likedAt: number;
  postedAt: number;
  liked: boolean;
}

const MOCK_DATA: FavoriteItem[] = [
  { id: 1, title: 'React 상태 관리 완벽 정리', likedAt: Date.now() - 1000 * 60 * 60 * 2,  postedAt: Date.now() - 1000 * 60 * 60 * 24 * 10, liked: true },
  { id: 2, title: 'TypeScript 제네릭 활용법',  likedAt: Date.now() - 1000 * 60 * 60 * 5,  postedAt: Date.now() - 1000 * 60 * 60 * 24 * 20, liked: true },
  { id: 3, title: 'TanStack Router 시작하기',  likedAt: Date.now() - 1000 * 60 * 60 * 24, postedAt: Date.now() - 1000 * 60 * 60 * 24 * 5,  liked: false },
  { id: 4, title: 'Tailwind CSS 고급 패턴',    likedAt: Date.now() - 1000 * 60 * 60 * 48, postedAt: Date.now() - 1000 * 60 * 60 * 24 * 30, liked: true },
];

const formatDate = (ts: number) =>
  new Date(ts).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });

const MyFavorite = () => {
  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-4 p-4">
        <h2 className="text-lg font-semibold">좋아요 목록</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16 text-center">좋아요</TableHead>
              <TableHead>제목</TableHead>
              <TableHead className="w-36">포스트 등록일</TableHead>
              <TableHead className="w-36">좋아요 등록일</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_DATA.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="text-center">
                  <Button variant="ghost" size="icon">
                    {item.liked ? (
                      <HeartIcon className="size-4 fill-rose-500 text-rose-500" />
                    ) : (
                      <HeartOffIcon className="size-4 text-muted-foreground" />
                    )}
                  </Button>
                </TableCell>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(item.postedAt)}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(item.likedAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ProtectedRoute>
  );
};

export default MyFavorite;
