import { MemoryRouter } from 'react-router';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import PostDetail from './index';

const { createPostingReportMock, createCommentReportMock } = vi.hoisted(() => ({
  createPostingReportMock: vi.fn(),
  createCommentReportMock: vi.fn(),
}));

vi.mock('@/stores/posting/postingStore', () => ({
  usePostingDetailStore: () => ({
    postingDetailEntity: {
      'posting-1': {
        id: 'posting-1',
        providerId: 'provider-1',
        title: 'Posting title',
        publishedAt: Date.now(),
        thumbnailUrl: '',
        summary: 'Posting summary',
        status: 1,
        social: {
          likeCount: 0,
          viewCount: 0,
          isLiked: false,
          isBookmarked: false,
          commentCount: 1,
        },
        url: 'https://example.com/posting-1',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    },
    error: null,
    fetchPostingDetail: vi.fn(),
  }),
  usePostingCommentStore: () => ({
    postingComments: {
      'posting-1': {
        totalCount: '1',
        items: [
          {
            id: 'comment-1',
            userId: 'user-1',
            postId: 'posting-1',
            parentCommentId: '',
            hasChildComment: false,
            content: 'Comment content',
            totalReportCount: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
      },
    },
    postingCommentReplies: {},
    replyLoading: {},
    fetchPostingComments: vi.fn(),
    fetchPostingCommentReplies: vi.fn(),
    createPostingComment: vi.fn(),
  }),
  usePostingLikeStore: () => ({ loading: false, likePosting: vi.fn(), unlikePosting: vi.fn() }),
  usePostingBookmarkStore: () => ({
    loading: false,
    createBookmark: vi.fn(),
    deleteBookmark: vi.fn(),
  }),
}));

vi.mock('@/stores/reports/postingReportsStore', () => ({
  useCreatePostingReport: () => ({ isPending: false, mutateAsync: createPostingReportMock }),
}));

vi.mock('@/stores/reports/commentReportsStore', () => ({
  useCreateCommentReport: () => ({ isPending: false, mutateAsync: createCommentReportMock }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe('PostDetail report menus', () => {
  it('opens posting report reasons in a dropdown menu', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'alert').mockImplementation(() => undefined);

    render(
      <MemoryRouter initialEntries={['/post?post-id=posting-1']}>
        <PostDetail />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: '신고' }));

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: '포스트 오류' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: '링크 오류' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: '기타 신고' })).toBeInTheDocument();

    await user.click(screen.getByRole('menuitem', { name: '포스트 오류' }));

    expect(createPostingReportMock).toHaveBeenCalledWith({
      postingId: 'posting-1',
      body: { reason_type: 'POST_ERROR', content: '포스트 오류' },
    });
  });

  it('opens comment report reasons in a dropdown menu', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'alert').mockImplementation(() => undefined);

    render(
      <MemoryRouter initialEntries={['/post?post-id=posting-1']}>
        <PostDetail />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: '댓글 신고' }));

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: '정치' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: '성인' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: '기타' })).toBeInTheDocument();

    await user.click(screen.getByRole('menuitem', { name: '정치' }));

    expect(createCommentReportMock).toHaveBeenCalledWith({
      commentId: 'comment-1',
      body: { reason_type: 'POLITICS', content: '정치' },
    });
  });
});
