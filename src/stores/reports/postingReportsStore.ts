import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createPostingReport,
  type CreateReportRequestDto,
  getAdminPostingReports,
  type GetAdminReportsParams,
  PostingReportReasonType,
  updateAdminPostingReportStatus,
  type UpdateReportStatusRequestDto,
} from '@/services/report';

export const postingReportsQueryKey = {
  list: (params?: GetAdminReportsParams) =>
    params ? (['reports', 'postings', params] as const) : (['reports', 'postings'] as const),
};

export const postingReportMutationKeys = {
  create: ['reports', 'postings', 'create'] as const,
  updateStatus: ['reports', 'postings', 'update-status'] as const,
};

export const useAdminPostingReports = (
  params: GetAdminReportsParams = { page: 0, size: 20 },
) =>
  useQuery({
    queryKey: postingReportsQueryKey.list(params),
    queryFn: () => getAdminPostingReports(params),
  });

export const useCreatePostingReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: postingReportMutationKeys.create,
    mutationFn: ({
      postingId,
      body,
    }: {
      postingId: string;
      body: CreateReportRequestDto<PostingReportReasonType>;
    }) => createPostingReport(postingId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postingReportsQueryKey.list() });
      queryClient.invalidateQueries({ queryKey: ['postings'] });
    },
  });
};

export const useUpdateAdminPostingReportStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: postingReportMutationKeys.updateStatus,
    mutationFn: ({
      reportId,
      body,
    }: {
      reportId: string;
      body: UpdateReportStatusRequestDto;
    }) => updateAdminPostingReportStatus(reportId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postingReportsQueryKey.list() });
    },
  });
};
