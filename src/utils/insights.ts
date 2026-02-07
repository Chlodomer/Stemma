import { StemmaData, Witness, Edge } from '../types';

// --- Types ---

export interface WitnessInsights {
  distanceFromArchetype: number | null;
  transmissionPath: string[];
  transmissionPathQuality: number | null;
  descendantCount: number;
  descendants: string[];
  coverageCompleteness: number;
  coverageBookRange: string;
  coverageVsFamilyPeers: {
    witnessPercent: number;
    familyAveragePercent: number;
    rank: number;
    totalInFamily: number;
  };
  contaminationRole: 'source' | 'target' | 'both' | 'none';
  contaminationEdges: Array<{
    type: 'outgoing' | 'incoming';
    otherNodeId: string;
    confidence: number;
  }>;
  authorityScore: number;
}

export interface FamilyInsights {
  witnessCount: number;
  witnesses: string[];
  dateRange: string;
  averageCoverage: number;
  geographicSpread: string[];
  keyManuscript: { id: string; siglum: string; authorityScore: number } | null;
}

// --- Roman Numeral Parsing ---

const ROMAN_VALUES: Record<string, number> = {
  I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000
};

export function parseRomanNumeral(s: string): number {
  const upper = s.trim().toUpperCase();
  let total = 0;
  for (let i = 0; i < upper.length; i++) {
    const current = ROMAN_VALUES[upper[i]] || 0;
    const next = ROMAN_VALUES[upper[i + 1]] || 0;
    if (current < next) {
      total -= current;
    } else {
      total += current;
    }
  }
  return total;
}

export function toRomanNumeral(n: number): string {
  const map: [number, string][] = [
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
  ];
  let result = '';
  for (const [value, numeral] of map) {
    while (n >= value) {
      result += numeral;
      n -= value;
    }
  }
  return result;
}

// --- Century Parsing ---

export function parseCentury(century: string): number {
  const s = century.trim();

  // "ca. 700" or "ca. 800"
  const caMatch = s.match(/ca\.\s*(\d+)/);
  if (caMatch) {
    return Math.floor(parseInt(caMatch[1]) / 100) + 1;
  }

  // Range like "IX-X"
  const rangeMatch = s.match(/^([IVX]+)\s*-\s*([IVX]+)$/i);
  if (rangeMatch) {
    const low = parseRomanNumeral(rangeMatch[1]);
    const high = parseRomanNumeral(rangeMatch[2]);
    return (low + high) / 2;
  }

  // "VII ex." (end of century)
  const exMatch = s.match(/^([IVX]+)\s+ex\.?$/i);
  if (exMatch) {
    return parseRomanNumeral(exMatch[1]) + 0.8;
  }

  // "VIII in." (beginning of century)
  const inMatch = s.match(/^([IVX]+)\s+in\.?$/i);
  if (inMatch) {
    return parseRomanNumeral(inMatch[1]) + 0.2;
  }

  // Plain Roman numeral like "XI" or "IX"
  const plainMatch = s.match(/^([IVX]+)$/i);
  if (plainMatch) {
    return parseRomanNumeral(plainMatch[1]);
  }

  return 10; // fallback
}

// --- Coverage Parsing ---

export function parseCoverageBooks(coverage: string): Set<number> {
  // Strip parenthetical notes
  const stripped = coverage.replace(/\([^)]*\)/g, '').trim();
  if (!stripped) return new Set();

  const books = new Set<number>();

  // Split on ", " but only where a new range starts (Roman numeral after comma)
  // Handle: "I-VI (original), VII-X (supplement)" -> after stripping parens: "I-VI , VII-X"
  const segments = stripped.split(/,\s*/).filter(s => s.trim());

  for (const segment of segments) {
    const seg = segment.trim();
    if (!seg) continue;

    // Check if this is a range like "I-X" or "II,3-V,26" or "I-VI"
    const dashIndex = seg.indexOf('-');
    if (dashIndex >= 0) {
      const left = seg.substring(0, dashIndex).trim();
      const right = seg.substring(dashIndex + 1).trim();

      // Extract book number from each side (before any comma for chapter)
      const leftBook = extractBookNumber(left);
      const rightBook = extractBookNumber(right);

      if (leftBook !== null && rightBook !== null) {
        for (let b = leftBook; b <= rightBook; b++) {
          books.add(b);
        }
        continue;
      }
    }

    // Single book reference like "I" or "II,3"
    const bookNum = extractBookNumber(seg);
    if (bookNum !== null) {
      books.add(bookNum);
    }
  }

  return books;
}

