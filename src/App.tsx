import { useEffect } from 'react';
import { useStemmaStore } from './stores/stemmaStore';
import StemmaGraph from './components/StemmaGraph';
import NodeDetails from './components/NodeDetails';
import Controls from './components/Controls';
import './App.css';

function App() {
  const { initializeNodes, nodes, data } = useStemmaStore();

  useEffect(() => {
    console.log('App mounted, initializing nodes...');
    console.log('Data families:', data.families.length);
    console.log('Data witnesses:', data.witnesses.length);
    initializeNodes();
  }, [initializeNodes]);

  useEffect(() => {
    console.log('Nodes updated:', nodes.length);
  }, [nodes]);

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