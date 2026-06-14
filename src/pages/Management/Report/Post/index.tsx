import { useMemo, useState } from 'react';

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  FilterIcon,
  MoreHorizontalIcon,
  SearchIcon,
  XIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
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
import { type GetAdminReportsParams, PostingReportReasonType } from '@/services/report';
import {
  useAdminPostingReports,
  useUpdateAdminPostingReportStatus,
} from '@/stores/reports/postingReportsStore';

const PAGE_SIZE = 20;

const REPORT_TYPES = [
  { value: PostingReportReasonType.PostError, label: '포스트 오류' },
  { value: PostingReportReasonType.LinkError, label: '링크 오류' },
  { value: PostingReportReasonType.Other, label: '기타' },
] as const;

const REPORT_STATUSES = [
  { value: 'OPEN', label: '대기중' },
  { value: 'DONE', label: '처리완료' },
] as const;

type ReportType = (typeof REPORT_TYPES)[number]['value'];
type ReportStatus = (typeof REPORT_STATUSES)[number]['value'];

const STATUS_STYLES: Record<ReportStatus, string> = {
  OPEN: 'bg-yellow-100 text-yellow-700',
  DONE: 'bg-green-100 text-green-700',
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

const getReportTypeLabel = (value: string) =>
  REPORT_TYPES.find((item) => item.value === value)?.label ?? value;

const getStatusLabel = (value: string) =>
  REPORT_STATUSES.find((item) => item.value === value)?.label ?? value;

export function PostReport() {
  const [search, setSearch] = useState('');
  const [selectedReportTypes, setSelectedReportTypes] = useState<ReportType[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<ReportStatus[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(0);

  const params = useMemo<GetAdminReportsParams>(
    () => ({
      page,
      size: PAGE_SIZE,
      reason_type: selectedReportTypes[0],
      status: selectedStatuses[0],
      start_date: dateFrom || undefined,
      end_date: dateTo || undefined,
    }),
    [dateFrom, dateTo, page, selectedReportTypes, selectedStatuses],
  );

  const { data, isError, isLoading } = useAdminPostingReports(params);
  const updateStatusMutation = useUpdateAdminPostingReportStatus();

  const toggleReportType = (reportType: ReportType) => {
    setPage(0);
    setSelectedReportTypes((prev) =>
      prev.includes(reportType) ? prev.filter((item) => item !== reportType) : [reportType],
    );
  };

  const toggleStatus = (status: ReportStatus) => {
    setPage(0);
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((item) => item !== status) : [status],
    );
  };

  const handleDateFromChange = (value: string) => {
    setPage(0);
    setDateFrom(value);
  };

  const handleDateToChange = (value: string) => {
    setPage(0);
    setDateTo(value);
  };

  const activeFilterCount =
    selectedReportTypes.length + selectedStatuses.length + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0);

  const activeTags = [
    ...selectedReportTypes.map((reportType) => ({
      key: `type-${reportType}`,
      label: getReportTypeLabel(reportType),
      onRemove: () => toggleReportType(reportType),
    })),
    ...selectedStatuses.map((status) => ({
      key: `status-${status}`,
      label: getStatusLabel(status),
      onRemove: () => toggleStatus(status),
    })),
    ...(dateFrom
      ? [{ key: 'dateFrom', label: `from ${dateFrom}`, onRemove: () => handleDateFromChange('') }]
      : []),
    ...(dateTo
      ? [{ key: 'dateTo', label: `~ ${dateTo}`, onRemove: () => handleDateToChange('') }]
      : []),
  ];

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const items = data?.items ?? [];

    if (!keyword) return items;

    return items.filter((item) =>
      [item.postId, item.userId, item.reportTypeCode, item.content].some((value) =>
        value.toLowerCase().includes(keyword),
      ),
    );
  }, [data?.items, search]);

  const totalCount = data?.totalCount ?? 0;
  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const resetFilters = () => {
    setSelectedReportTypes([]);
    setSelectedStatuses([]);
    setDateFrom('');
    setDateTo('');
    setPage(0);
  };

  const updateReportStatus = (reportId: string, status: ReportStatus) => {
    updateStatusMutation.mutate({ reportId, body: { status } });
  };

  return (
    <div className="flex flex-col gap-4 p-4">
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
            onCloseAutoFocus={(event) => event.preventDefault()}
          >
            <DropdownMenuLabel>신고 유형</DropdownMenuLabel>
            <DropdownMenuGroup>
              {REPORT_TYPES.map((reportType) => (
                <DropdownMenuCheckboxItem
                  key={reportType.value}
                  checked={selectedReportTypes.includes(reportType.value)}
                  onCheckedChange={() => toggleReportType(reportType.value)}
                >
                  {reportType.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuLabel>신고 상태</DropdownMenuLabel>
            <DropdownMenuGroup>
              {REPORT_STATUSES.map((status) => (
                <DropdownMenuCheckboxItem
                  key={status.value}
                  checked={selectedStatuses.includes(status.value)}
                  onCheckedChange={() => toggleStatus(status.value)}
                >
                  {status.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuLabel>신고 날짜</DropdownMenuLabel>
            <div className="flex flex-col gap-1.5 px-3 pb-2">
              <Input
                type="date"
                className="h-8 text-xs"
                value={dateFrom}
                onPointerDown={(event) => event.stopPropagation()}
                onChange={(event) => handleDateFromChange(event.target.value)}
              />
              <Input
                type="date"
                className="h-8 text-xs"
                value={dateTo}
                onPointerDown={(event) => event.stopPropagation()}
                onChange={(event) => handleDateToChange(event.target.value)}
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
          placeholder="포스트 ID, 신고자 ID, 신고 내용으로 검색"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>포스트 ID</TableHead>
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
              <TableCell className="font-medium">{item.postId}</TableCell>
              <TableCell className="text-muted-foreground">{item.userId}</TableCell>
              <TableCell>
                <span className="bg-muted inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium">
                  {getReportTypeLabel(item.reportTypeCode)}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground">{formatDate(item.createdAt)}</TableCell>
              <TableCell className="text-muted-foreground max-w-xs truncate">
                {item.content || '-'}
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    STATUS_STYLES[item.processed as ReportStatus] ?? 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {getStatusLabel(item.processed)}
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
                      onClick={() => updateReportStatus(item.id, 'OPEN')}
                    >
                      대기중으로 변경
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      disabled={updateStatusMutation.isPending}
                      onClick={() => updateReportStatus(item.id, 'DONE')}
                    >
                      처리완료
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
        <ButtonGroup aria-label="신고 목록 페이지네이션">
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

export default PostReport;
