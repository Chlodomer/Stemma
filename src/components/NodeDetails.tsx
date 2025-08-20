import React from 'react';
import { useStemmaStore } from '../stores/stemmaStore';
import { Witness, Family } from '../types';
import { X, MapPin, Calendar, FileText, Link } from 'lucide-react';

const NodeDetails: React.FC = () => {
  const { selectedNode, nodes, data, setSelectedNode } = useStemmaStore();

  if (!selectedNode) {
    return (
      <div className="node-details-empty">
        <p>Select a node to view details</p>
      </div>
    );
  }

  const node = nodes.find(n => n.id === selectedNode);
  if (!node || !node.data) {
    return (
      <div className="node-details-empty">
        <p>No details available</p>
      </div>
    );
  }

  const isWitness = 'siglum' in node.data;
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