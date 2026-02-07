import { useEffect, useState, useRef, useCallback } from 'react';
import { useStemmaStore } from './stores/stemmaStore';
import StemmaGraph from './components/StemmaGraph';
import NodeDetails from './components/NodeDetails';
import Controls from './components/Controls';
import ComparisonPanel from './components/ComparisonPanel';
import './App.css';

const DEFAULT_LEFT = 300;
const DEFAULT_RIGHT = 350;
const DEFAULT_BOTTOM = 260;
const MIN_PANEL = 180;
const MIN_CENTER = 300;
const MIN_BOTTOM = 120;
const MAX_BOTTOM = 600;

type DragTarget = 'left' | 'right' | 'bottom' | null;

function clampZoom(current: number, base: number): number {
  const raw = current / base;
  return Math.min(1.5, Math.max(0.85, raw));
}

function App() {
  const { initializeNodes, nodes, data } = useStemmaStore();

  const [leftWidth, setLeftWidth] = useState(DEFAULT_LEFT);
  const [rightWidth, setRightWidth] = useState(DEFAULT_RIGHT);
  const [bottomHeight, setBottomHeight] = useState(DEFAULT_BOTTOM);

  const dragging = useRef<DragTarget>(null);
  const appContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeNodes();
  }, [initializeNodes]);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging.current || !appContentRef.current) return;
    e.preventDefault();

    const rect = appContentRef.current.getBoundingClientRect();

    if (dragging.current === 'left') {
      const newLeft = Math.max(MIN_PANEL, Math.min(e.clientX - rect.left, rect.width - rightWidth - MIN_CENTER - 12));
      setLeftWidth(newLeft);
    } else if (dragging.current === 'right') {
      const newRight = Math.max(MIN_PANEL, Math.min(rect.right - e.clientX, rect.width - leftWidth - MIN_CENTER - 12));
      setRightWidth(newRight);
    } else if (dragging.current === 'bottom') {
      const newBottom = Math.max(MIN_BOTTOM, Math.min(rect.bottom - e.clientY, MAX_BOTTOM));
      setBottomHeight(newBottom);
    }
  }, [leftWidth, rightWidth]);

  const onMouseUp = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = null;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  const startDrag = (target: DragTarget) => (e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = target;
    document.body.style.cursor = target === 'bottom' ? 'row-resize' : 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const leftZoom = clampZoom(leftWidth, DEFAULT_LEFT);
  const rightZoom = clampZoom(rightWidth, DEFAULT_RIGHT);
  const bottomZoom = clampZoom(bottomHeight, DEFAULT_BOTTOM);

  return (
    <div className="app">
      <div className="app-header">
        <h1>Interactive Manuscript Stemma</h1>
        <p>Gregory of Tours - Historiarum Libri Decem</p>
      </div>

      <div className="app-content" ref={appContentRef}>
        <div className="app-panels">
          <div className="left-panel" style={{ width: leftWidth, flexShrink: 0 }}>
            <div className="zoom-wrapper" style={{ zoom: leftZoom, width: leftWidth / leftZoom, padding: '1rem' }}>
              <Controls />
            </div>
          </div>

          <div className="resize-handle-v" onMouseDown={startDrag('left')} />

          <div className="main-content">
            <StemmaGraph />
          </div>

          <div className="resize-handle-v" onMouseDown={startDrag('right')} />

          <div className="right-panel" style={{ width: rightWidth, flexShrink: 0 }}>
            <div className="zoom-wrapper" style={{ zoom: rightZoom, width: rightWidth / rightZoom }}>
              <NodeDetails />
            </div>
          </div>
        </div>

        <div className="resize-handle-h" onMouseDown={startDrag('bottom')} />

        <div className="bottom-wrapper" style={{ height: bottomHeight, flexShrink: 0 }}>
          <div className="zoom-wrapper" style={{ zoom: bottomZoom, height: bottomHeight / bottomZoom, padding: '0.75rem 1rem' }}>
            <ComparisonPanel />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
