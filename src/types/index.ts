export interface Witness {
  id: string;
  siglum: string;
  shelfmark: string;
  repo: string;
  century: string;
  place: {
    name: string;
    confidence: number;
  };
  coverage: string;
  script: string;
  familyId: string;
  notes: string[];
  citations: Array<{
    mghPage: string;
  }>;
}

export interface Family {
  id: string;
  label: string;
  notes: string;
  evidence: Array<{
    mghPage: string;
  }>;
}

export interface Edge {
  from: string;
  to: string;
  type: 'copy' | 'contamination' | 'inferred';
  confidence: number;
  evidence: Array<{
    mghPage: string;
  }>;
}

export interface StemmaData {
  workId: string;
  families: Family[];
  witnesses: Witness[];
  edges: Edge[];
}

export interface NodeData {
  id: string;
  label: string;
  type: 'family' | 'witness' | 'archetype';
  familyId?: string;
  isExpanded?: boolean;
  x?: number;
  y?: number;
  data?: Witness | Family;
}

export interface ViewState {
  selectedNode: string | null;
  expandedFamilies: Set<string>;
  searchQuery: string;
  filters: {
    families: string[];
    centuries: string[];
    places: string[];
    scripts: string[];
  };
  viewMode: 'family' | 'all';
  showEvidence: boolean;
}