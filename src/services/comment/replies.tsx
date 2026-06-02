import dayjs from 'dayjs';

import { api } from '../api';

export interface CreateReplyRequestDto {
  content: string;
}

export interface CreateReplyResponseDto {
  id: string;
  parent_id: string;
  created_at: string | number;
}

export interface CreateReplyResponse {
  id: string;
  parentId: string;
  createdAt: number;
}

export interface ReplyDto {
  id: string;
  user_id: string;
  post_id: string;
  parent_id?: string;
  parent_comment_id?: string;
  has_child_comment: boolean;
  content: string;
  status?: string;
  created_at: string | number;
  updated_at: string | number;
}

export interface GetCommentRepliesResponseDto {
  total_count: number;
  items: ReplyDto[];
}

export interface Reply {
  id: string;
  userId: string;
  postId: string;
  parentId?: string;
  hasChildComment: boolean;
  content: string;
  status?: string;
  createdAt: number;
  updatedAt: number;
}

export interface GetCommentRepliesResponse {
  totalCount: number;
  items: Reply[];
}

export interface GetCommentRepliesParams {
  page?: number;
  size?: number;
}

export interface UpdateReplyRequestDto {
  content: string;
}

export interface UpdateReplyResponseDto {
  id: string;
  updated_at: string | number;
}

export interface UpdateReplyResponse {
  id: string;
  updatedAt: number;
}

const mapCreateReplyResponseDtoToEntity = (dto: CreateReplyResponseDto): CreateReplyResponse => ({
  id: dto.id,
  parentId: dto.parent_id,
  createdAt: dayjs(dto.created_at).valueOf(),
});

const mapReplyDtoToEntity = (dto: ReplyDto): Reply => ({
  id: dto.id,
  userId: dto.user_id,
  postId: dto.post_id,
  parentId: dto.parent_id ?? dto.parent_comment_id,
  hasChildComment: dto.has_child_comment,
  content: dto.content,
  status: dto.status,
  createdAt: dayjs(dto.created_at).valueOf(),
  updatedAt: dayjs(dto.updated_at).valueOf(),
});

const mapGetCommentRepliesResponseDtoToEntity = (
  dto: GetCommentRepliesResponseDto,
): GetCommentRepliesResponse => ({
  totalCount: dto.total_count,
  items: dto.items.map(mapReplyDtoToEntity),
});

const mapUpdateReplyResponseDtoToEntity = (dto: UpdateReplyResponseDto): UpdateReplyResponse => ({
  id: dto.id,
  updatedAt: dayjs(dto.updated_at).valueOf(),
});

/**
 * POST /api/v1/comments/{comment_id}/replies - 답글 생성
 */
export const createReply = async (
  commentId: string,
  body: CreateReplyRequestDto,
): Promise<CreateReplyResponse> => {
  const response = await api.post<CreateReplyResponseDto>(
    `/api/v1/comments/${commentId}/replies`,
    body,
  );
  return mapCreateReplyResponseDtoToEntity(response.data);
};

/**
 * GET /api/v1/comments/{comment_id}/replies - 답글 목록 조회
 */
export const getCommentReplies = async (
  commentId: string,
  params: GetCommentRepliesParams = { page: 0, size: 20 },
): Promise<GetCommentRepliesResponse> => {
  const response = await api.get<GetCommentRepliesResponseDto>(
    `/api/v1/comments/${commentId}/replies`,
    { params },
  );
  return mapGetCommentRepliesResponseDtoToEntity(response.data);
};

/**
 * PATCH /api/v1/replies/{reply_id} - 답글 수정
 */
export const updateReply = async (
  replyId: string,
  body: UpdateReplyRequestDto,
): Promise<UpdateReplyResponse> => {
  const response = await api.patch<UpdateReplyResponseDto>(`/api/v1/replies/${replyId}`, body);
  return mapUpdateReplyResponseDtoToEntity(response.data);
};

/**
 * DELETE /api/v1/replies/{reply_id} - 답글 삭제
 */
export const deleteReply = async (replyId: string): Promise<void> => {
  await api.delete<void>(`/api/v1/replies/${replyId}`);
};
