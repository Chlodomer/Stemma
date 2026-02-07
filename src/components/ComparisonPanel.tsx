import React, { useMemo } from 'react';
import { useStemmaStore } from '../stores/stemmaStore';
import { computeCoverageMatrix, computeFamilyProfiles } from '../utils/insights';

const BOOK_LABELS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

const FAMILY_COLORS: Record<string, string> = {
  'A': '#c47a4a',
  'B': '#5d7285',
  'C': '#7a8a5c',
  'D': '#9a8b7a',
};

const ComparisonPanel: React.FC = () => {
  const { data, selectedNode, nodes } = useStemmaStore();

  const coverageMatrix = useMemo(() => computeCoverageMatrix(data), [data]);
  const familyProfiles = useMemo(() => computeFamilyProfiles(data), [data]);

  // Determine which family to highlight based on selection
  const selectedFamilyId = useMemo(() => {
    if (!selectedNode) return null;
    const node = nodes.find(n => n.id === selectedNode);
    if (!node) return null;
    return node.familyId || null;
  }, [selectedNode, nodes]);

  // Group coverage rows by family
  const groupedRows = useMemo(() => {
    return data.families.map(family => ({
      familyId: family.id,
      label: family.label,
      rows: coverageMatrix.filter(r => r.familyId === family.id)
    }));
  }, [coverageMatrix, data.families]);

  return (
    <div className="comparison-panel">
      <div className="comparison-content">
        <div className="comparison-left">
          <h4>Book Coverage</h4>
          <table className="coverage-table">
            <thead>
              <tr>
                <th className="ct-siglum-header"></th>
                {BOOK_LABELS.map(label => (
                  <th key={label} className="ct-book-header">{label}</th>
                ))}
                <th className="ct-note-header"></th>
              </tr>
            </thead>
            <tbody>
              {groupedRows.map((group, gi) => (
                <React.Fragment key={group.familyId}>
                  {gi > 0 && (
                    <tr className="ct-divider"><td colSpan={12}></td></tr>
                  )}
                  {group.rows.map(row => {
                    const isHighlighted = selectedNode === row.id ||
                      selectedFamilyId === row.familyId;
                    return (
                      <tr
                        key={row.id}
                        className={`ct-row ${isHighlighted ? 'ct-highlighted' : ''}`}
                      >
                        <td
                          className="ct-siglum"
                          style={{ borderLeftColor: FAMILY_COLORS[row.familyId] }}
                        >
                          {row.siglum}
                        </td>
                        {row.books.map((has, idx) => (
                          <td
                            key={idx}
                            className={`ct-cell ${has ? 'ct-covered' : 'ct-missing'}`}
                            style={has ? {
                              backgroundColor: FAMILY_COLORS[row.familyId] + '30'
                            } : {}}
                          >
                            {has ? '\u25cf' : '\u00b7'}
                          </td>
                        ))}
                        <td className="ct-note">{row.note}</td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="comparison-right">
          <h4>Family Distinctives</h4>
          <div className="family-profiles-grid">
            {familyProfiles.map(profile => (
              <div
                key={profile.id}
                className={`fp-card ${selectedFamilyId === profile.id ? 'fp-highlighted' : ''}`}
                style={{ borderTopColor: FAMILY_COLORS[profile.id] }}
              >
                <div className="fp-header">
                  <span className="fp-label">{profile.label}</span>
                  <span className="fp-meta">
                    {profile.witnessCount} ms. &middot; {profile.dateRange}
                  </span>
                </div>
                <div className="fp-stats">
                  <span>{profile.coveragePattern}</span>
                  <span className="fp-separator">&middot;</span>
                  <span>
                    {profile.scripts.length > 2
                      ? `${profile.scripts.length} scripts`
                      : profile.scripts.join(', ')}
                  </span>
                </div>
                <ul className="fp-distinctives">
                  {profile.distinctives.map((d, idx) => (
                    <li key={idx}>{d}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonPanel;
