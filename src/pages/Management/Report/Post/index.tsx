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

const PROVIDERS = ['토스', '카카오', '네이버', '라인'] as const;
const REPORT_TYPES = ['스팸', '욕설/혐오', '부적절 콘텐츠', '저작권 침해', '기타'] as const;

type Provider = (typeof PROVIDERS)[number];
type ReportType = (typeof REPORT_TYPES)[number];

interface ReportItem {
  id: number;
  title: string;
  provider: Provider;
  reportType: ReportType;
  reportedAt: string;
  content: string;
}

const MOCK_DATA: ReportItem[] = [
  { id: 1, title: 'React 상태 관리 완벽 정리', provider: '토스',   reportType: '스팸',           reportedAt: '2026-03-01', content: '광고성 내용이 포함되어 있습니다.' },
  { id: 2, title: 'TypeScript 제네릭 활용법',  provider: '카카오', reportType: '욕설/혐오',       reportedAt: '2026-03-03', content: '부적절한 표현이 다수 포함되어 있습니다.' },
  { id: 3, title: 'TanStack Router 시작하기',  provider: '네이버', reportType: '저작권 침해',     reportedAt: '2026-03-05', content: '출처 없이 타 사이트 내용을 복사했습니다.' },
  { id: 4, title: 'Tailwind CSS 고급 패턴',    provider: '라인',   reportType: '부적절 콘텐츠',   reportedAt: '2026-03-06', content: '연령 제한 콘텐츠가 포함되어 있습니다.' },
  { id: 5, title: 'Vite 빌드 최적화',          provider: '토스',   reportType: '기타',            reportedAt: '2026-03-07', content: '기타 사유로 신고합니다.' },
];

export function PostReport() {
  const [search, setSearch] = useState('');
  const [selectedProviders, setSelectedProviders] = useState<Provider[]>([]);
  const [selectedReportTypes, setSelectedReportTypes] = useState<ReportType[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const toggleProvider = (p: Provider) =>
    setSelectedProviders((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);

  const toggleReportType = (r: ReportType) =>
    setSelectedReportTypes((prev) => prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]);

  const activeFilterCount =
    selectedProviders.length +
    selectedReportTypes.length +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0);

  const activeTags = [
    ...selectedProviders.map((p) => ({ key: `provider-${p}`, label: p, onRemove: () => toggleProvider(p) })),
    ...selectedReportTypes.map((r) => ({ key: `type-${r}`, label: r, onRemove: () => toggleReportType(r) })),
    ...(dateFrom ? [{ key: 'dateFrom', label: `from ${dateFrom}`, onRemove: () => setDateFrom('') }] : []),
    ...(dateTo   ? [{ key: 'dateTo',   label: `~ ${dateTo}`,      onRemove: () => setDateTo('')   }] : []),
  ];

  const resetFilters = () => {
    setSelectedProviders([]);
    setSelectedReportTypes([]);
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div className="flex flex-col gap-4 p-4">

      {/* 통합 필터 */}
      <div className="flex items-center rounded-xl border bg-background shadow-sm focus-within:ring-2 focus-within:ring-ring">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <FilterIcon className="size-4" />
              <span>필터</span>
              {activeFilterCount > 0 && (
                <span className="flex items-center justify-center size-5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
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
            {/* Provider */}
            <DropdownMenuLabel>Provider</DropdownMenuLabel>
            <DropdownMenuGroup>
              {PROVIDERS.map((p) => (
                <DropdownMenuCheckboxItem
                  key={p}
                  checked={selectedProviders.includes(p)}
                  onCheckedChange={() => toggleProvider(p)}
                >
                  {p}
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

            <DropdownMenuSeparator />

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

            {activeFilterCount > 0 && (
              <>
                <DropdownMenuSeparator />
                <button
                  className="w-full px-3 py-2 text-xs text-muted-foreground hover:text-foreground text-left transition-colors"
                  onClick={resetFilters}
                >
                  필터 초기화
                </button>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-5 w-px bg-border mx-1" />
        <span className="pl-2 text-muted-foreground">
          <SearchIcon className="size-4" />
        </span>
        <Input
          className="border-0 shadow-none focus-visible:ring-0 flex-1"
          placeholder="제목으로 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            className="pr-3 text-muted-foreground hover:text-foreground"
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
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium"
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
            <TableHead>제목</TableHead>
            <TableHead className="w-32">신고 유형</TableHead>
            <TableHead className="w-28">신고 날짜</TableHead>
            <TableHead>신고 내용</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {MOCK_DATA.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.title}</TableCell>
              <TableCell>
                <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                  {item.reportType}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground">{item.reportedAt}</TableCell>
              <TableCell className="text-muted-foreground max-w-xs truncate">{item.content}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                      <MoreHorizontalIcon />
                      <span className="sr-only">메뉴 열기</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>상태 업데이트</DropdownMenuItem>
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

export default PostReport;
