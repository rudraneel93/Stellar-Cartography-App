

import { useEffect, useState } from 'react';
import StarMap from './components/StarMap';
// import { getCurrentPosition } from './utils/astro';
import './App.css';


interface Star {
  id: number;
  name?: string;
  ra: number;
  dec: number;
  mag: number;
  spectype?: string;
}

interface ConstellationLineFeature {
  type: string;
  id: string;
  properties: Record<string, any>;
  geometry: {
    type: string;
    coordinates: number[][][];
  };
}



function getViewportSize() {
  return { width: window.innerWidth, height: window.innerHeight };
}

function App() {
  const [stars, setStars] = useState<Star[]>([]);
  const [constellationLines, setConstellationLines] = useState<ConstellationLineFeature[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [size, setSize] = useState(getViewportSize());

  useEffect(() => {
    const handleResize = () => setSize(getViewportSize());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show all stars, not filtered by location
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/data/bsc_stars.json').then(res => res.json()),
      fetch('/data/constellations.lines.json').then(res => res.json()),
    ])
      .then(([starData, linesData]) => {
        setStars(starData);
        setConstellationLines(linesData.features || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load star or constellation data.');
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden', position: 'fixed', top: 0, left: 0, background: 'black' }}>
      {loading && <p style={{ color: '#fff', position: 'absolute', top: 20, left: 20 }}>Loading...</p>}
      {error && <p style={{ color: 'salmon', position: 'absolute', top: 20, left: 20 }}>{error}</p>}
      {stars.length > 0 && (
        <StarMap
          stars={stars}
          constellationLines={constellationLines}
        />
      )}
    </div>
  );
}

export default App;
