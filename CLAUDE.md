# Bismarck - Manuscript Stemma Visualization

## Tech Stack
- React 18, TypeScript 5, Vite 4
- D3.js 7 (visualization), Zustand 4 (state management)
- Lucide React (icons), Inter font

## Project Structure
- **3-panel layout**: `Controls.tsx`, `StemmaGraph.tsx`, `NodeDetails.tsx`
- **Data**: `src/data/gregory-stemma.ts` — families, witnesses, edges with metadata (century, place, script, MGH citations)
- **State**: `src/stores/stemmaStore.ts` — graph nodes, expanded families, selected node, layout mode, view preferences
- **Utilities**: `src/utils/insights.ts` — pure functions for parsing, graph traversal, scoring
- **Styles**: `src/App.css` — all styles in one global file. Append new styles here.
- **Entry point**: `index.html` is the Vite React entry point (not standalone HTML)

## Conventions
- Analytical logic goes in pure utility functions in `src/utils/`
- Zustand store is the single source of truth for app state
- After toggling `expandedFamilies` in Zustand, call `initializeNodes()` to re-render the graph
- D3 `forceLink` expects `source`/`target` — always map from data's `from`/`to`
- Use `{'\\uXXXX'}` syntax for Unicode in JSX text content
- `text-transform: uppercase` can convert Unicode lowercase to Latin uppercase (e.g., `α` to `A`)

## Design Language
- **Aesthetic**: Subdued, minimalist, industrial look
- **Colors**: Gray/charcoal/concrete palette. Accent: `#d4652a` (orange). One accent color only.
- **Typography**: Inter, sans-serif. Uppercase headings with letter-spacing. Small font sizes.
- **Geometry**: 2px border-radius, thin 1px borders. No drop shadows, no gradients.
- **Icons**: Monochrome only (no colorful emojis). Verify Lucide icon availability before using.
- **Layout**: Resizable panels with drag handles. Fill dead space with meaningful content. Proportional text scaling via CSS `zoom`.
- **Insights**: Prefer non-obvious, analytical depth over raw data display.
