---
description: When working with D3.js graph visualization or Zustand state
globs: src/components/StemmaGraph.tsx, src/stores/stemmaStore.ts, src/utils/**
---

- D3 `forceLink` requires `source` and `target` properties. The data model uses `from` and `to` — always map explicitly when creating link data.
- After modifying `expandedFamilies` in Zustand, call `initializeNodes()` to ensure the D3 graph re-renders with updated node data.
- Verify Lucide React icon names exist before importing (e.g., `Route` is not available).
