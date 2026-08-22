import dayjs from 'dayjs';

import { api } from '../api';

export interface UpdateCommentRequestDto {
  content: string;
}

export interface UpdateCommentResponseDto {
  id: string;
  updated_at: string | number;
}

export interface UpdateCommentResponse {
  id: string;
  updatedAt: number;
}

const mapUpdateCommentResponseDtoToEntity = (
  dto: UpdateCommentResponseDto,
): UpdateCommentResponse => ({
  id: dto.id,
  updatedAt: dayjs(dto.updated_at).valueOf(),
});

/**
 * PATCH /interaction/v1/comments/{comment_id} - 댓글 수정
 */
export const updateComment = async (
  commentId: string,
  body: UpdateCommentRequestDto,
): Promise<UpdateCommentResponse> => {
  const response = await api.patch<UpdateCommentResponseDto>(
    `/interaction/v1/comments/${commentId}`,
    body,
  );
  return mapUpdateCommentResponseDtoToEntity(response.data);
};

/**
 * DELETE /interaction/v1/comments/{comment_id} - 댓글 삭제
 */
export const deleteComment = async (commentId: string): Promise<void> => {
  await api.delete<void>(`/interaction/v1/comments/${commentId}`);
};