function extractBookNumber(s: string): number | null {
  // Match leading Roman numeral, possibly followed by ",chapter"
  const match = s.match(/^([IVX]+)/i);
  if (match) {
    return parseRomanNumeral(match[1]);
  }
  return null;
}

export function computeCoverageCompleteness(coverage: string): number {
  const books = parseCoverageBooks(coverage);
  return books.size / 10;
}

export function getCoverageBookRange(coverage: string): string {
  const books = parseCoverageBooks(coverage);
  if (books.size === 0) return 'None';
  const sorted = Array.from(books).sort((a, b) => a - b);
  if (sorted.length === 10) return 'I-X (complete)';

  // Build range string
  const ranges: string[] = [];
  let start = sorted[0];
  let end = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) {
      end = sorted[i];
    } else {
      ranges.push(start === end ? toRomanNumeral(start) : `${toRomanNumeral(start)}-${toRomanNumeral(end)}`);
      start = sorted[i];
      end = sorted[i];
    }
  }
  ranges.push(start === end ? toRomanNumeral(start) : `${toRomanNumeral(start)}-${toRomanNumeral(end)}`);

  return ranges.join(', ');
}

// --- Graph Traversal ---

export function findPathFromArchetype(
  targetId: string,
  edges: Edge[]
): string[] | null {
  // BFS using only copy and inferred edges (not contamination)
  const transmissionEdges = edges.filter(e => e.type !== 'contamination');

  const adjacency = new Map<string, string[]>();
  for (const edge of transmissionEdges) {
    if (!adjacency.has(edge.from)) adjacency.set(edge.from, []);
    adjacency.get(edge.from)!.push(edge.to);
  }

  const queue: string[][] = [['archetype']];
  const visited = new Set<string>(['archetype']);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const current = path[path.length - 1];

    if (current === targetId) return path;

    const neighbors = adjacency.get(current) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }

  return null;
}

export function computePathQuality(path: string[], edges: Edge[]): number {
  let quality = 1;
  for (let i = 0; i < path.length - 1; i++) {
    const edge = edges.find(e =>
      e.from === path[i] && e.to === path[i + 1] && e.type !== 'contamination'
    );
    if (edge) {
      quality *= edge.confidence;
    }
  }
  return quality;
}

export function findDescendants(nodeId: string, edges: Edge[]): string[] {
  const copyEdges = edges.filter(e => e.type === 'copy');
  const adjacency = new Map<string, string[]>();
  for (const edge of copyEdges) {
    if (!adjacency.has(edge.from)) adjacency.set(edge.from, []);
    adjacency.get(edge.from)!.push(edge.to);
  }

  const descendants: string[] = [];
  const stack = [nodeId];
  const visited = new Set<string>([nodeId]);

  while (stack.length > 0) {
    const current = stack.pop()!;
    const children = adjacency.get(current) || [];
    for (const child of children) {
      if (!visited.has(child)) {
        visited.add(child);
        descendants.push(child);
        stack.push(child);
      }
    }
  }

  return descendants;
}

// --- Contamination ---

export function getContaminationRole(
  nodeId: string,
  edges: Edge[]
): 'source' | 'target' | 'both' | 'none' {
  const contaminationEdges = edges.filter(e => e.type === 'contamination');
  const isSource = contaminationEdges.some(e => e.from === nodeId);
  const isTarget = contaminationEdges.some(e => e.to === nodeId);

  if (isSource && isTarget) return 'both';
  if (isSource) return 'source';
  if (isTarget) return 'target';
  return 'none';
}

