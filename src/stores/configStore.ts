import { create } from 'zustand';
import { RefCode } from '@/types/domain';

interface ConfigState {
    activeNodeId: string; // The selected Pilot Node (e.g. NODE_LEES)
    refCodes: RefCode[];
    setActiveNode: (nodeId: string) => void;
    setRefCodes: (codes: RefCode[]) => void;
}

export const useConfigStore = create<ConfigState>((set) => ({
    activeNodeId: 'NODE_LEES', // Default to Lees for Phase 1
    refCodes: [],
    setActiveNode: (nodeId) => set({ activeNodeId: nodeId }),
    setRefCodes: (codes) => set({ refCodes: codes }),
}));
