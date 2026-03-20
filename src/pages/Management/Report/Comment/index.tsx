import { useState } from 'react';

import { FilterIcon, MoreHorizontalIcon, SearchIcon, XIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const REPORT_TYPES = ['스팸', '욕설/혐오', '부적절 콘텐츠', '저작권 침해', '기타'] as const;
const REPORT_STATUSES = ['대기중', '삭제완료', '유지'] as const;

type ReportType = (typeof REPORT_TYPES)[number];
type ReportStatus = (typeof REPORT_STATUSES)[number];

interface CommentReportItem {
  id: number;
  postTitle: string;
  comment: string;
  reportType: ReportType;
  reportedAt: string;
  content: string;
  status: ReportStatus;
}

const STATUS_STYLES: Record<ReportStatus, string> = {
  대기중: 'bg-yellow-100 text-yellow-700',
  삭제완료: 'bg-red-100 text-red-700',
  유지: 'bg-green-100 text-green-700',
};

const MOCK_DATA: CommentReportItem[] = [
  {
    id: 1,
    postTitle: 'React 상태 관리 완벽 정리',
    comment: '이 글 완전 쓰레기네요',
    reportType: '욕설/혐오',
    reportedAt: '2026-03-01',
    content: '욕설이 포함된 댓글입니다.',
    status: '대기중',
  },
  {
    id: 2,
    postTitle: 'TypeScript 제네릭 활용법',
    comment: '광고 클릭하면 할인 받아요!',
    reportType: '스팸',
    reportedAt: '2026-03-03',
    content: '광고성 댓글입니다.',
    status: '삭제완료',
  },
  {
    id: 3,
    postTitle: 'TanStack Router 시작하기',
    comment: '이 내용은 제 블로그에서 가져간 겁니다.',
    reportType: '저작권 침해',
    reportedAt: '2026-03-05',
    content: '무단 복제 관련 신고입니다.',
    status: '유지',
  },
  {
    id: 4,
    postTitle: 'Tailwind CSS 고급 패턴',
    comment: '19금 내용 링크입니다 http://...',
    reportType: '부적절 콘텐츠',
    reportedAt: '2026-03-06',
    content: '부적절한 외부 링크가 포함되어 있습니다.',
    status: '유지',
  },
  {
    id: 5,
    postTitle: 'Vite 빌드 최적화',
    comment: '그냥 신고해봄',
    reportType: '기타',
    reportedAt: '2026-03-07',
    content: '기타 사유로 신고합니다.',
    status: '대기중',
  },
];

export function CommentReport() {
  const [search, setSearch] = useState('');
  const [selectedReportTypes, setSelectedReportTypes] = useState<ReportType[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<ReportStatus[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const toggleReportType = (r: ReportType) =>
    setSelectedReportTypes((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r],
    );

  const toggleStatus = (s: ReportStatus) =>
    setSelectedStatuses((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const activeFilterCount =
    selectedReportTypes.length + selectedStatuses.length + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0);

  const activeTags = [
    ...selectedReportTypes.map((r) => ({
      key: `type-${r}`,
      label: r,
      onRemove: () => toggleReportType(r),
    })),
    ...selectedStatuses.map((s) => ({
      key: `status-${s}`,
      label: s,
      onRemove: () => toggleStatus(s),
    })),
    ...(dateFrom
      ? [{ key: 'dateFrom', label: `from ${dateFrom}`, onRemove: () => setDateFrom('') }]
      : []),
    ...(dateTo ? [{ key: 'dateTo', label: `~ ${dateTo}`, onRemove: () => setDateTo('') }] : []),
  ];

  const resetFilters = () => {
    setSelectedReportTypes([]);
    setSelectedStatuses([]);
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* 통합 필터 */}
      <div className="bg-background focus-within:ring-ring flex items-center rounded-xl border shadow-sm focus-within:ring-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 px-3 py-2 text-sm transition-colors">
              <FilterIcon className="size-4" />
              <span>필터</span>
              {activeFilterCount > 0 && (
                <span className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-xs font-medium">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56"
            align="start"
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            {/* 신고 유형 */}
            <DropdownMenuLabel>신고 유형</DropdownMenuLabel>
            <DropdownMenuGroup>
              {REPORT_TYPES.map((r) => (
                <DropdownMenuCheckboxItem
                  key={r}
                  checked={selectedReportTypes.includes(r)}
                  onCheckedChange={() => toggleReportType(r)}
                >
                  {r}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* 신고 상태 */}
            <DropdownMenuLabel>신고 상태</DropdownMenuLabel>
            <DropdownMenuGroup>
              {REPORT_STATUSES.map((s) => (
                <DropdownMenuCheckboxItem
                  key={s}
                  checked={selectedStatuses.includes(s)}
                  onCheckedChange={() => toggleStatus(s)}
                >
                  {s}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* 날짜 */}
            <DropdownMenuLabel>신고 날짜</DropdownMenuLabel>
            <div className="flex flex-col gap-1.5 px-3 pb-2">
              <Input
                type="date"
                className="h-8 text-xs"
                value={dateFrom}
                onPointerDown={(e) => e.stopPropagation()}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              <Input
                type="date"
                className="h-8 text-xs"
                value={dateTo}
                onPointerDown={(e) => e.stopPropagation()}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

            {activeFilterCount > 0 && (
              <>
                <DropdownMenuSeparator />
                <button
                  className="text-muted-foreground hover:text-foreground w-full px-3 py-2 text-left text-xs transition-colors"
                  onClick={resetFilters}
                >
                  필터 초기화
                </button>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="bg-border mx-1 h-5 w-px" />
        <span className="text-muted-foreground pl-2">
          <SearchIcon className="size-4" />
        </span>
        <Input
          className="flex-1 border-0 shadow-none focus-visible:ring-0"
          placeholder="포스트 제목으로 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            className="text-muted-foreground hover:text-foreground pr-3"
            onClick={() => setSearch('')}
          >
            <XIcon className="size-4" />
          </button>
        )}
      </div>

      {/* 선택된 필터 태그 */}
      {activeTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeTags.map((tag) => (
            <span
              key={tag.key}
              className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
            >
              {tag.label}
              <button onClick={tag.onRemove} className="hover:opacity-70">
                <XIcon className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* 테이블 */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>포스트 제목</TableHead>
            <TableHead>신고 댓글</TableHead>
            <TableHead className="w-32">신고 유형</TableHead>
            <TableHead className="w-28">신고 날짜</TableHead>
            <TableHead>신고 내용</TableHead>
            <TableHead className="w-24">신고 상태</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {MOCK_DATA.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.postTitle}</TableCell>
              <TableCell className="text-muted-foreground max-w-40 truncate">
                {item.comment}
              </TableCell>
              <TableCell>
                <span className="bg-muted inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium">
                  {item.reportType}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground">{item.reportedAt}</TableCell>
              <TableCell className="text-muted-foreground max-w-xs truncate">
                {item.content}
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[item.status]}`}
                >
                  {item.status}
                </span>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                      <MoreHorizontalIcon />
                      <span className="sr-only">메뉴 열기</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>유지</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive">삭제</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default CommentReport;
