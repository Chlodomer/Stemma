# Interactive Manuscript Stemma

An interactive web application for visualizing manuscript transmission and textual relationships, focusing on Gregory of Tours' *Historiarum Libri Decem*.

## Features

- **Interactive Graph Visualization**: D3.js-powered stemma with zoom, pan, and dynamic layout
- **Family Expansion**: Click family nodes to expand/collapse individual manuscripts
- **Detailed Manuscript Information**: Comprehensive metadata including dating, provenance, script, and coverage
- **Evidence-Based**: All relationships backed by MGH citations and scholarly evidence
- **Export Capabilities**: SVG and JSON export for further analysis and publication
- **Search & Filter**: Find manuscripts by siglum, repository, century, or other criteria

## Manuscript Families

The app currently includes data for Gregory of Tours' manuscript tradition:

- **Class A**: Complete manuscripts (Monte Cassino 275)
- **Class B**: Oldest manuscripts (7th-8th c.) - Cambrai 624, Brussels 9403, etc.
- **Class C**: Derived from B-like exemplar - Heidelberg Pal. Lat. 864, Namur 11
- **Class D**: Later manuscripts with various textual states

## Technology Stack

- **Frontend**: React + TypeScript
- **Visualization**: D3.js for interactive graph rendering
- **State Management**: Zustand
- **Build Tool**: Vite
- **Styling**: CSS with responsive design

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
git clone https://github.com/Chlodomer/Stemma.git
cd Stemma
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

### Navigation
- **Zoom**: Mouse wheel or pinch gesture
- **Pan**: Click and drag the background
- **Select**: Click nodes to view details
- **Expand Families**: Click family nodes to show/hide manuscripts

### Controls
- **View Modes**: Switch between family view and all manuscripts
- **Evidence Badges**: Toggle citation count indicators
- **Search**: Find specific manuscripts or repositories
- **Export**: Download SVG graphics or JSON data

### Data Structure

The application uses a JSON-based data model following MGH editorial standards:

```json
{
  "workId": "greg-tours-hist",
  "families": [...],
  "witnesses": [...],
  "edges": [...]
}
```

Each manuscript includes:
- Siglum and shelfmark
- Repository and provenance
- Dating and paleographic information
- Textual coverage and lacunae
- MGH page citations

## Data Sources

Primary source: *Monumenta Germaniae Historica* volumes containing:
- Codicological surveys and manuscript descriptions
- Family classifications and relationships
- Stemmatic evidence and editorial analysis

## Contributing

This project is designed to be extensible to other textual traditions. To add new manuscript families:

1. Create data files following the established JSON schema
2. Add family-specific styling and colors
3. Update the visualization layout as needed
4. Include proper scholarly citations

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- Based on *Monumenta Germaniae Historica* editorial work
- Inspired by digital stemmatology research
- Built for medieval manuscript studies and textual criticism