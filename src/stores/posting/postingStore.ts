import { create } from 'zustand';

import {
  createReply,
  type CreateReplyRequestDto,
  getCommentReplies,
} from '@/services/comment/replies';
import {
  type BookmarkedPosting,
  createPostingBookmark,
  createPostingComment,
  type CreatePostingCommentRequestDto,
  type CreatePostingCommentResponse,
  createPostingLike,
  deletePostingBookmark,
  deletePostingLike,
  getMyBookmarks,
  getPostingComments,
  type GetPostingCommentsParams,
  type GetPostingCommentsResponse,
  getPostingDetail,
  getPostings,
  type GetPostingsParams,
  type GetPostingsResponse,
  type PostingDetailEntity,
} from '@/services/posting';

interface PostingStore {
  postings: GetPostingsResponse;
  loading: boolean;
  error: string | null;

  fetchPostings: (params?: GetPostingsParams) => Promise<void>;
}

export const usePostingStore = create<PostingStore>((set) => ({
  postings: { totalCount: 0, page: 0, size: 0, items: [] },
  loading: false,
  error: null,
  fetchPostings: async (params: GetPostingsParams = {}) => {
    set({ loading: true, error: null });
    try {
      const data = await getPostings(params);
      set({ postings: data, loading: false });
    } catch {
      set({ error: 'Failed to fetch postings', loading: false });
    }
  },
}));

interface PostingLikeStore {
  likedPostings: string[];
  loading: boolean;
  error: string | null;
  likePosting: (_postingId: string) => Promise<void>;
  unlikePosting: (_postingId: string) => Promise<void>;
}

export const usePostingLikeStore = create<PostingLikeStore>((set) => ({
  likedPostings: [],
  loading: false,
  error: null,
  likePosting: async (postingId: string) => {
    set({ loading: true, error: null });
    try {
      await createPostingLike(postingId);
      set((state) => ({
        likedPostings: state.likedPostings.includes(postingId)
          ? state.likedPostings
          : [...state.likedPostings, postingId],
        loading: false,
      }));
    } catch {
      set({ error: 'Failed to like posting', loading: false });
    }
  },
  unlikePosting: async (postingId: string) => {
    set({ loading: true, error: null });
    try {
      await deletePostingLike(postingId);
      set((state) => ({
        likedPostings: state.likedPostings.filter((id) => id !== postingId),
        loading: false,
      }));
    } catch {
      set({ error: 'Failed to unlike posting', loading: false });
    }
  },
}));

interface PostingBookmarkStore {
  bookmarks: BookmarkedPosting[];
  bookmarkedPostings: string[];
  totalCount: number;
  page: number;
  size: number;
  loading: boolean;
  error: string | null;
  fetchBookmarks: (_params?: { page?: number; size?: number }) => Promise<void>;
  createBookmark: (_postingId: string) => Promise<void>;
  deleteBookmark: (_postingId: string) => Promise<void>;
}

export const usePostingBookmarkStore = create<PostingBookmarkStore>((set) => ({
  bookmarks: [],
  bookmarkedPostings: [],
  totalCount: 0,
  page: 0,
  size: 20,
  loading: false,
  error: null,
  fetchBookmarks: async (params = { page: 0, size: 20 }) => {
    set({ loading: true, error: null });
    try {
      const response = await getMyBookmarks(params);
      set({
        bookmarks: response.items,
        bookmarkedPostings: response.items.map((item) => item.id),
        totalCount: response.totalCount,
        page: response.page,
        size: response.size,
        loading: false,
      });
    } catch {
      set({ error: 'Failed to fetch bookmarks', loading: false });
    }
  },
  createBookmark: async (postingId: string) => {
    set({ loading: true, error: null });
    try {
      await createPostingBookmark(postingId);
      set((state) => ({
        bookmarkedPostings: state.bookmarkedPostings.includes(postingId)
          ? state.bookmarkedPostings
          : [...state.bookmarkedPostings, postingId],
        loading: false,
      }));
    } catch {
      set({ error: 'Failed to bookmark posting', loading: false });
    }
  },
  deleteBookmark: async (postingId: string) => {
    set({ loading: true, error: null });
    try {
      await deletePostingBookmark(postingId);
      set((state) => ({
        bookmarks: state.bookmarks.filter((bookmark) => bookmark.id !== postingId),
        bookmarkedPostings: state.bookmarkedPostings.filter((id) => id !== postingId),
        loading: false,
      }));
    } catch {
      set({ error: 'Failed to remove bookmark', loading: false });
    }
  },
}));

