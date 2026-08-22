import { useEffect, useState } from 'react';

import InlineFilter from '../InlineFilter';

interface FilterOption<T extends string> {
  label: string;
  value: T;
}

interface ReportFilterValue<TReportType extends string, TStatus extends string> {
  dateFrom: string;
  dateTo: string;
  reportType?: TReportType;
  search: string;
  status?: TStatus;
}

interface ReportFilterProps<TReportType extends string, TStatus extends string> {
  dateFrom: string;
  dateTo: string;
  reportType?: TReportType;
  reportTypes: readonly FilterOption<TReportType>[];
  search: string;
  searchLabel: string;
  searchPlaceholder: string;
  status?: TStatus;
  statuses: readonly FilterOption<TStatus>[];
  onSubmit: (value: ReportFilterValue<TReportType, TStatus>) => void;
}

function ReportFilter<TReportType extends string, TStatus extends string>({
  dateFrom,
  dateTo,
  reportType,
  reportTypes,
  search,
  searchLabel,
  searchPlaceholder,
  status,
  statuses,
  onSubmit,
}: ReportFilterProps<TReportType, TStatus>) {
  const [draftReportType, setDraftReportType] = useState<TReportType | ''>(reportType ?? '');
  const [draftStatus, setDraftStatus] = useState<TStatus | ''>(status ?? '');
  const [draftDateFrom, setDraftDateFrom] = useState(dateFrom);
  const [draftDateTo, setDraftDateTo] = useState(dateTo);
  const filterCount = [reportType, status, dateFrom, dateTo].filter(Boolean).length;

  useEffect(() => {
    setDraftReportType(reportType ?? '');
    setDraftStatus(status ?? '');
    setDraftDateFrom(dateFrom);
    setDraftDateTo(dateTo);
  }, [dateFrom, dateTo, reportType, status]);

  const resetDraftFilters = () => {
    setDraftReportType('');
    setDraftStatus('');
    setDraftDateFrom('');
    setDraftDateTo('');
  };

  return (
    <InlineFilter
      contentClassName="gap-4"
      filterCount={filterCount}
      search={search}
      searchLabel={searchLabel}
      searchPlaceholder={searchPlaceholder}
      onSubmit={(nextSearch) =>
        onSubmit({
          dateFrom: draftDateFrom,
          dateTo: draftDateTo,
          search: nextSearch,
          ...(draftReportType ? { reportType: draftReportType } : {}),
          ...(draftStatus ? { status: draftStatus } : {}),
        })
      }
    >
      <div className="min-w-44 space-y-2">
        <label htmlFor={`${searchLabel}-report-type`} className="block text-sm font-medium">
          신고 유형
        </label>
        <select
          id={`${searchLabel}-report-type`}
          value={draftReportType}
          onChange={(event) => setDraftReportType(event.target.value as TReportType | '')}
          className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-xl border px-3 text-sm outline-none focus-visible:ring-2"
        >
          <option value="">전체</option>
          {reportTypes.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="min-w-44 space-y-2">
        <label htmlFor={`${searchLabel}-status`} className="block text-sm font-medium">
          신고 상태
        </label>
        <select
          id={`${searchLabel}-status`}
          value={draftStatus}
          onChange={(event) => setDraftStatus(event.target.value as TStatus | '')}
          className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-xl border px-3 text-sm outline-none focus-visible:ring-2"
        >
          <option value="">전체</option>
          {statuses.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor={`${searchLabel}-date-from`} className="block text-sm font-medium">
          시작일
        </label>
        <input
          id={`${searchLabel}-date-from`}
          type="date"
          value={draftDateFrom}
          onChange={(event) => setDraftDateFrom(event.target.value)}
          className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-xl border px-3 text-sm outline-none focus-visible:ring-2"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor={`${searchLabel}-date-to`} className="block text-sm font-medium">
          종료일
        </label>
        <input
          id={`${searchLabel}-date-to`}
          type="date"
          value={draftDateTo}
          onChange={(event) => setDraftDateTo(event.target.value)}
          className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-xl border px-3 text-sm outline-none focus-visible:ring-2"
        />
      </div>

      <button
        type="button"
        className="text-muted-foreground hover:text-foreground h-9 text-xs"
        onClick={resetDraftFilters}
      >
        필터 초기화
      </button>
    </InlineFilter>
  );
}

export default ReportFilter;
export type { ReportFilterValue };
