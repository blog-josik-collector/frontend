import dayjs from 'dayjs';

import { api } from '../api';

export interface MyCommentDto {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  status?: string;
  created_at: string | number;
  updated_at: string | number;
}

export interface GetMyCommentsResponseDto {
  total_count: number;
  items: MyCommentDto[];
}

export interface MyComment {
  id: string;
  userId: string;
  postId: string;
  content: string;
  status?: string;
  createdAt: number;
  updatedAt: number;
}

export interface GetMyCommentsResponse {
  totalCount: number;
  items: MyComment[];
}

export interface GetMyCommentsParams {
  page?: number;
  size?: number;
}

const mapMyCommentDtoToEntity = (dto: MyCommentDto): MyComment => ({
  id: dto.id,
  userId: dto.user_id,
  postId: dto.post_id,
  content: dto.content,
  status: dto.status,
  createdAt: dayjs(dto.created_at).valueOf(),
  updatedAt: dayjs(dto.updated_at).valueOf(),
});

const mapGetMyCommentsResponseDtoToEntity = (
  dto: GetMyCommentsResponseDto,
): GetMyCommentsResponse => ({
  totalCount: dto.total_count,
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
