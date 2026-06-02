import { useMutation, useQueryClient } from '@tanstack/react-query';

import { commentRepliesQueryKey } from './repliesStore';

import {
  deleteComment,
  updateComment,
  type UpdateCommentRequestDto,
} from '@/services/comment/comments';

export const commentMutationKeys = {
  update: ['comments', 'update'] as const,
  delete: ['comments', 'delete'] as const,
};

export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: commentMutationKeys.update,
    mutationFn: ({ commentId, body }: { commentId: string; body: UpdateCommentRequestDto }) =>
      updateComment(commentId, body),
    onSuccess: (_, { commentId }) => {
      queryClient.invalidateQueries({ queryKey: ['postings'] });
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      queryClient.invalidateQueries({ queryKey: commentRepliesQueryKey.list(commentId) });
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: commentMutationKeys.delete,
    mutationFn: ({ commentId }: { commentId: string }) => deleteComment(commentId),
    onSuccess: (_, { commentId }) => {
      queryClient.invalidateQueries({ queryKey: ['postings'] });
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      queryClient.invalidateQueries({ queryKey: commentRepliesQueryKey.list(commentId) });
    },
  });
};