export function getContaminationEdges(
  nodeId: string,
  edges: Edge[]
): WitnessInsights['contaminationEdges'] {
  return edges
    .filter(e => e.type === 'contamination' && (e.from === nodeId || e.to === nodeId))
    .map(e => ({
      type: e.from === nodeId ? 'outgoing' as const : 'incoming' as const,
      otherNodeId: e.from === nodeId ? e.to : e.from,
      confidence: e.confidence,
    }));
}

// --- Authority Score ---

function computeScribalQuality(notes: string[]): number {
  const joined = notes.join(' ').toLowerCase();

  if (/worst|badly preserved|inferior/.test(joined)) return 0.2;
  if (/decay|damaged|severely/.test(joined)) return 0.3;
  if (/fragmentary|missing many/.test(joined)) return 0.35;
  if (/multiple scribes/.test(joined) && !/correct|best|important/.test(joined)) return 0.5;
  if (/best|correct readings|excellent|accurate|most important/.test(joined)) return 0.9;
  if (/oldest|important/.test(joined)) return 0.85;
  if (/complete|preserves/.test(joined)) return 0.7;

  return 0.6;
}

export function computeAuthorityScore(
  witness: Witness,
  pathQuality: number | null,
  coverageCompleteness: number
): number {
  const pq = pathQuality ?? 0.5;
  const sq = computeScribalQuality(witness.notes);
  const score = pq * 0.4 + coverageCompleteness * 0.3 + sq * 0.3;
  return Math.max(0, Math.min(1, score));
}

// --- Orchestrators ---

export function computeWitnessInsights(
  witnessId: string,
  data: StemmaData
): WitnessInsights {
  const witness = data.witnesses.find(w => w.id === witnessId);
  if (!witness) {
    return {
      distanceFromArchetype: null,
      transmissionPath: [],
      transmissionPathQuality: null,
      descendantCount: 0,
      descendants: [],
      coverageCompleteness: 0,
      coverageBookRange: 'Unknown',
      coverageVsFamilyPeers: { witnessPercent: 0, familyAveragePercent: 0, rank: 0, totalInFamily: 0 },
      contaminationRole: 'none',
      contaminationEdges: [],
      authorityScore: 0,
    };
  }

  const path = findPathFromArchetype(witnessId, data.edges);
  const distanceFromArchetype = path ? path.length - 1 : null;
  const transmissionPath = path || [];
  const transmissionPathQuality = path ? computePathQuality(path, data.edges) : null;

  const descendants = findDescendants(witnessId, data.edges);
  const coverageComp = computeCoverageCompleteness(witness.coverage);
  const coverageBookRange = getCoverageBookRange(witness.coverage);

  // Coverage vs family peers
  const familyPeers = data.witnesses.filter(w => w.familyId === witness.familyId);
  const peerCoverages = familyPeers.map(w => computeCoverageCompleteness(w.coverage));
  const familyAvg = peerCoverages.length > 0
    ? peerCoverages.reduce((a, b) => a + b, 0) / peerCoverages.length
    : 0;
  const sortedCoverages = [...peerCoverages].sort((a, b) => b - a);
  const rank = sortedCoverages.indexOf(coverageComp) + 1;

  const contaminationRole = getContaminationRole(witnessId, data.edges);
  const contaminationEdges = getContaminationEdges(witnessId, data.edges);
  const authorityScore = computeAuthorityScore(witness, transmissionPathQuality, coverageComp);

  return {
    distanceFromArchetype,
    transmissionPath: transmissionPath.map(id => {
      if (id === 'archetype') return '\u03b1';
      if (id.endsWith('_family')) return id.replace('_family', '');
      const w = data.witnesses.find(w => w.id === id);
      return w ? w.siglum : id;
    }),
    transmissionPathQuality,
    descendantCount: descendants.length,
    descendants,
    coverageCompleteness: coverageComp,
    coverageBookRange,
    coverageVsFamilyPeers: {
      witnessPercent: coverageComp * 100,
      familyAveragePercent: familyAvg * 100,
      rank,
      totalInFamily: familyPeers.length,
    },
    contaminationRole,
    contaminationEdges,
    authorityScore,
  };
}

