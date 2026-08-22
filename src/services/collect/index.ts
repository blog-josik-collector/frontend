import dayjs from 'dayjs';

import { api } from '../api';

export interface CollectListParams {
  page?: number;
  size?: number;
}

export interface CreateProviderRequestDto {
  name: string;
  base_url: string;
  description: string;
}

export interface CreateProviderResponseDto {
  provider_id: string;
  created_at: string | number;
}

export interface CreateProviderResponse {
  providerId: string;
  createdAt: number;
}

export interface ProviderDto {
  provider_id: string;
  name: string;
  base_url: string;
  description: string;
  is_used: boolean;
  has_using_collect_source?: boolean;
  using_collect_source_id?: string;
  created_at: string | number;
  updated_at: string | number;
}

export interface Provider {
  providerId: string;
  name: string;
  baseUrl: string;
  description: string;
  isUsed: boolean;
  hasUsingCollectSource?: boolean;
  usingCollectSourceId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface GetProvidersResponseDto {
  total_count: number;
  page: number;
  size: number;
  items: ProviderDto[];
}

export interface GetProvidersResponse {
  totalCount: number;
  page: number;
  size: number;
  items: Provider[];
}

export interface UpdateProviderRequestDto {
  base_url: string;
  description: string;
  is_used: boolean;
}

export interface UpdateProviderResponseDto {
  provider_id: string;
  updated_at: string | number;
}

export interface UpdateProviderResponse {
  providerId: string;
  updatedAt: number;
}

export type ScheduleType = 'manual' | 'cron';

export type CreateSourceRequestDto =
  | {
      provider_id: string;
      url: string;
      schedule_type: 'manual';
    }
  | {
      provider_id: string;
      url: string;
      schedule_type: 'cron';
      cron_expression: string;
      cron_from_page: number;
      cron_to_page: number;
    };

export interface CreateSourceResponseDto {
  source_id: string;
  created_at: string | number;
}

export interface CreateSourceResponse {
  sourceId: string;
  createdAt: number;
}

export interface SourceDto {
  source_id: string;
  provider_id: string;
  url: string;
  schedule_type: ScheduleType;
  cron_expression?: string;
  cron_from_page?: number;
  cron_to_page?: number;
  is_used: boolean;
  created_at: string | number;
  updated_at: string | number;
}

export interface Source {
  sourceId: string;
  providerId: string;
  url: string;
  scheduleType: ScheduleType;
  cronExpression?: string;
  cronFromPage?: number;
  cronToPage?: number;
  isUsed: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface GetSourcesResponseDto {
  total_count: number;
  page: number;
  size: number;
  items: SourceDto[];
}

export interface GetSourcesResponse {
  totalCount: number;
  page: number;
  size: number;
  items: Source[];
}

export interface UpdateSourceRequestDto {
  url: string;
  collect_schedule_type: ScheduleType;
  is_used: boolean;
  cron_expression?: string;
  cron_from_page?: number;
  cron_to_page?: number;
}

export interface UpdateSourceResponseDto {
  source_id: string;
  updated_at: string | number;
}

export interface UpdateSourceResponse {
  sourceId: string;
  updatedAt: number;
}

export interface StartCollectJobResponseDto {
  job_id: string;
  job_status: string;
}

export interface StartCollectJobResponse {
  jobId: string;
  jobStatus: string;
}

export interface StartCollectJobParams {
  from_page?: string;
  to_page?: string;
  force_recollect?: boolean;
}

export type JobStatus = 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
export type CollectingStatus =
  | 'discovered'
  | 'fetched'
  | 'fetch_failed'
  | 'parsed'
  | 'parse_failed';

export interface CollectJobDto {
  job_id: string;
  job_status: JobStatus;
  collecting_status: CollectingStatus;
  triggered_by: string;
  from_page: number;
  to_page: number;
  force_recollect: boolean;
  total_count: number;
  collected_count: number;
  attempt_count: number;
  started_at: string | number;
  ended_at?: string | number;
  error_message?: string;
}

export interface CollectJob {
  jobId: string;
  jobStatus: JobStatus;
  collectingStatus: CollectingStatus;
  triggeredBy: string;
  fromPage: number;
  toPage: number;
  forceRecollect: boolean;
  totalCount: number;
  collectedCount: number;
  attemptCount: number;
  startedAt: number;
  endedAt?: number;
  errorMessage?: string;
}

export interface GetCollectJobsResponseDto {
  total_count: number;
  page: number;
  size: number;
  items: CollectJobDto[];
}

export interface GetCollectJobsResponse {
  totalCount: number;
  page: number;
  size: number;
  items: CollectJob[];
}

export interface CollectPostingDto {
  posting_id: string;
  collect_source_id: string;
  title: string;
  summary: string;
  url: string;
  published_at: string | number;
  thumbnail_url: string;
  indexing_error_count: number;
  indexing_status: 'pending' | 'indexing' | 'indexed' | 'failed' | 'skipped';
  last_collected_at: string | number;
  last_collecting_job_id: string;
  last_indexed_at?: string | number;
}

export interface CollectPosting {
  postingId: string;
  collectSourceId: string;
  title: string;
  summary: string;
  url: string;
  publishedAt: number;
  thumbnailUrl: string;
  indexingErrorCount: number;
  indexingStatus: 'pending' | 'indexing' | 'indexed' | 'failed' | 'skipped';
  lastCollectedAt: number;
  lastCollectingJobId: string;
  lastIndexedAt?: number;
}

const mapCreateProviderResponseDtoToEntity = (
  dto: CreateProviderResponseDto,
): CreateProviderResponse => ({
  providerId: dto.provider_id,
  createdAt: dayjs(dto.created_at).valueOf(),
});

const mapProviderDtoToEntity = (dto: ProviderDto): Provider => ({
  providerId: dto.provider_id,
  name: dto.name,
  baseUrl: dto.base_url,
  description: dto.description,
  isUsed: dto.is_used,
  hasUsingCollectSource: dto.has_using_collect_source,
  usingCollectSourceId: dto.using_collect_source_id,
  createdAt: dayjs(dto.created_at).valueOf(),
  updatedAt: dayjs(dto.updated_at).valueOf(),
});

const mapGetProvidersResponseDtoToEntity = (
  dto: GetProvidersResponseDto,
): GetProvidersResponse => ({
  totalCount: dto.total_count,
  page: dto.page,
  size: dto.size,
  items: dto.items.map(mapProviderDtoToEntity),
});

const mapUpdateProviderResponseDtoToEntity = (
  dto: UpdateProviderResponseDto,
): UpdateProviderResponse => ({
  providerId: dto.provider_id,
  updatedAt: dayjs(dto.updated_at).valueOf(),
});

const mapCreateSourceResponseDtoToEntity = (
  dto: CreateSourceResponseDto,
): CreateSourceResponse => ({
  sourceId: dto.source_id,
  createdAt: dayjs(dto.created_at).valueOf(),
});

const mapSourceDtoToEntity = (dto: SourceDto): Source => ({
  sourceId: dto.source_id,
  providerId: dto.provider_id,
  url: dto.url,
  scheduleType: dto.schedule_type,
  cronExpression: dto.cron_expression,
  cronFromPage: dto.cron_from_page,
  cronToPage: dto.cron_to_page,
  isUsed: dto.is_used,
  createdAt: dayjs(dto.created_at).valueOf(),
  updatedAt: dayjs(dto.updated_at).valueOf(),
});

const mapGetSourcesResponseDtoToEntity = (dto: GetSourcesResponseDto): GetSourcesResponse => ({
  totalCount: dto.total_count,
  page: dto.page,
  size: dto.size,
  items: dto.items.map(mapSourceDtoToEntity),
});

const mapUpdateSourceResponseDtoToEntity = (
  dto: UpdateSourceResponseDto,
): UpdateSourceResponse => ({
  sourceId: dto.source_id,
  updatedAt: dayjs(dto.updated_at).valueOf(),
});

const mapStartCollectJobResponseDtoToEntity = (
  dto: StartCollectJobResponseDto,
): StartCollectJobResponse => ({
  jobId: dto.job_id,
  jobStatus: dto.job_status,
});

const mapCollectJobDtoToEntity = (dto: CollectJobDto): CollectJob => ({
  jobId: dto.job_id,
  jobStatus: dto.job_status,
  collectingStatus: dto.collecting_status,
  triggeredBy: dto.triggered_by,
  fromPage: dto.from_page,
  toPage: dto.to_page,
  forceRecollect: dto.force_recollect,
  totalCount: dto.total_count,
  collectedCount: dto.collected_count,
  attemptCount: dto.attempt_count,
  startedAt: dayjs(dto.started_at).valueOf(),
  endedAt: dto.ended_at ? dayjs(dto.ended_at).valueOf() : undefined,
  errorMessage: dto.error_message,
});

const mapGetCollectJobsResponseDtoToEntity = (
  dto: GetCollectJobsResponseDto,
): GetCollectJobsResponse => ({
  totalCount: dto.total_count,
  page: dto.page,
  size: dto.size,
  items: dto.items.map(mapCollectJobDtoToEntity),
});

const mapCollectPostingDtoToEntity = (dto: CollectPostingDto): CollectPosting => ({
  postingId: dto.posting_id,
  collectSourceId: dto.collect_source_id,
  title: dto.title,
  summary: dto.summary,
  url: dto.url,
  publishedAt: dayjs(dto.published_at).valueOf(),
  thumbnailUrl: dto.thumbnail_url,
  indexingErrorCount: dto.indexing_error_count,
  indexingStatus: dto.indexing_status,
  lastCollectedAt: dayjs(dto.last_collected_at).valueOf(),
  lastCollectingJobId: dto.last_collecting_job_id,
  lastIndexedAt: dto.last_indexed_at ? dayjs(dto.last_indexed_at).valueOf() : undefined,
});

/**
 * POST /collect/v1/providers - Provider 등록
 */
export const createProvider = async (
  body: CreateProviderRequestDto,
): Promise<CreateProviderResponse> => {
  const response = await api.post<CreateProviderResponseDto>('/collect/v1/providers', body);
  return mapCreateProviderResponseDtoToEntity(response.data);
};

/**
 * GET /collect/v1/providers - Provider 목록 조회
 */
export const getProviders = async (
  params: CollectListParams = { page: 0, size: 20 },
): Promise<GetProvidersResponse> => {
  const response = await api.get<GetProvidersResponseDto>('/collect/v1/providers', { params });
  return mapGetProvidersResponseDtoToEntity(response.data);
};

/**
 * GET /collect/v1/providers/{provider-id} - Provider 한 건 조회
 */
export const getProvider = async (providerId: string): Promise<Provider> => {
  const response = await api.get<ProviderDto>(`/collect/v1/providers/${providerId}`);
  return mapProviderDtoToEntity(response.data);
};

/**
 * PATCH /collect/v1/providers/{provider-id} - Provider 수정
 */
export const updateProvider = async (
  providerId: string,
  body: UpdateProviderRequestDto,
): Promise<UpdateProviderResponse> => {
  const response = await api.patch<UpdateProviderResponseDto>(
    `/collect/v1/providers/${providerId}`,
    body,
  );
  return mapUpdateProviderResponseDtoToEntity(response.data);
};

/**
 * DELETE /collect/v1/providers/{provider-id} - Provider 삭제
 */
export const deleteProvider = async (providerId: string): Promise<void> => {
  await api.delete<void>(`/collect/v1/providers/${providerId}`);
};

/**
 * POST /collect/v1/sources - 수집 소스 등록
 */
export const createSource = async (body: CreateSourceRequestDto): Promise<CreateSourceResponse> => {
  const response = await api.post<CreateSourceResponseDto>('/collect/v1/sources', body);
  return mapCreateSourceResponseDtoToEntity(response.data);
};

/**
 * GET /collect/v1/sources - 수집 소스 목록 조회
 */
export const getSources = async (
  params: CollectListParams = { page: 0, size: 20 },
): Promise<GetSourcesResponse> => {
  const response = await api.get<GetSourcesResponseDto>('/collect/v1/sources', { params });
  return mapGetSourcesResponseDtoToEntity(response.data);
};

/**
 * GET /collect/v1/sources/{source-id} - 수집 소스 조회
 */
export const getSource = async (sourceId: string): Promise<Source> => {
  const response = await api.get<SourceDto>(`/collect/v1/sources/${sourceId}`);
  return mapSourceDtoToEntity(response.data);
};

/**
 * PATCH /collect/v1/sources/{source-id} - 수집 소스 수정
 */
export const updateSource = async (
  sourceId: string,
  body: UpdateSourceRequestDto,
): Promise<UpdateSourceResponse> => {
  const response = await api.patch<UpdateSourceResponseDto>(
    `/collect/v1/sources/${sourceId}`,
    body,
  );
  return mapUpdateSourceResponseDtoToEntity(response.data);
};

/**
 * DELETE /collect/v1/sources/{source-id} - 수집 소스 삭제
 */
export const deleteSource = async (sourceId: string): Promise<void> => {
  await api.delete<void>(`/collect/v1/sources/${sourceId}`);
};

/**
 * POST /collect/v1/sources/{source-id}/_start - 수집 작업 실행
 */
export const startCollectJob = async (
  sourceId: string,
  params: StartCollectJobParams = {},
): Promise<StartCollectJobResponse> => {
  const response = await api.post<StartCollectJobResponseDto>(
    `/collect/v1/sources/${sourceId}/_start`,
    undefined,
    { params },
  );
  return mapStartCollectJobResponseDtoToEntity(response.data);
};

/**
 * POST /collect/v1/sources/{source-id}/_stop - 수집 작업 종료
 */
export const stopCollectJob = async (sourceId: string): Promise<void> => {
  await api.post<void>(`/collect/v1/sources/${sourceId}/_stop`);
};

/**
 * GET /collect/v1/jobs - 수집 작업 상태 목록 조회
 */
export const getCollectJobs = async (
  params: CollectListParams = { page: 0, size: 20 },
): Promise<GetCollectJobsResponse> => {
  const response = await api.get<GetCollectJobsResponseDto>('/collect/v1/jobs', { params });
  return mapGetCollectJobsResponseDtoToEntity(response.data);
};

/**
 * GET /collect/v1/jobs/{job-id} - 수집 작업 상태 조회
 */
export const getCollectJob = async (jobId: string): Promise<CollectJob> => {
  const response = await api.get<CollectJobDto>(`/collect/v1/jobs/${jobId}`);
  return mapCollectJobDtoToEntity(response.data);
};

/**
 * GET /collect/v1/postings/{posting-id} - 수집 결과 원문/메타 조회
 */
export const getCollectPosting = async (postingId: string): Promise<CollectPosting> => {
  const response = await api.get<CollectPostingDto>(`/collect/v1/postings/${postingId}`);
  return mapCollectPostingDtoToEntity(response.data);
};
