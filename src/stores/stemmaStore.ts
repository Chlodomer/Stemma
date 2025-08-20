import { create } from 'zustand';
import { ViewState, StemmaData, NodeData } from '../types';
import { gregoryStemmaData } from '../data/gregory-stemma';

interface StemmaStore extends ViewState {
  data: StemmaData;
  nodes: NodeData[];
  
  // Actions
  setSelectedNode: (nodeId: string | null) => void;
  toggleFamily: (familyId: string) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<ViewState['filters']>) => void;
  setViewMode: (mode: 'family' | 'all') => void;
  toggleEvidence: () => void;
  initializeNodes: () => void;
}

export const useStemmaStore = create<StemmaStore>((set, get) => ({
  // Initial state
  data: gregoryStemmaData,
  nodes: [],
  selectedNode: null,
  expandedFamilies: new Set(['B']), // Start with B family expanded as it's most important
  searchQuery: '',
  filters: {
    families: [],
    centuries: [],
    places: [],
    scripts: []
  },
  viewMode: 'family',
  showEvidence: false,

  // Actions
  setSelectedNode: (nodeId) => set({ selectedNode: nodeId }),

  toggleFamily: (familyId) => set((state) => {
    const newExpanded = new Set(state.expandedFamilies);
    if (newExpanded.has(familyId)) {
      newExpanded.delete(familyId);
    } else {
      newExpanded.add(familyId);
    }
    return { expandedFamilies: newExpanded };
  }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),

  setViewMode: (mode) => set({ viewMode: mode }),

  toggleEvidence: () => set((state) => ({ showEvidence: !state.showEvidence })),

  initializeNodes: () => {
    const { data, expandedFamilies, viewMode } = get();
    const nodes: NodeData[] = [];

    // Add archetype
    nodes.push({
      id: 'archetype',
      label: 'Archetype',
      type: 'archetype'
    });

    if (viewMode === 'family') {
      // Add family nodes
      data.families.forEach(family => {
        nodes.push({
          id: `${family.id}_family`,
          label: family.label,
          type: 'family',
          familyId: family.id,
          isExpanded: expandedFamilies.has(family.id),
          data: family
        });

        // Add witness nodes if family is expanded
        if (expandedFamilies.has(family.id)) {
          const familyWitnesses = data.witnesses.filter(w => w.familyId === family.id);
          familyWitnesses.forEach(witness => {
            nodes.push({
              id: witness.id,
              label: witness.siglum,
              type: 'witness',
              familyId: family.id,
              data: witness
            });
          });
        }
      });
    } else {
      // Add all witness nodes
      data.witnesses.forEach(witness => {
        nodes.push({
          id: witness.id,
          label: witness.siglum,
          type: 'witness',
          familyId: witness.familyId,
          data: witness
        });
      });
    }

    set({ nodes });
  }
}));