export function computeFamilyInsights(
  familyId: string,
  data: StemmaData
): FamilyInsights {
  const witnesses = data.witnesses.filter(w => w.familyId === familyId);
  const sigla = witnesses.map(w => w.siglum);

  // Date range
  const centuries = witnesses.map(w => parseCentury(w.century));
  const minCentury = Math.min(...centuries);
  const maxCentury = Math.max(...centuries);
  const dateRange = minCentury === maxCentury
    ? toRomanNumeral(Math.round(minCentury))
    : `${toRomanNumeral(Math.floor(minCentury))}-${toRomanNumeral(Math.ceil(maxCentury))}`;

  // Average coverage
  const coverages = witnesses.map(w => computeCoverageCompleteness(w.coverage));
  const averageCoverage = coverages.length > 0
    ? coverages.reduce((a, b) => a + b, 0) / coverages.length
    : 0;

  // Geographic spread
  const places = [...new Set(witnesses.map(w => w.place.name).filter(p => p !== 'Unknown'))];

  // Key manuscript (highest authority score)
  let keyManuscript: FamilyInsights['keyManuscript'] = null;
  let bestScore = -1;

  for (const w of witnesses) {
    const path = findPathFromArchetype(w.id, data.edges);
    const pathQuality = path ? computePathQuality(path, data.edges) : null;
    const cov = computeCoverageCompleteness(w.coverage);
    const score = computeAuthorityScore(w, pathQuality, cov);
    if (score > bestScore) {
      bestScore = score;
      keyManuscript = { id: w.id, siglum: w.siglum, authorityScore: score };
    }
  }

  return {
    witnessCount: witnesses.length,
    witnesses: sigla,
    dateRange,
    averageCoverage,
    geographicSpread: places,
    keyManuscript,
  };
}

// --- Comparative Analysis ---

export interface CoverageRow {
  id: string;
  siglum: string;
  familyId: string;
  books: boolean[];
  note: string;
}

export interface FamilyProfile {
  id: string;
  label: string;
  distinctives: string[];
  scripts: string[];
  places: string[];
  dateRange: string;
  coveragePattern: string;
  witnessCount: number;
}

export function computeCoverageMatrix(data: StemmaData): CoverageRow[] {
  return data.witnesses.map(w => {
    const bookSet = parseCoverageBooks(w.coverage);
    const books: boolean[] = [];
    for (let i = 1; i <= 10; i++) {
      books.push(bookSet.has(i));
    }
    const noteMatch = w.coverage.match(/\(([^)]+)\)/g);
    const note = noteMatch
      ? noteMatch.map(m => m.replace(/[()]/g, '')).join('; ')
      : '';
    return {
      id: w.id,
      siglum: w.siglum,
      familyId: w.familyId,
      books,
      note
    };
  });
}

