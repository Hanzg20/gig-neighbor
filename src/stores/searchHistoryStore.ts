import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SearchHistoryState {
  history: string[];
  addToHistory: (query: string) => void;
  removeFromHistory: (query: string) => void;
  clearHistory: () => void;
}

export const useSearchHistory = create<SearchHistoryState>()(
  persist(
    (set) => ({
      history: [],

      // 添加搜索到历史记录
      addToHistory: (query: string) => {
        if (!query || query.trim().length < 2) return; // 忽略太短的查询

        set((state) => ({
          history: [
            query.trim(),
            ...state.history.filter(q => q !== query.trim())
          ].slice(0, 10) // 最多保存 10 条
        }));
      },

      // 从历史中移除单条
      removeFromHistory: (query: string) => {
        set((state) => ({
          history: state.history.filter(q => q !== query)
        }));
      },

      // 清空所有历史
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'justwedo-search-history', // localStorage key
      version: 1,
    }
  )
);
