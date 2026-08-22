import { useMemo, useState } from 'react';

import { ArrowLeftIcon, ArrowRightIcon, MoreHorizontalIcon } from 'lucide-react';

import ReportFilter from '../ReportFilter';

import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CommentReportReasonType, type GetAdminReportsParams } from '@/services/report';
import {
  useAdminCommentReports,
  useUpdateAdminCommentReportStatus,
} from '@/stores/reports/commentReportsStore';

const PAGE_SIZE = 20;

const REPORT_TYPES = [
  { value: CommentReportReasonType.Political, label: '정치' },
  { value: CommentReportReasonType.Adult, label: '성인' },
  { value: CommentReportReasonType.Other, label: '기타' },
] as const;

const REPORT_STATUSES = [
  { value: 'pending', label: '대기중' },
  { value: 'resolved_deleted', label: '삭제 처리' },
  { value: 'rejected_keep', label: '유지' },
] as const;

type ReportType = (typeof REPORT_TYPES)[number]['value'];
type ReportStatus = (typeof REPORT_STATUSES)[number]['value'];

const STATUS_STYLES: Record<ReportStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  resolved_deleted: 'bg-green-100 text-green-700',
  rejected_keep: 'bg-gray-100 text-gray-700',
};

const formatDate = (timestamp?: number) => {
  if (!timestamp) return '-';

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp);
};

const getReportTypeLabel = (value?: string) => {
  if (!value) return '-';

  return REPORT_TYPES.find((item) => item.value === value)?.label ?? value;
};

const getStatusLabel = (value?: string) => {
  if (!value) return '-';

  return REPORT_STATUSES.find((item) => item.value === value)?.label ?? value;
};

export function CommentReport() {
  const [search, setSearch] = useState('');
  const [reportType, setReportType] = useState<ReportType>();
  const [status, setStatus] = useState<ReportStatus>();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(0);

  const params = useMemo<GetAdminReportsParams>(
    () => ({
      page,
      size: PAGE_SIZE,
      report_type: reportType,
      status,
      start_date: dateFrom || undefined,
      end_date: dateTo || undefined,
    }),
    [dateFrom, dateTo, page, reportType, status],
  );

  const { data, isError, isLoading } = useAdminCommentReports(params);
  const updateStatusMutation = useUpdateAdminCommentReportStatus();

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const items = data?.items ?? [];

    if (!keyword) return items;

    return items.filter((item) =>
      [item.commentId, item.reporterId, item.reportType, item.content].some((value) =>
        value.toLowerCase().includes(keyword),
      ),
    );
  }, [data?.items, search]);

  const totalCount = data?.totalCount ?? 0;
  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const updateReportStatus = (reportId: string, status: ReportStatus) => {
    updateStatusMutation.mutate({ reportId, body: { status } });
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <ReportFilter
        dateFrom={dateFrom}
        dateTo={dateTo}
        reportType={reportType}
        reportTypes={REPORT_TYPES}
        search={search}
        searchLabel="댓글 신고 검색"
        searchPlaceholder="신고 내용으로 검색"
        status={status}
        statuses={REPORT_STATUSES}
        onSubmit={(nextValue) => {
          setSearch(nextValue.search);
          setReportType(nextValue.reportType);
          setStatus(nextValue.status);
          setDateFrom(nextValue.dateFrom);
          setDateTo(nextValue.dateTo);
          setPage(0);
        }}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>댓글 ID</TableHead>
            <TableHead>신고자 ID</TableHead>
            <TableHead className="w-32">신고 유형</TableHead>
            <TableHead className="w-40">신고 날짜</TableHead>
            <TableHead>신고 내용</TableHead>
            <TableHead className="w-24">신고 상태</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={7} className="text-muted-foreground h-24 text-center">
                신고 목록을 불러오는 중입니다.
              </TableCell>
            </TableRow>
          )}
          {isError && (
            <TableRow>
              <TableCell colSpan={7} className="text-destructive h-24 text-center">
                신고 목록을 불러오지 못했습니다.
              </TableCell>
            </TableRow>
          )}
          {!isLoading && !isError && filteredItems.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-muted-foreground h-24 text-center">
                표시할 신고가 없습니다.
              </TableCell>
            </TableRow>
          )}
          {filteredItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.commentId ?? '-'}</TableCell>
              <TableCell className="text-muted-foreground">{item.reporterId}</TableCell>
              <TableCell>
                <span className="bg-muted inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium">
                  {getReportTypeLabel(item.reportType)}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground">{formatDate(item.createdAt)}</TableCell>
              <TableCell className="text-muted-foreground max-w-xs truncate">
                {item.content || '-'}
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    STATUS_STYLES[item.status as ReportStatus] ?? 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {getStatusLabel(item.status)}
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
                    <DropdownMenuItem
                      disabled={updateStatusMutation.isPending}
                      onClick={() => updateReportStatus(item.id, 'pending')}
                    >
                      대기중으로 변경
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      disabled={updateStatusMutation.isPending}
                      onClick={() => updateReportStatus(item.id, 'resolved_deleted')}
                    >
                      삭제 처리
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={updateStatusMutation.isPending}
                      onClick={() => updateReportStatus(item.id, 'rejected_keep')}
                    >
                      신고 반려·댓글 유지
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between gap-4">
        <p className="text-muted-foreground text-sm">총 {totalCount}건</p>
        <ButtonGroup aria-label="댓글 신고 목록 페이지네이션">
          <Button
            variant="secondary"
            disabled={page === 0}
            onClick={() => setPage((prev) => Math.max(0, prev - 1))}
          >
            <ArrowLeftIcon />
          </Button>
          <Button variant="outline" disabled>
            {page + 1} / {pageCount}
          </Button>
          <Button
            variant="secondary"
            disabled={page + 1 >= pageCount}
            onClick={() => setPage((prev) => Math.min(pageCount - 1, prev + 1))}
          >
            <ArrowRightIcon />
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
}

export default CommentReport;