interface PostingCommentReplies {
  items: GetPostingCommentsResponse['items'];
  totalCount: number;
}

interface PostingCommentStore {
  postingComments: Record<string, GetPostingCommentsResponse>;
  postingCommentReplies: Record<string, Record<string, PostingCommentReplies>>;
  loading: boolean;
  replyLoading: Record<string, boolean>;
  error: string | null;
  fetchPostingComments: (postingId: string, params?: GetPostingCommentsParams) => Promise<void>;
  fetchPostingCommentReplies: (
    postingId: string,
    parentCommentId: string,
    params?: GetPostingCommentsParams,
    append?: boolean,
  ) => Promise<void>;
  createPostingComment: (
    postingId: string,
    body: CreatePostingCommentRequestDto,
  ) => Promise<CreatePostingCommentResponse | undefined>;
  createPostingReply: (
    commentId: string,
    body: CreateReplyRequestDto,
  ) => Promise<unknown | undefined>;
}

export const usePostingCommentStore = create<PostingCommentStore>((set) => ({
  postingComments: {},
  postingCommentReplies: {},
  loading: false,
  replyLoading: {},
  error: null,
  fetchPostingComments: async (postingId: string, params = { page: 0, size: 20 }) => {
    if (!postingId) return;
    set({ loading: true, error: null });
    try {
      const response = await getPostingComments(postingId, params);
      set((state) => ({
        postingComments: {
          ...state.postingComments,
          [postingId]: response,
        },
        loading: false,
      }));
    } catch {
      set({ error: 'Failed to fetch posting comments', loading: false });
    }
  },
  fetchPostingCommentReplies: async (
    postingId: string,
    parentCommentId: string,
    params = { page: 0, size: 5 },
    append = false,
  ) => {
    if (!postingId || !parentCommentId) return;

    const replyKey = `${postingId}:${parentCommentId}`;
    set((state) => ({
      replyLoading: { ...state.replyLoading, [replyKey]: true },
      error: null,
    }));

    try {
      const response = await getCommentReplies(parentCommentId, params);
      const totalCount = response.totalCount;

      set((state) => {
        const postReplies = state.postingCommentReplies[postingId] ?? {};
        const existing = postReplies[parentCommentId];
        const items =
          append && existing ? [...existing.items, ...response.items] : response.items;

        return {
          postingCommentReplies: {
            ...state.postingCommentReplies,
            [postingId]: {
              ...postReplies,
              [parentCommentId]: { items, totalCount },
            },
          },
          replyLoading: { ...state.replyLoading, [replyKey]: false },
        };
      });
    } catch {
      set((state) => ({
        error: 'Failed to fetch posting comment replies',
        replyLoading: { ...state.replyLoading, [replyKey]: false },
      }));
    }
  },
  createPostingComment: async (postingId: string, body: CreatePostingCommentRequestDto) => {
    set({ loading: true, error: null });
    try {
      const response = await createPostingComment(postingId, body);
      set({ loading: false });
      return response;
    } catch {
      set({ error: 'Failed to create posting comment', loading: false });
    }
  },
  createPostingReply: async (commentId: string, body: CreateReplyRequestDto) => {
    set({ loading: true, error: null });
    try {
      const response = await createReply(commentId, body);
      set({ loading: false });
      return response;
    } catch {
      set({ error: 'Failed to create posting reply', loading: false });
    }
  },
}));

interface PostingDetailStore {
  postingDetailEntity: Record<string, PostingDetailEntity>;
  loading: boolean;
  error: string | null;
  fetchPostingDetail: (postingId: string) => Promise<PostingDetailEntity | undefined>;
}

export const usePostingDetailStore = create<PostingDetailStore>((set) => ({
  postingDetailEntity: {},
  loading: false,
  error: null,
  fetchPostingDetail: async (postingId: string) => {
    if (!postingId) return;
    set({ loading: true, error: null });
    try {
      const data = await getPostingDetail(postingId);
      set((state) => ({
        postingDetailEntity: { ...state.postingDetailEntity, [postingId]: data },
        loading: false,
      }));
      return data;
    } catch {
      set({ error: 'Failed to fetch posting detail', loading: false });
    }
  },
}));

// usePostingStore.getState().fetchPostings();
