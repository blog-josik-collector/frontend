/* eslint-disable no-redeclare */
import dayjs from 'dayjs';

import { api } from '../api';

export const PostingReportReasonType = {
  InvalidContent: 'invalid_content',
  BrokenLink: 'broken_link',
  Other: 'other',
} as const;

export type PostingReportReasonType =
  (typeof PostingReportReasonType)[keyof typeof PostingReportReasonType];

export const CommentReportReasonType = {
  Political: 'political',
  Adult: 'adult',
  Other: 'other',
} as const;

export type CommentReportReasonType =
  (typeof CommentReportReasonType)[keyof typeof CommentReportReasonType];

export const ReportProcessStatus = {
  Pending: 'pending',
  ResolvedDeleted: 'resolved_deleted',
  RejectedKeep: 'rejected_keep',
} as const;

export type ReportProcessStatus = (typeof ReportProcessStatus)[keyof typeof ReportProcessStatus];

export interface CreateReportRequestDto<TReasonType extends string = string> {
  report_type: TReasonType;
  content: string;
}

export interface CreateReportResponseDto {
  id: string;
  created_at: string;
}

export interface CreateReportResponse {
  id: string;
  createdAt: number;
}

export interface GetAdminReportsParams {
  page?: number;
  size?: number;
  report_type?: PostingReportReasonType | CommentReportReasonType;
  status?: ReportProcessStatus;
  start_date?: string;
  end_date?: string;
}

export interface PostingReportDto {
  id: string;
  reporter_id: string;
  post_id: string;
  report_type: PostingReportReasonType;
  content: string;
  created_at: string;
  updated_at: string;
  status: ReportProcessStatus;
}

export interface GetAdminPostingReportsResponseDto {
  total_count: number;
  page: number;
  size: number;
  items: PostingReportDto[];
}

export interface PostingReport {
  id: string;
  reporterId: string;
  postId: string;
  reportType: PostingReportReasonType;
  content: string;
  createdAt: number;
  updatedAt: number;
  status: ReportProcessStatus;
}

export interface GetAdminPostingReportsResponse {
  totalCount: number;
  page: number;
  size: number;
  items: PostingReport[];
}

export interface CommentReportDto {
  id: string;
  reporter_id: string;
  comment_id: string;
  report_type: CommentReportReasonType;
  content: string;
  created_at: string;
  updated_at: string;
  status: ReportProcessStatus;
}

export interface GetAdminCommentReportsResponseDto {
  total_count: number;
  page: number;
  size: number;
  items: CommentReportDto[];
}

export interface CommentReport {
  id: string;
  reporterId: string;
  commentId: string;
  reportType: CommentReportReasonType;
  content: string;
  createdAt: number;
  updatedAt: number;
  status: ReportProcessStatus;
}

export interface GetAdminCommentReportsResponse {
  totalCount: number;
  page: number;
  size: number;
  items: CommentReport[];
}

export interface UpdateReportStatusRequestDto {
  status: ReportProcessStatus;
}

export interface UpdateReportStatusResponseDto {
  id: string;
  status: ReportProcessStatus;
  updated_at: string;
}

export interface UpdateReportStatusResponse {
  id: string;
  status: ReportProcessStatus;
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
  reporterId: dto.reporter_id,
  postId: dto.post_id,
  reportType: dto.report_type,
  content: dto.content,
  createdAt: dayjs(dto.created_at).valueOf(),
  updatedAt: dayjs(dto.updated_at).valueOf(),
  status: dto.status,
});

const mapGetAdminPostingReportsResponseDtoToEntity = (
  dto: GetAdminPostingReportsResponseDto,
): GetAdminPostingReportsResponse => ({
  totalCount: dto.total_count,
  page: dto.page,
  size: dto.size,
  items: dto.items.map(mapPostingReportDtoToEntity),
});

