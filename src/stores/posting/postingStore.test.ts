import { afterEach, describe, expect, it, vi } from 'vitest';

import { usePostingBookmarkStore, usePostingCommentStore } from './postingStore';

const { getCommentRepliesMock, getMyBookmarksMock, getPostingCommentsMock } = vi.hoisted(() => ({
  getCommentRepliesMock: vi.fn(),
  getMyBookmarksMock: vi.fn(),
  getPostingCommentsMock: vi.fn(),
}));

vi.mock('@/services/comment/replies', () => ({
  getCommentReplies: getCommentRepliesMock,
}));

vi.mock('@/services/posting', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/posting')>()),
  getMyBookmarks: getMyBookmarksMock,
  getPostingComments: getPostingCommentsMock,
}));

afterEach(() => {
  vi.clearAllMocks();
  usePostingCommentStore.setState({
    error: null,
    loading: false,
    postingCommentReplies: {},
    postingComments: {},
    replyLoading: {},
  });
  usePostingBookmarkStore.setState({
    bookmarkedPostings: [],
    bookmarks: [],
    error: null,
    loading: false,
    page: 0,
    size: 20,
    totalCount: 0,
  });
});

describe('posting bookmark pagination', () => {
  it('retains the server pagination metadata', async () => {
    getMyBookmarksMock.mockResolvedValue({
      items: [{ id: 'post-1' }],
      page: 1,
      size: 20,
      totalCount: 45,
    });

    await usePostingBookmarkStore.getState().fetchBookmarks({ page: 1, size: 20 });

    expect(usePostingBookmarkStore.getState()).toMatchObject({ page: 1, size: 20, totalCount: 45 });
  });
});

describe('posting comment reply loading', () => {
  it('uses the dedicated replies endpoint instead of a removed parent query', async () => {
    getCommentRepliesMock.mockResolvedValue({ items: [], page: 0, size: 5, totalCount: 0 });

    await usePostingCommentStore
      .getState()
      .fetchPostingCommentReplies('post-1', 'comment-1', { page: 0, size: 5 });

    expect(getCommentRepliesMock).toHaveBeenCalledWith('comment-1', { page: 0, size: 5 });
    expect(getPostingCommentsMock).not.toHaveBeenCalled();
  });
});
