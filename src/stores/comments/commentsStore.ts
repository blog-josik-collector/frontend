import { type QueryClient, useMutation, useQueryClient } from '@tanstack/react-query';

import { commentRepliesQueryKey } from './repliesStore';

import {
  deleteComment,
  updateComment,
  type UpdateCommentRequestDto,
} from '@/services/comment/comments';
import type { GetMyCommentsResponse } from '@/services/comment/me';

export const commentMutationKeys = {
  update: ['comments', 'update'] as const,
  delete: ['comments', 'delete'] as const,
};

const invalidateCommentQueries = (
  queryClient: QueryClient,
  commentId: string,
  options: { includeMyComments?: boolean } = {},
) => {
  queryClient.invalidateQueries({ queryKey: ['postings'] });
  queryClient.invalidateQueries({ queryKey: ['comments'] });
  if (options.includeMyComments ?? true) {
    queryClient.invalidateQueries({ queryKey: ['me', 'comments'] });
  }
  queryClient.invalidateQueries({ queryKey: commentRepliesQueryKey.list(commentId) });
};

const removeCommentFromMyCommentsCache = (queryClient: QueryClient, commentId: string) => {
  queryClient.setQueriesData<GetMyCommentsResponse>({ queryKey: ['me', 'comments'] }, (data) => {
    if (!data) return data;

    const nextItems = data.items.filter((comment) => comment.id !== commentId);

    if (nextItems.length === data.items.length) {
      return data;
    }

    return {
      ...data,
      totalCount: Math.max(0, data.totalCount - 1),
      items: nextItems,
    };
  });
};

export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: commentMutationKeys.update,
    mutationFn: ({ commentId, body }: { commentId: string; body: UpdateCommentRequestDto }) =>
      updateComment(commentId, body),
    onSuccess: (_, { commentId }) => {
      invalidateCommentQueries(queryClient, commentId);
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: commentMutationKeys.delete,
    mutationFn: ({ commentId }: { commentId: string }) => deleteComment(commentId),
    onSuccess: (_, { commentId }) => {
      removeCommentFromMyCommentsCache(queryClient, commentId);
      invalidateCommentQueries(queryClient, commentId);
    },
  });
};