const mapCommentReportDtoToEntity = (dto: CommentReportDto): CommentReport => ({
  id: dto.id,
  reporterId: dto.reporter_id,
  commentId: dto.comment_id,
  reportType: dto.report_type,
  content: dto.content,
  createdAt: dayjs(dto.created_at).valueOf(),
  updatedAt: dayjs(dto.updated_at).valueOf(),
  status: dto.status,
});

const mapGetAdminCommentReportsResponseDtoToEntity = (
  dto: GetAdminCommentReportsResponseDto,
): GetAdminCommentReportsResponse => ({
  totalCount: dto.total_count,
  page: dto.page,
  size: dto.size,
  items: dto.items.map(mapCommentReportDtoToEntity),
});

const mapUpdateReportStatusResponseDtoToEntity = (
  dto: UpdateReportStatusResponseDto,
): UpdateReportStatusResponse => ({
  id: dto.id,
  status: dto.status,
  updatedAt: dayjs(dto.updated_at).valueOf(),
});

/**
 * POST /interaction/v1/postings/{posting_id}/reports - 포스팅 신고 생성
 */
export const createPostingReport = async (
  postingId: string,
  body: CreateReportRequestDto<PostingReportReasonType>,
): Promise<CreateReportResponse> => {
  const response = await api.post<CreateReportResponseDto>(
    `/interaction/v1/postings/${postingId}/reports`,
    body,
  );
  return mapCreateReportResponseDtoToEntity(response.data);
};

/**
 * POST /interaction/v1/comments/{comment_id}/reports - 댓글 신고 생성
 */
export const createCommentReport = async (
  commentId: string,
  body: CreateReportRequestDto<CommentReportReasonType>,
): Promise<CreateReportResponse> => {
  const response = await api.post<CreateReportResponseDto>(
    `/interaction/v1/comments/${commentId}/reports`,
    body,
  );
  return mapCreateReportResponseDtoToEntity(response.data);
};

/**
 * GET /interaction/v1/admin/reports/postings - 관리자 포스팅 신고 목록 조회
 */
export const getAdminPostingReports = async (
  params: GetAdminReportsParams = { page: 0, size: 20 },
): Promise<GetAdminPostingReportsResponse> => {
  const response = await api.get<GetAdminPostingReportsResponseDto>(
    '/interaction/v1/admin/reports/postings',
    { params },
  );
  return mapGetAdminPostingReportsResponseDtoToEntity(response.data);
};

/**
 * PATCH /interaction/v1/admin/reports/postings/{report_id} - 관리자 포스팅 신고 상태 변경
 */
export const updateAdminPostingReportStatus = async (
  reportId: string,
  body: UpdateReportStatusRequestDto,
): Promise<UpdateReportStatusResponse> => {
  const response = await api.patch<UpdateReportStatusResponseDto>(
    `/interaction/v1/admin/reports/postings/${reportId}`,
    body,
  );
  return mapUpdateReportStatusResponseDtoToEntity(response.data);
};

/**
 * GET /interaction/v1/admin/reports/comments - 관리자 댓글 신고 목록 조회
 */
export const getAdminCommentReports = async (
  params: GetAdminReportsParams = { page: 0, size: 20 },
): Promise<GetAdminCommentReportsResponse> => {
  const response = await api.get<GetAdminCommentReportsResponseDto>(
    '/interaction/v1/admin/reports/comments',
    { params },
  );
  return mapGetAdminCommentReportsResponseDtoToEntity(response.data);
};

/**
 * PATCH /interaction/v1/admin/reports/comments/{report_id} - 관리자 댓글 신고 상태 변경
 */
export const updateAdminCommentReportStatus = async (
  reportId: string,
  body: UpdateReportStatusRequestDto,
): Promise<UpdateReportStatusResponse> => {
  const response = await api.patch<UpdateReportStatusResponseDto>(
    `/interaction/v1/admin/reports/comments/${reportId}`,
    body,
  );
  return mapUpdateReportStatusResponseDtoToEntity(response.data);
};
