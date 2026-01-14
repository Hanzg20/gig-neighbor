import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RefCode } from '@/types/domain';

interface ConfigState {
    activeNodeId: string; // The selected Pilot Node (e.g. NODE_LEES)
    refCodes: RefCode[];
    language: 'en' | 'zh';
    setActiveNode: (nodeId: string) => void;
    setRefCodes: (codes: RefCode[]) => void;
    setLanguage: (lang: 'en' | 'zh') => void;
}

export const useConfigStore = create<ConfigState>()(
    persist(
        (set) => ({
            activeNodeId: 'NODE_LEES', // Default to Lees for Phase 1
            refCodes: [],
            language: 'en', // Default language
            setActiveNode: (nodeId) => set({ activeNodeId: nodeId }),
            setRefCodes: (codes) => set({ refCodes: codes }),
            setLanguage: (lang) => set({ language: lang }),
        }),
        {
            name: 'gig-neighbor-config',
            partialize: (state) => ({ language: state.language, activeNodeId: state.activeNodeId }), // Only persist language and location
        }
    )
);
