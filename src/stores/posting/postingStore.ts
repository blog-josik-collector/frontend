import { create } from 'zustand';

import { getPostings, type GetPostingsParams, type GetPostingsResponse } from '@/services/posting';

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

// usePostingStore.getState().fetchPostings();
