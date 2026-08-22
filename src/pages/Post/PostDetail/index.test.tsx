import { MemoryRouter } from 'react-router';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import PostDetail from './index';

const {
  createPostingReportMock,
  createCommentReportMock,
  fetchRepliesMock,
  commentItemsMock,
  commentRepliesMock,
} = vi.hoisted(() => ({
  createPostingReportMock: vi.fn(),
  createCommentReportMock: vi.fn(),
  fetchRepliesMock: vi.fn(),
  commentItemsMock: [
    {
      id: 'comment-1',
      nickname: 'commenter',
      hasChildComment: false,
      content: 'Comment content',
      status: 'active' as 'active' | 'blocked' | 'deleted',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ],
  commentRepliesMock: {} as Record<
    string,
    Record<
      string,
      {
        totalCount: number;
        items: Array<{
          id: string;
          nickname: string;
          hasChildComment: boolean;
          content: string;
          status: 'active' | 'blocked' | 'deleted';
          createdAt: number;
          updatedAt: number;
        }>;
      }
    >
  >,
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
        items: commentItemsMock,
      },
    },
    postingCommentReplies: commentRepliesMock,
    replyLoading: {},
    fetchPostingComments: vi.fn(),
    fetchPostingCommentReplies: fetchRepliesMock,
    createPostingComment: vi.fn(),
    createPostingReply: vi.fn(),
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
  commentItemsMock[0].content = 'Comment content';
  commentItemsMock[0].status = 'active';
  commentItemsMock[0].hasChildComment = false;
  delete commentRepliesMock['posting-1'];
});

describe('PostDetail report menus', () => {
  it('places comment actions in the same header row as the nickname', () => {
    render(
      <MemoryRouter initialEntries={['/post?post-id=posting-1']}>
        <PostDetail />
      </MemoryRouter>,
    );

    const commentHeader = screen.getByText('commenter').parentElement;

    expect(commentHeader).not.toBeNull();
    expect(within(commentHeader!).getByRole('button', { name: '답글 작성' })).toBeInTheDocument();
    expect(within(commentHeader!).getByRole('button', { name: '댓글 신고' })).toBeInTheDocument();
  });

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
      body: { report_type: 'invalid_content', content: '포스트 오류' },
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
      body: { report_type: 'political', content: '정치' },
    });
  });

  it('shows deleted comment content as deleted and removes only its report action', () => {
    commentItemsMock[0].content = 'Deleted comment content';
    commentItemsMock[0].status = 'deleted';

    render(
      <MemoryRouter initialEntries={['/post?post-id=posting-1']}>
        <PostDetail />
      </MemoryRouter>,
    );

    expect(screen.getByText('Deleted comment content')).toHaveClass('text-muted-foreground');
    expect(screen.getByRole('button', { name: '답글 작성' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '댓글 신고' })).not.toBeInTheDocument();
  });

  it('hides blocked comment content until requested and keeps its report action', async () => {
    const user = userEvent.setup();
    commentItemsMock[0].content = 'Blocked comment content';
    commentItemsMock[0].status = 'blocked';

    render(
      <MemoryRouter initialEntries={['/post?post-id=posting-1']}>
        <PostDetail />
      </MemoryRouter>,
    );

    expect(screen.queryByText('Blocked comment content')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '댓글 신고' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '차단된 댓글 내용 보기' }));

    expect(screen.getByText('Blocked comment content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '차단된 댓글 내용 숨기기' })).toBeInTheDocument();
  });

  it('fetches root replies only after the reply-view button is clicked', async () => {
    const user = userEvent.setup();
    commentItemsMock[0].hasChildComment = true;

    render(
      <MemoryRouter initialEntries={['/post?post-id=posting-1']}>
        <PostDetail />
      </MemoryRouter>,
    );

    expect(fetchRepliesMock).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'commenter 답글 보기' }));

    expect(fetchRepliesMock).toHaveBeenCalledWith(
      'posting-1',
      'comment-1',
      { page: 0, size: 5 },
      false,
    );
  });

  it('keeps nested replies collapsed and fetches them by their own comment id', async () => {
    const user = userEvent.setup();
    commentItemsMock[0].hasChildComment = true;
    commentRepliesMock['posting-1'] = {
      'comment-1': {
        totalCount: 1,
        items: [
          {
            id: 'reply-1',
            nickname: 'reply-user',
            hasChildComment: true,
            content: 'Nested reply content',
            status: 'active',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
      },
    };

    render(
      <MemoryRouter initialEntries={['/post?post-id=posting-1']}>
        <PostDetail />
      </MemoryRouter>,
    );

    expect(screen.queryByText('Nested reply content')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'commenter 답글 보기' }));
    expect(screen.getByText('Nested reply content')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'reply-user 답글 보기' }));
    expect(fetchRepliesMock).toHaveBeenCalledWith(
      'posting-1',
      'reply-1',
      { page: 0, size: 5 },
      false,
    );
  });
});
