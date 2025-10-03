# 🌌 Stellar Cartography - Interactive Star Map

A modern, interactive web application for exploring the night sky. Built with React, TypeScript, and Vite, this app provides a beautiful 2D visualization of stars and constellations from the Bright Star Catalog with intelligent hover interactions and AI-powered natural language search.

## ✨ Features

### 📍 Interactive Star Map
- **Full-Sky 2D Visualization**: Equirectangular projection displaying the entire celestial sphere
- **9,000+ Stars**: Data from the Yale Bright Star Catalog (BSC)
- **88 Constellations**: Complete constellation line patterns with IAU standard boundaries
- **Realistic Star Rendering**: 
  - Color-coded by spectral type (O, B, A, F, G, K, M)
  - Size based on apparent magnitude
  - Twinkling animation for realistic effect
  - Additive blending for authentic glow

### 🎯 Smart Hover Tooltips
- **Intelligent Positioning**: Tooltips automatically adjust to stay within viewport bounds
- **Star Information Display**:
  - Star name (when available)
  - BSC catalog ID
  - Right Ascension (RA) and Declination (Dec)
  - Apparent magnitude
  - Spectral type classification
- **Constellation Details**:
  - Constellation name with prominent styling
  - List of stars forming constellation line segments
  - Star magnitudes for nearby constellation stars
- **Combined Tooltips**: When hovering stars on constellation lines, displays both star and constellation information

### 🤖 AI-Powered Natural Language Search
- **Conversational Queries**: Ask questions in plain English
- **Smart Entity Recognition**: 
  - Recognizes 28+ constellation names and aliases
  - Identifies 19 famous stars (Sirius, Betelgeuse, Vega, etc.)
  - Understands months and seasonal queries
- **Example Queries**:
  - "Show me Orion"
  - "What constellations are visible in December?"
  - "Find the Big Dipper"
  - "What's the brightest star in Leo?"
  - "Tell me about Sirius"

### 🔍 Constellation Focus Mode
- **Click to Zoom**: Click any constellation to zoom in and focus
- **Enhanced Visibility**: Selected constellations appear brighter and thicker
- **Detailed Information Panel**:
  - Constellation description
  - Area in square degrees
  - Brightest star
  - Wikipedia link for more information
- **Smooth Transitions**: Animated zoom and pan effects

### 📊 Data Integration
- **Real-time API Fetching**: Constellation data from external APIs
- **Local Star Catalog**: Comprehensive BSC data stored locally for instant access
- **Constellation Geometry**: GeoJSON format for constellation lines and boundaries

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/rudraneel93/Stellar-Cartography-App.git
   cd Stellar-Cartography
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`

## 🛠️ Technology Stack

- **Frontend Framework**: React 19.1
- **Language**: TypeScript 5.8
- **Build Tool**: Vite 7.1
- **Rendering**: HTML5 Canvas with 2D Context
- **Styling**: CSS with modern features
- **Analytics**: Vercel Analytics
- **NLP**: Custom natural language processing engine

## 📁 Project Structure

```
src/
├── components/
│   ├── StarMap.tsx          # Main 2D star map component
│   ├── StarMap3D.tsx        # 3D star map (Three.js - optional)
│   └── AISearch.tsx         # AI search interface
├── utils/
│   ├── nlp.ts              # Natural language processing
│   ├── api.ts              # API integration
│   └── astro.ts            # Astronomical calculations
├── assets/
│   └── react.svg
└── App.tsx                  # Main application component

public/
└── data/
    ├── bsc_stars.json                  # Bright Star Catalog data
    ├── constellations.lines.json       # Constellation line patterns
    └── constellations.borders.json     # Constellation boundaries
```

## 🎮 Usage

### Navigation
- **Hover**: Move your mouse over stars or constellation lines to see detailed information
- **Click Constellation**: Click on any constellation line or name to focus and zoom in
- **Show All**: Click "Show All Constellations" button to reset view

### AI Search
1. Click the search icon in the bottom-left corner
2. Type your question in natural language
3. Press Enter or click the send button
4. The app will interpret your query and respond accordingly

### Tooltip Features
- Tooltips automatically reposition near screen edges
- Scrollable content for long constellation star lists
- Color-coded styling distinguishes stars from constellations
- Click-through functionality for constellation tooltips

## 🌟 Future Enhancements

- [ ] 3D celestial sphere visualization with Three.js
- [ ] Real-time sky position based on user location and time
- [ ] Deep sky objects (nebulae, galaxies, clusters)
- [ ] Star magnitude filtering
- [ ] Custom observation planning
- [ ] Mobile touch gestures
- [ ] Dark/light theme toggle
- [ ] Export star maps as images

## 📝 Data Sources

- **Star Data**: Yale Bright Star Catalog (9,110 stars)
- **Constellation Data**: International Astronomical Union (IAU) boundaries
- **Constellation Information**: Wikipedia API integration

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 👨‍💻 Author

**Rudraneel**
- GitHub: [@rudraneel93](https://github.com/rudraneel93)

## 🙏 Acknowledgments

- Yale Bright Star Catalog for comprehensive star data
- IAU for constellation boundary definitions
- React and Vite communities for excellent tooling
