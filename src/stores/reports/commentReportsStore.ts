import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  CommentReportReasonType,
  createCommentReport,
  type CreateReportRequestDto,
  getAdminCommentReports,
  type GetAdminReportsParams,
  updateAdminCommentReportStatus,
  type UpdateReportStatusRequestDto,
} from '@/services/report';

export const commentReportsQueryKey = {
  list: (params?: GetAdminReportsParams) =>
    params ? (['reports', 'comments', params] as const) : (['reports', 'comments'] as const),
};

export const commentReportMutationKeys = {
  create: ['reports', 'comments', 'create'] as const,
  updateStatus: ['reports', 'comments', 'update-status'] as const,
};

export const useAdminCommentReports = (
  params: GetAdminReportsParams = { page: 0, size: 20 },
) =>
  useQuery({
    queryKey: commentReportsQueryKey.list(params),
    queryFn: () => getAdminCommentReports(params),
  });

export const useCreateCommentReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: commentReportMutationKeys.create,
    mutationFn: ({
      commentId,
      body,
    }: {
      commentId: string;
      body: CreateReportRequestDto<CommentReportReasonType>;
    }) => createCommentReport(commentId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentReportsQueryKey.list() });
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      queryClient.invalidateQueries({ queryKey: ['postings'] });
    },
  });
};

export const useUpdateAdminCommentReportStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: commentReportMutationKeys.updateStatus,
    mutationFn: ({
      reportId,
      body,
    }: {
      reportId: string;
      body: UpdateReportStatusRequestDto;
    }) => updateAdminCommentReportStatus(reportId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentReportsQueryKey.list() });
    },
  });
};
