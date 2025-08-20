import React from 'react';
import { useStemmaStore } from '../stores/stemmaStore';
import { Search, Eye, Download, RotateCcw } from 'lucide-react';

const Controls: React.FC = () => {
  const { 
    searchQuery, 
    viewMode, 
    showEvidence,
    setSearchQuery, 
    setViewMode, 
    toggleEvidence,
    expandedFamilies,
    toggleFamily,
    data
  } = useStemmaStore();

  const handleExportSVG = () => {
    const svg = document.querySelector('.stemma-graph svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = 'gregory-stemma.svg';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

  const handleExportJSON = () => {
    const jsonData = JSON.stringify(data, null, 2);
    const jsonBlob = new Blob([jsonData], { type: 'application/json' });
    const jsonUrl = URL.createObjectURL(jsonBlob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = jsonUrl;
    downloadLink.download = 'gregory-stemma-data.json';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(jsonUrl);
  };

  const resetView = () => {
    setSearchQuery('');
    setViewMode('family');
    // Reset to default expanded families
    data.families.forEach(family => {
      if (family.id === 'B' && !expandedFamilies.has('B')) {
        toggleFamily('B');
      } else if (family.id !== 'B' && expandedFamilies.has(family.id)) {
        toggleFamily(family.id);
      }
    });
  };

  return (
    <div className="controls">
      <div className="controls-section">
        <h3>Gregory of Tours - Manuscript Stemma</h3>
        <p>Interactive visualization of manuscript transmission</p>
      </div>

      <div className="controls-section">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search manuscripts, repositories, centuries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="controls-section">
        <h4>View Options</h4>
        <div className="control-group">
          <label>
            <input
              type="radio"
              name="viewMode"
              value="family"
              checked={viewMode === 'family'}
              onChange={(e) => setViewMode(e.target.value as 'family' | 'all')}
            />
            Family Mode
          </label>
          <label>
            <input
              type="radio"
              name="viewMode"
              value="all"
              checked={viewMode === 'all'}
              onChange={(e) => setViewMode(e.target.value as 'family' | 'all')}
            />
            All Witnesses
          </label>
        </div>

        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={showEvidence}
              onChange={toggleEvidence}
            />
            <Eye size={16} />
            Show Evidence Badges
          </label>
        </div>
      </div>

      <div className="controls-section">
        <h4>Family Controls</h4>
        <div className="family-toggles">
          {data.families.map(family => (
            <button
              key={family.id}
              className={`family-toggle ${expandedFamilies.has(family.id) ? 'expanded' : ''}`}
              onClick={() => toggleFamily(family.id)}
            >
              Class {family.id} {expandedFamilies.has(family.id) ? '▼' : '▶'}
            </button>
          ))}
        </div>
      </div>

      <div className="controls-section">
        <h4>Legend</h4>
        <div className="legend">
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#95a5a6' }}></div>
            <span>Archetype</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#e74c3c' }}></div>
            <span>Class A (Complete)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#3498db' }}></div>
            <span>Class B (Oldest)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#2ecc71' }}></div>
            <span>Class C</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#f39c12' }}></div>
            <span>Class D</span>
          </div>
          
          <div className="legend-divider"></div>
          
          <div className="legend-item">
            <div className="legend-line solid"></div>
            <span>Direct copy</span>
          </div>
          <div className="legend-item">
            <div className="legend-line dashed"></div>
            <span>Contamination</span>
          </div>
          <div className="legend-item">
            <div className="legend-line dotted"></div>
            <span>Inferred relation</span>
          </div>
        </div>
      </div>

      <div className="controls-section">
        <h4>Actions</h4>
        <div className="action-buttons">
          <button onClick={resetView} className="action-button">
            <RotateCcw size={16} />
            Reset View
          </button>
          <button onClick={handleExportSVG} className="action-button">
            <Download size={16} />
            Export SVG
          </button>
          <button onClick={handleExportJSON} className="action-button">
            <Download size={16} />
            Export Data
          </button>
        </div>
      </div>

      <div className="controls-section">
        <h4>Instructions</h4>
        <ul className="instructions">
          <li>Click family nodes to expand/collapse</li>
          <li>Click witness nodes to view details</li>
          <li>Drag to pan, scroll to zoom</li>
          <li>Line thickness shows confidence</li>
          <li>Evidence badges show citation count</li>
        </ul>
      </div>
    </div>
  );
};

export default Controls;