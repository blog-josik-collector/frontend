import dayjs from 'dayjs';

import { api } from '../api';

export interface MyCommentDto {
  id: string;
  user_id: string;
  has_child_comment: boolean;
  content: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface GetMyCommentsResponseDto {
  total_count: number;
  page: number;
  size: number;
  items: MyCommentDto[];
}

export interface MyComment {
  id: string;
  userId: string;
  hasChildComment: boolean;
  content: string;
  status: string;
  createdAt: number;
  updatedAt: number;
}

export interface GetMyCommentsResponse {
  totalCount: number;
  page: number;
  size: number;
  items: MyComment[];
}

export interface GetMyCommentsParams {
  page?: number;
  size?: number;
}

const mapMyCommentDtoToEntity = (dto: MyCommentDto): MyComment => ({
  id: dto.id,
  userId: dto.user_id,
  hasChildComment: dto.has_child_comment,
  content: dto.content,
  status: dto.status,
  createdAt: dayjs(dto.created_at).valueOf(),
  updatedAt: dayjs(dto.updated_at).valueOf(),
});

const mapGetMyCommentsResponseDtoToEntity = (
  dto: GetMyCommentsResponseDto,
): GetMyCommentsResponse => ({
  totalCount: dto.total_count,
  page: dto.page,
  size: dto.size,
  items: dto.items.map(mapMyCommentDtoToEntity),
});

/**
 * GET /interaction/v1/me/comments - 내가 작성한 댓글 목록 조회
 */
export const getMyComments = async (
  params: GetMyCommentsParams = { page: 0, size: 20 },
): Promise<GetMyCommentsResponse> => {
  const response = await api.get<GetMyCommentsResponseDto>('/interaction/v1/me/comments', {
    params,
  });
  return mapGetMyCommentsResponseDtoToEntity(response.data);
};
