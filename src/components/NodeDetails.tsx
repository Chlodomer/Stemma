import React, { useMemo } from 'react';
import { useStemmaStore } from '../stores/stemmaStore';
import { Witness, Family } from '../types';
import {
  X, MapPin, Calendar, FileText, Link,
  Navigation, GitBranch, BarChart3, Shield, ArrowRightLeft,
  Users, Globe, Star
} from 'lucide-react';
import { computeWitnessInsights, computeFamilyInsights } from '../utils/insights';

const NodeDetails: React.FC = () => {
  const { selectedNode, nodes, data, setSelectedNode } = useStemmaStore();

  const node = nodes.find(n => n.id === selectedNode);
  const isWitness = node?.data && 'siglum' in node.data;

  const witnessInsights = useMemo(() => {
    if (!selectedNode || !isWitness) return null;
    return computeWitnessInsights(selectedNode, data);
  }, [selectedNode, isWitness, data]);

  const familyInsights = useMemo(() => {
    if (!selectedNode || !node?.data || isWitness) return null;
    const family = node.data as Family;
    return computeFamilyInsights(family.id, data);
  }, [selectedNode, node, isWitness, data]);

  if (!selectedNode) {
    return (
      <div className="node-details-empty">
        <p>Select a node to view details</p>
      </div>
    );
  }

  if (!node || !node.data) {
    return (
      <div className="node-details-empty">
        <p>No details available</p>
      </div>
    );
  }

  const witness = node.data as Witness;
  const family = node.data as Family;

  // Get edges related to this node
  const relatedEdges = data.edges.filter(e =>
    e.from === selectedNode || e.to === selectedNode
  );

  return (
    <div className="node-details">
      <div className="node-details-header">
        <h3>{isWitness ? witness.siglum : family.label}</h3>
        <button
          onClick={() => setSelectedNode(null)}
          className="close-button"
        >
          <X size={20} />
        </button>
      </div>

      <div className="node-details-content">
        {isWitness ? (
          <div className="witness-details">
            <div className="detail-section">
              <h4>Manuscript Information</h4>
              <div className="detail-item">
                <FileText size={16} />
                <span><strong>Shelfmark:</strong> {witness.shelfmark}</span>
              </div>
              <div className="detail-item">
                <MapPin size={16} />
                <span><strong>Repository:</strong> {witness.repo}</span>
              </div>
              <div className="detail-item">
                <Calendar size={16} />
                <span><strong>Century:</strong> {witness.century}</span>
              </div>
              <div className="detail-item">
                <MapPin size={16} />
                <span>
                  <strong>Place:</strong> {witness.place.name}
                  {witness.place.confidence < 0.7 && <span className="uncertainty"> (?)</span>}
                </span>
              </div>
            </div>

            <div className="detail-section">
              <h4>Textual Information</h4>
              <div className="detail-item">
                <span><strong>Script:</strong> {witness.script}</span>
              </div>
              <div className="detail-item">
                <span><strong>Coverage:</strong> {witness.coverage}</span>
              </div>
              <div className="detail-item">
                <span><strong>Family:</strong> Class {witness.familyId}</span>
              </div>
            </div>

            {witness.notes.length > 0 && (
              <div className="detail-section">
                <h4>Notes</h4>
                <ul className="notes-list">
                  {witness.notes.map((note, idx) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="detail-section">
              <h4>MGH Citations</h4>
              <div className="citations">
                {witness.citations.map((citation, idx) => (
                  <span key={idx} className="citation-badge">
                    p. {citation.mghPage}
                  </span>
                ))}
              </div>
            </div>

            {witnessInsights && (
              <div className="detail-section insights-section">
                <h4>Analytical Insights</h4>
                <div className="insight-grid">
                  <div className="insight-card">
                    <div className="insight-label">
                      <Navigation size={14} /> Path from {'\u03b1'}
                    </div>
                    <div className="insight-value">
                      {witnessInsights.distanceFromArchetype !== null
                        ? `${witnessInsights.distanceFromArchetype} hops`
                        : 'Unreachable'}
                    </div>
                    <div className="insight-detail">
                      {witnessInsights.transmissionPath.join(' \u203a ')}
                    </div>
                  </div>

                  <div className="insight-card">
                    <div className="insight-label">
                      <Shield size={14} /> Path Quality
                    </div>
                    <div className="insight-value">
                      {witnessInsights.transmissionPathQuality !== null
                        ? `${(witnessInsights.transmissionPathQuality * 100).toFixed(0)}%`
                        : '\u2014'}
                    </div>
                    <div className="insight-detail">
                      confidence product
                    </div>
                  </div>

                  <div className="insight-card">
                    <div className="insight-label">
                      <GitBranch size={14} /> Descendants
                    </div>
                    <div className="insight-value">
                      {witnessInsights.descendantCount}
                    </div>
                    {witnessInsights.descendants.length > 0 && (
                      <div className="insight-detail">
                        {witnessInsights.descendants.join(', ')}
                      </div>
                    )}
                  </div>

                  <div className="insight-card">
                    <div className="insight-label">
                      <BarChart3 size={14} /> Coverage
                    </div>
                    <div className="insight-value">
                      {(witnessInsights.coverageCompleteness * 100).toFixed(0)}%
                    </div>
                    <div className="insight-detail">
                      {witnessInsights.coverageBookRange}
                    </div>
                  </div>

                  <div className="insight-card">
                    <div className="insight-label">
                      <BarChart3 size={14} /> vs. Family
                    </div>
                    <div className="insight-value">
                      #{witnessInsights.coverageVsFamilyPeers.rank}/{witnessInsights.coverageVsFamilyPeers.totalInFamily}
                    </div>
                    <div className="insight-detail">
                      family avg: {witnessInsights.coverageVsFamilyPeers.familyAveragePercent.toFixed(0)}%
                    </div>
                  </div>

                  <div className="insight-card">
                    <div className="insight-label">
                      <ArrowRightLeft size={14} /> Contamination
                    </div>
                    <div className="insight-value insight-contamination">
                      {witnessInsights.contaminationRole}
                    </div>
                    {witnessInsights.contaminationEdges.length > 0 && (
                      <div className="insight-detail">
                        {witnessInsights.contaminationEdges.map(e =>
                          `${e.type === 'outgoing' ? '\u2192' : '\u2190'} ${e.otherNodeId}`
                        ).join(', ')}
                      </div>
                    )}
                  </div>

                  <div className="insight-card highlight" style={{ gridColumn: '1 / -1' }}>
                    <div className="insight-label">
                      <Star size={14} /> Authority Score
                    </div>
                    <div className="insight-value insight-authority">
                      {(witnessInsights.authorityScore * 100).toFixed(0)}
                    </div>
                    <div className="insight-detail">
                      composite of path quality, coverage, and scribal quality
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="family-details">
            <div className="detail-section">
              <h4>Family Description</h4>
              <p>{family.notes}</p>
            </div>

            <div className="detail-section">
              <h4>Witnesses in this Family</h4>
              <div className="family-witnesses">
                {data.witnesses
                  .filter(w => w.familyId === family.id)
                  .map(w => (
                    <div key={w.id} className="witness-summary">
                      <strong>{w.siglum}</strong> - {w.century} - {w.repo}
                    </div>
                  ))}
              </div>
            </div>

            <div className="detail-section">
              <h4>MGH Evidence</h4>
              <div className="citations">
                {family.evidence.map((evidence, idx) => (
                  <span key={idx} className="citation-badge">
                    p. {evidence.mghPage}
                  </span>
                ))}
              </div>
            </div>

            {familyInsights && (
              <div className="detail-section insights-section">
                <h4>Family Analytics</h4>
                <div className="insight-grid">
                  <div className="insight-card">
                    <div className="insight-label">
                      <Users size={14} /> Witnesses
                    </div>
                    <div className="insight-value">{familyInsights.witnessCount}</div>
                    <div className="insight-detail">
                      {familyInsights.witnesses.join(', ')}
                    </div>
                  </div>

                  <div className="insight-card">
                    <div className="insight-label">
                      <Calendar size={14} /> Date Range
                    </div>
                    <div className="insight-value">{familyInsights.dateRange}</div>
                  </div>

                  <div className="insight-card">
                    <div className="insight-label">
                      <BarChart3 size={14} /> Avg Coverage
                    </div>
                    <div className="insight-value">
                      {(familyInsights.averageCoverage * 100).toFixed(0)}%
                    </div>
                  </div>

                  <div className="insight-card">
                    <div className="insight-label">
                      <Globe size={14} /> Origins
                    </div>
                    <div className="insight-value">
                      {familyInsights.geographicSpread.length} locations
                    </div>
                    {familyInsights.geographicSpread.length > 0 && (
                      <div className="insight-detail">
                        {familyInsights.geographicSpread.join(', ')}
                      </div>
                    )}
                  </div>

                  {familyInsights.keyManuscript && (
                    <div className="insight-card highlight" style={{ gridColumn: '1 / -1' }}>
                      <div className="insight-label">
                        <Star size={14} /> Key Manuscript
                      </div>
                      <div className="insight-value">
                        {familyInsights.keyManuscript.siglum}
                      </div>
                      <div className="insight-detail">
                        authority score: {(familyInsights.keyManuscript.authorityScore * 100).toFixed(0)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {relatedEdges.length > 0 && (
          <div className="detail-section">
            <h4>Textual Relations</h4>
            <div className="relations">
              {relatedEdges.map((edge, idx) => {
                const isSource = edge.from === selectedNode;
                const relatedNodeId = isSource ? edge.to : edge.from;
                const relatedNode = nodes.find(n => n.id === relatedNodeId);

                return (
                  <div key={idx} className="relation-item">
                    <Link size={14} />
                    <span>
                      {isSource ? 'Source for' : 'Derived from'}{' '}
                      <strong>{relatedNode?.label || relatedNodeId}</strong>
                      {' '}({edge.type})
                      {edge.confidence < 0.7 && <span className="uncertainty"> (?)</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NodeDetails;
