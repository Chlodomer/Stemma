import React, { useEffect } from 'react';
import { useStemmaStore } from './stores/stemmaStore';
import StemmaGraph from './components/StemmaGraph';
import NodeDetails from './components/NodeDetails';
import Controls from './components/Controls';
import './App.css';

function App() {
  const { initializeNodes } = useStemmaStore();

  useEffect(() => {
    initializeNodes();
  }, [initializeNodes]);

  return (
    <div className="app">
      <div className="app-header">
        <h1>Interactive Manuscript Stemma</h1>
        <p>Gregory of Tours - Historiarum Libri Decem</p>
      </div>
      
      <div className="app-content">
        <div className="left-panel">
          <Controls />
        </div>
        
        <div className="main-content">
          <StemmaGraph />
        </div>
        
        <div className="right-panel">
          <NodeDetails />
        </div>
      </div>
    </div>
  );
}

export default App;