export function computeFamilyProfiles(data: StemmaData): FamilyProfile[] {
  const familyWitnesses = new Map<string, Witness[]>();
  for (const w of data.witnesses) {
    if (!familyWitnesses.has(w.familyId)) familyWitnesses.set(w.familyId, []);
    familyWitnesses.get(w.familyId)!.push(w);
  }

  const familyData = data.families.map(f => {
    const witnesses = familyWitnesses.get(f.id) || [];
    const scripts = [...new Set(witnesses.map(w => w.script))];
    const places = [...new Set(
      witnesses.map(w => w.place.name).filter(p => p !== 'Unknown')
    )];
    const centuries = witnesses.map(w => parseCentury(w.century));
    const minC = Math.min(...centuries);
    const maxC = Math.max(...centuries);
    const booksUnion = new Set<number>();
    witnesses.forEach(w => {
      parseCoverageBooks(w.coverage).forEach(b => booksUnion.add(b));
    });
    return { id: f.id, label: f.label, scripts, places,
             centuryMin: minC, centuryMax: maxC, booksUnion, witnesses };
  });

  return familyData.map(fd => {
    const others = familyData.filter(o => o.id !== fd.id);
    const distinctives: string[] = [];

    // Unique scripts
    const otherScripts = new Set(others.flatMap(o => o.scripts));
    const uniqueScripts = fd.scripts.filter(s => !otherScripts.has(s));
    if (uniqueScripts.length === 1) {
      distinctives.push(`Unique script: ${uniqueScripts[0]}`);
    } else if (uniqueScripts.length > 1) {
      distinctives.push(`${uniqueScripts.length} unique script traditions`);
    }

    // Unique places
    const otherPlaces = new Set(others.flatMap(o => o.places));
    const uniquePlaces = fd.places.filter(p => !otherPlaces.has(p));
    if (uniquePlaces.length > 0) {
      distinctives.push(`Exclusive provenance: ${uniquePlaces.join(', ')}`);
    }

    // Oldest witnesses
    if (fd.centuryMin <= Math.min(...familyData.map(f => f.centuryMin))) {
      distinctives.push('Oldest surviving witnesses');
    }

    // Latest tradition
    if (fd.centuryMin >= Math.max(...familyData.map(f => f.centuryMin)) && fd.centuryMin > 9) {
      distinctives.push('Latest manuscript tradition');
    }

    // Coverage gaps
    if (fd.booksUnion.size < 10 && fd.booksUnion.size > 0) {
      const missing: string[] = [];
      for (let i = 1; i <= 10; i++) {
        if (!fd.booksUnion.has(i)) missing.push(toRomanNumeral(i));
      }
      if (missing.length > 0) {
        distinctives.push(`No witness preserves Books ${missing.join(', ')}`);
      }
    }

    // Notes and coverage-string distinctives
    const allNotes = fd.witnesses.flatMap(w => w.notes).join(' ').toLowerCase();
    const allCoverage = fd.witnesses.map(w => w.coverage).join(' ').toLowerCase();
    if (allNotes.includes('oldest manuscript')) distinctives.push('Contains oldest known copy');
    if (allCoverage.includes('fredegar')) distinctives.push('Includes Fredegar continuation');
    if (allNotes.includes('authentic forms') || allNotes.includes("correct '")) {
      distinctives.push('Preserves authentic name forms');
    }
    if (allNotes.includes('commissioned') || allNotes.includes('abbot')) {
      distinctives.push('Commissioned production');
    }

    // Contamination role
    const witIds = new Set(fd.witnesses.map(w => w.id));
    const contamEdges = data.edges.filter(e => e.type === 'contamination');
    const isSource = contamEdges.some(e => witIds.has(e.from));
    const isTarget = contamEdges.some(e => witIds.has(e.to));
    if (isSource && !isTarget) distinctives.push('Cross-family contamination source');
    if (isTarget && !isSource) distinctives.push('Received cross-family contamination');

    // Archetype connection type
    const archEdge = data.edges.find(e => e.from === 'archetype' && e.to === `${fd.id}_family`);
    if (archEdge?.type === 'inferred') distinctives.push('Inferred archetype connection');

    // Derived from another family
    const parentEdge = data.edges.find(e => e.to === `${fd.id}_family` && e.from !== 'archetype');
    if (parentEdge) {
      const parentId = parentEdge.from.replace('_family', '');
      distinctives.push(`Derived from Class ${parentId} tradition`);
    }

    // Date range
    const minR = toRomanNumeral(Math.floor(fd.centuryMin));
    const maxR = toRomanNumeral(Math.ceil(fd.centuryMax));
    const dateRange = minR === maxR ? `${minR} c.` : `${minR}\u2013${maxR} c.`;

    // Coverage pattern
    const bookList = [...fd.booksUnion].sort((a, b) => a - b);
    let coveragePattern: string;
    if (bookList.length === 10) coveragePattern = 'I\u2013X (complete)';
    else if (bookList.length === 0) coveragePattern = 'Unknown';
    else coveragePattern = `${toRomanNumeral(bookList[0])}\u2013${toRomanNumeral(bookList[bookList.length - 1])}`;

    return {
      id: fd.id,
      label: fd.label,
      distinctives,
      scripts: fd.scripts,
      places: fd.places.length > 0 ? fd.places : ['Unknown'],
      dateRange,
      coveragePattern,
      witnessCount: fd.witnesses.length
    };
  });
}
