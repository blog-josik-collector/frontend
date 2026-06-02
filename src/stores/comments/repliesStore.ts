import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createReply,
  type CreateReplyRequestDto,
  deleteReply,
  getCommentReplies,
  type GetCommentRepliesParams,
  updateReply,
  type UpdateReplyRequestDto,
} from '@/services/comment/replies';

export const commentRepliesQueryKey = {
  list: (commentId: string, params?: GetCommentRepliesParams) =>
    params
      ? (['comments', commentId, 'replies', params] as const)
      : (['comments', commentId, 'replies'] as const),
};

export const replyMutationKeys = {
  create: ['replies', 'create'] as const,
  update: ['replies', 'update'] as const,
  delete: ['replies', 'delete'] as const,
};

export const useCommentReplies = (
  commentId: string,
  params: GetCommentRepliesParams = { page: 0, size: 20 },
) =>
  useQuery({
    queryKey: commentRepliesQueryKey.list(commentId, params),
    queryFn: () => getCommentReplies(commentId, params),
    enabled: Boolean(commentId),
  });

export const useCreateReply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: replyMutationKeys.create,
    mutationFn: ({ commentId, body }: { commentId: string; body: CreateReplyRequestDto }) =>
      createReply(commentId, body),
    onSuccess: (_, { commentId }) => {
      queryClient.invalidateQueries({ queryKey: commentRepliesQueryKey.list(commentId) });
      queryClient.invalidateQueries({ queryKey: ['postings'] });
    },
  });
};

export const useUpdateReply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: replyMutationKeys.update,
    mutationFn: ({ replyId, body }: { replyId: string; body: UpdateReplyRequestDto }) =>
      updateReply(replyId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      queryClient.invalidateQueries({ queryKey: ['postings'] });
    },
  });
};

export const useDeleteReply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: replyMutationKeys.delete,
    mutationFn: ({ replyId }: { replyId: string }) => deleteReply(replyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      queryClient.invalidateQueries({ queryKey: ['postings'] });
    },
  });
};
