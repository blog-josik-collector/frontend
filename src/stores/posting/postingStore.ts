import { create } from 'zustand';

import { getPostings, type GetPostingsResponse } from '@/services/posting';

interface PostingStore {
  postings: GetPostingsResponse;
  loading: boolean;
  error: string | null;
  fetchPostings: () => Promise<void>;
}

export const usePostingStore = create<PostingStore>((set) => ({
  postings: { total: 0, items: [] },
  loading: false,
  error: null,
  fetchPostings: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getPostings();
      set({ postings: data, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch postings', loading: false });
    }
  },
}));

// usePostingStore.getState().fetchPostings();
