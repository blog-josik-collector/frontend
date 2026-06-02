import dayjs from 'dayjs';

import { api } from '../api';

export interface CreateReportRequestDto {
  reason_type: string;
  content: string;
}

export interface CreateReportResponseDto {
  id: string;
  created_at: string | number;
}

export interface CreateReportResponse {
  id: string;
  createdAt: number;
}

export interface GetAdminReportsParams {
  page?: number;
  size?: number;
  reason_type?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
}

export interface PostingReportDto {
  id?: string;
  user_id: string;
  post_id: string;
  report_type_code: string;
  content: string;
  created_at: string | number;
  processed: string;
}

export interface GetAdminPostingReportsResponseDto {
  total_count: number;
  items: PostingReportDto[];
}

export interface PostingReport {
  id?: string;
  userId: string;
  postId: string;
  reportTypeCode: string;
  content: string;
  createdAt: number;
  processed: string;
}

export interface GetAdminPostingReportsResponse {
  totalCount: number;
  items: PostingReport[];
}

export interface CommentReportDto {
  id: string;
  user_id?: string;
  comment_id?: string;
  post_id?: string;
  report_type_code?: string;
  reason_type?: string;
  content?: string;
  created_at?: string | number;
  updated_at?: string | number;
  processed?: string;
  status?: string;
}

export interface GetAdminCommentReportsResponseDto {
  total_count: number;
  items: CommentReportDto[];
}

export interface CommentReport {
  id: string;
  userId?: string;
  commentId?: string;
  postId?: string;
  reportTypeCode?: string;
  reasonType?: string;
  content?: string;
  createdAt?: number;
  updatedAt?: number;
  processed?: string;
  status?: string;
}

export interface GetAdminCommentReportsResponse {
  totalCount: number;
  items: CommentReport[];
}

export interface UpdateReportStatusRequestDto {
  status: string;
}

export interface UpdateReportStatusResponseDto {
  id: string;
  updated_at: string | number;
}

export interface UpdateReportStatusResponse {
  id: string;
  updatedAt: number;
}

const mapCreateReportResponseDtoToEntity = (
  dto: CreateReportResponseDto,
): CreateReportResponse => ({
  id: dto.id,
  createdAt: dayjs(dto.created_at).valueOf(),
});

const mapPostingReportDtoToEntity = (dto: PostingReportDto): PostingReport => ({
  id: dto.id,
  userId: dto.user_id,
  postId: dto.post_id,
  reportTypeCode: dto.report_type_code,
  content: dto.content,
  createdAt: dayjs(dto.created_at).valueOf(),
  processed: dto.processed,
});

const mapGetAdminPostingReportsResponseDtoToEntity = (
  dto: GetAdminPostingReportsResponseDto,
): GetAdminPostingReportsResponse => ({
  totalCount: dto.total_count,
  items: dto.items.map(mapPostingReportDtoToEntity),
});

const mapCommentReportDtoToEntity = (dto: CommentReportDto): CommentReport => ({
  id: dto.id,
  userId: dto.user_id,
  commentId: dto.comment_id,
  postId: dto.post_id,
  reportTypeCode: dto.report_type_code,
  reasonType: dto.reason_type,
  content: dto.content,
  createdAt: dto.created_at ? dayjs(dto.created_at).valueOf() : undefined,
  updatedAt: dto.updated_at ? dayjs(dto.updated_at).valueOf() : undefined,
  processed: dto.processed,
  status: dto.status,
});

const mapGetAdminCommentReportsResponseDtoToEntity = (
  dto: GetAdminCommentReportsResponseDto,
): GetAdminCommentReportsResponse => ({
  totalCount: dto.total_count,
  items: dto.items.map(mapCommentReportDtoToEntity),
});

const mapUpdateReportStatusResponseDtoToEntity = (
  dto: UpdateReportStatusResponseDto,
): UpdateReportStatusResponse => ({
  id: dto.id,
  updatedAt: dayjs(dto.updated_at).valueOf(),
});

/**
 * POST /api/v1/postings/{posting_id}/reports - 포스팅 신고 생성
 */
export const createPostingReport = async (
  postingId: string,
  body: CreateReportRequestDto,
): Promise<CreateReportResponse> => {
  const response = await api.post<CreateReportResponseDto>(
    `/api/v1/postings/${postingId}/reports`,
    body,
  );
  return mapCreateReportResponseDtoToEntity(response.data);
};

/**
 * POST /api/v1/comments/{comment_id}/reports - 댓글 신고 생성
 */
export const createCommentReport = async (
  commentId: string,
  body: CreateReportRequestDto,
): Promise<CreateReportResponse> => {
  const response = await api.post<CreateReportResponseDto>(
    `/api/v1/comments/${commentId}/reports`,
    body,
  );
  return mapCreateReportResponseDtoToEntity(response.data);
};

/**
 * GET /api/v1/admin/reports/postings - 관리자 포스팅 신고 목록 조회
 */
export const getAdminPostingReports = async (
  params: GetAdminReportsParams = { page: 0, size: 20 },
): Promise<GetAdminPostingReportsResponse> => {
  const response = await api.get<GetAdminPostingReportsResponseDto>(
    '/api/v1/admin/reports/postings',
    { params },
  );
  return mapGetAdminPostingReportsResponseDtoToEntity(response.data);
};

/**
 * PATCH /api/v1/admin/reports/postings/{report_id} - 관리자 포스팅 신고 상태 변경
 */
export const updateAdminPostingReportStatus = async (
  reportId: string,
  body: UpdateReportStatusRequestDto,
): Promise<UpdateReportStatusResponse> => {
  const response = await api.patch<UpdateReportStatusResponseDto>(
    `/api/v1/admin/reports/postings/${reportId}`,
    body,
  );
  return mapUpdateReportStatusResponseDtoToEntity(response.data);
};

/**
 * GET /api/v1/admin/reports/comments - 관리자 댓글 신고 목록 조회
 */
export const getAdminCommentReports = async (
  params: GetAdminReportsParams = { page: 0, size: 20 },
): Promise<GetAdminCommentReportsResponse> => {
  const response = await api.get<GetAdminCommentReportsResponseDto>(
    '/api/v1/admin/reports/comments',
    { params },
  );
  return mapGetAdminCommentReportsResponseDtoToEntity(response.data);
};

/**
 * PATCH /api/v1/admin/reports/comments/{report_id} - 관리자 댓글 신고 상태 변경
 */
export const updateAdminCommentReportStatus = async (
  reportId: string,
  body: UpdateReportStatusRequestDto,
): Promise<UpdateReportStatusResponse> => {
  const response = await api.patch<UpdateReportStatusResponseDto>(
    `/api/v1/admin/reports/comments/${reportId}`,
    body,
  );
  return mapUpdateReportStatusResponseDtoToEntity(response.data);
};
