import { create } from 'zustand';

import {
  createPostingBookmark,
  createPostingLike,
  deletePostingBookmark,
  deletePostingLike,
  getMyBookmarks,
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
  // eslint-disable-next-line no-unused-vars
  fetchPostings: (params?: GetPostingsParams) => Promise<void>;
}

export const usePostingStore = create<PostingStore>((set) => ({
  postings: { total: 0, items: [] },
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

/* eslint-disable no-unused-vars */
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
  bookmarkedPostings: string[];
  loading: boolean;
  error: string | null;
  fetchBookmarks: (_params?: { page?: number; size?: number }) => Promise<void>;
  createBookmark: (_postingId: string) => Promise<void>;
  deleteBookmark: (_postingId: string) => Promise<void>;
}

export const usePostingBookmarkStore = create<PostingBookmarkStore>((set) => ({
  bookmarkedPostings: [],
  loading: false,
  error: null,
  fetchBookmarks: async (params = { page: 0, size: 20 }) => {
    set({ loading: true, error: null });
    try {
      const response = await getMyBookmarks(params);
      set({
        bookmarkedPostings: response.items.map((item) => item.postId),
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
        bookmarkedPostings: state.bookmarkedPostings.filter((id) => id !== postingId),
        loading: false,
      }));
    } catch {
      set({ error: 'Failed to remove bookmark', loading: false });
    }
  },
}));

interface PostingDetailStore {
  postingDetailEntity: Record<string, PostingDetailEntity>;
  loading: boolean;
  error: string | null;
  fetchPostingDetail: (postingId: string) => Promise<PostingDetailEntity | undefined>;
}

/* eslint-enable no-unused-vars */

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
