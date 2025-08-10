import React, { useRef, useEffect, useState } from 'react';

interface Star {
  id?: number;
  ra: number; // right ascension
  dec: number; // declination
  mag: number; // magnitude
  name?: string;
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

interface StarMapProps {
  stars: Star[];
  constellationLines?: ConstellationLineFeature[];
}

// Mollweide projection for 360-degree full-sky view
// Returns [x, y] in canvas coordinates, or null if outside the ellipse
// Equirectangular projection: fill the entire screen, no circular/elliptical effect
function equirectangularProject(ra: number, dec: number, width: number, height: number): [number, number] {
  // RA: 0-360 deg maps left (0) to right (360)
  // Dec: -90 (bottom) to +90 (top)
  const x = (ra / 360) * width;
  const y = ((90 - dec) / 180) * height;
  return [x, y];
}

// IAU 3-letter code to full constellation name
const CONSTELLATION_NAMES: Record<string, string> = {
  And: 'Andromeda', Ant: 'Antlia', Aps: 'Apus', Aql: 'Aquila', Aqr: 'Aquarius', Ara: 'Ara', Ari: 'Aries', Aur: 'Auriga', Boo: 'Boötes', Cae: 'Caelum', Cam: 'Camelopardalis', Cnc: 'Cancer', CVn: 'Canes Venatici', CMa: 'Canis Major', CMi: 'Canis Minor', Cap: 'Capricornus', Car: 'Carina', Cas: 'Cassiopeia', Cen: 'Centaurus', Cep: 'Cepheus', Cet: 'Cetus', Cha: 'Chamaeleon', Cir: 'Circinus', Col: 'Columba', Com: 'Coma Berenices', CrA: 'Corona Australis', CrB: 'Corona Borealis', Crv: 'Corvus', Crt: 'Crater', Cru: 'Crux', Cyg: 'Cygnus', Del: 'Delphinus', Dor: 'Dorado', Dra: 'Draco', Equ: 'Equuleus', Eri: 'Eridanus', For: 'Fornax', Gem: 'Gemini', Gru: 'Grus', Her: 'Hercules', Hor: 'Horologium', Hya: 'Hydra', Hyi: 'Hydrus', Ind: 'Indus', Lac: 'Lacerta', Leo: 'Leo', LMi: 'Leo Minor', Lep: 'Lepus', Lib: 'Libra', Lup: 'Lupus', Lyn: 'Lynx', Lyr: 'Lyra', Men: 'Mensa', Mic: 'Microscopium', Mon: 'Monoceros', Mus: 'Musca', Nor: 'Norma', Oct: 'Octans', Oph: 'Ophiuchus', Ori: 'Orion', Pav: 'Pavo', Peg: 'Pegasus', Per: 'Perseus', Phe: 'Phoenix', Pic: 'Pictor', Psc: 'Pisces', PsA: 'Piscis Austrinus', Pup: 'Puppis', Pyx: 'Pyxis', Ret: 'Reticulum', Sge: 'Sagitta', Sgr: 'Sagittarius', Sco: 'Scorpius', Scl: 'Sculptor', Sct: 'Scutum', Ser: 'Serpens', Sex: 'Sextans', Tau: 'Taurus', Tel: 'Telescopium', Tri: 'Triangulum', TrA: 'Triangulum Australe', Tuc: 'Tucana', UMa: 'Ursa Major', UMi: 'Ursa Minor', Vel: 'Vela', Vir: 'Virgo', Vol: 'Volans', Vul: 'Vulpecula'
};

const StarMap: React.FC<StarMapProps> = ({ stars, constellationLines = [] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = React.useState({ width: window.innerWidth, height: window.innerHeight });
  const [hoveredConstellation, setHoveredConstellation] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  // Responsive: update canvas size on window resize
  // Helper: distance from point to segment
  function distanceToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    if (len_sq !== 0) param = dot / len_sq;
    let xx, yy;
    if (param < 0) { xx = x1; yy = y1; }
    else if (param > 1) { xx = x2; yy = y2; }
    else { xx = x1 + param * C; yy = y1 + param * D; }
    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Mouse move handler
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
    let found: string | null = null;
    let minDist = 8; // px threshold
    for (const feature of constellationLines) {
      if (!feature.geometry || feature.geometry.type !== 'MultiLineString') continue;
      // Use full name if available, else fallback to id
      const name = CONSTELLATION_NAMES[feature.id] || feature.id;
      for (const line of feature.geometry.coordinates) {
        let prev: [number, number] | null = null;
        let prevRa: number | null = null;
        for (let i = 0; i < line.length; i++) {
          let [ra, dec] = line[i];
          if (ra < 0) ra += 360;
          if (ra >= 360) ra -= 360;
          const [x1, y1] = equirectangularProject(ra, dec, canvas.width, canvas.height);
          if (i > 0 && prev && prevRa !== null) {
            let dra = Math.abs(ra - prevRa);
            if (dra > 180) {
              // skip wraparound
            } else {
              const dist = distanceToSegment(x, y, prev[0], prev[1], x1, y1);
              if (dist < minDist) {
                found = name;
                minDist = dist;
              }
            }
          }
          prev = [x1, y1];
          prevRa = ra;
        }
      }
    }
    setHoveredConstellation(found);
  };

  // Mouse leave handler
  const handleMouseLeave = () => {
    setHoveredConstellation(null);
    setMousePos(null);
  };

  // Responsive: update canvas size on window resize
  useEffect(() => {
    function handleResize() {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  React.useEffect(() => {
    let animationId: number;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    // Astrophotography-inspired color palette by spectral type
    const spectralColors: Record<string, string> = {
      O: '#9bb0ff', // blue
      B: '#aabfff', // blue-white
      A: '#cad7ff', // white
      F: '#f8f7ff', // yellow-white
      G: '#fff4ea', // yellow
      K: '#ffd2a1', // orange
      M: '#ffcc6f', // red-orange
    };
    // Fallback for unknown types
    function getStarColor(spectype: string | undefined) {
      if (!spectype || typeof spectype !== 'string') return '#fff';
      const t = spectype[0].toUpperCase();
      return spectralColors[t] || '#fff';
    }

    // Animation loop for twinkling and constellation lines
    function drawFrame(time: number) {
      if (!ctx) return;
      const { width, height } = dimensions;
      ctx.clearRect(0, 0, width, height);
      // Fill background
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, width, height);

      // Draw constellation lines
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 1.2;
      for (const feature of constellationLines) {
        if (!feature.geometry || feature.geometry.type !== 'MultiLineString') continue;
        for (const line of feature.geometry.coordinates) {
          ctx.beginPath();
          let prev: [number, number] | null = null;
          let prevRa: number | null = null;
          for (let i = 0; i < line.length; i++) {
            let [ra, dec] = line[i];
            // Normalize RA to 0-360
            if (ra < 0) ra += 360;
            if (ra >= 360) ra -= 360;
            const [x, y] = equirectangularProject(ra, dec, width, height);
            if (i === 0) {
              ctx.moveTo(x, y);
            } else if (prev && prevRa !== null) {
              // If the RA difference is > 180deg, wrap across the edge
              let dra = Math.abs(ra - prevRa);
              if (dra > 180) {
                // End current segment, move to new point (no line across map)
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }
            }
            prev = [x, y];
            prevRa = ra;
          }
          ctx.stroke();
        }
      }
      ctx.restore();

      // Draw stars (twinkling)
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        const [x, y] = equirectangularProject(star.ra, star.dec, width, height);
        const twinklePhase = ((star.id ?? i) * 13.37 + time * 0.001) % (2 * Math.PI);
        const twinkle = 0.7 + 0.3 * Math.sin(twinklePhase + Math.sin(time * 0.0002 + i));
        const color = getStarColor(star.spectype);
        const minSize = 1.1;
        const maxSize = 4.5;
        const size = Math.max(minSize, maxSize - star.mag * 0.6) * twinkle;
        const minAlpha = 0.55;
        const maxAlpha = 1.0;
        const alpha = Math.max(minAlpha, maxAlpha - star.mag * 0.13) * twinkle;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, 2 * Math.PI);
        ctx.shadowColor = color;
        ctx.shadowBlur = size * 2.5;
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }
      animationId = requestAnimationFrame(drawFrame);
    }
    animationId = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(animationId);
  }, [stars, constellationLines, dimensions]);

  // Tooltip style
  const tooltipStyle: React.CSSProperties = mousePos && hoveredConstellation
    ? {
        position: 'fixed',
        left: mousePos.x + 18,
        top: mousePos.y + 18,
        background: 'rgba(0,0,0,0.85)',
        color: 'white',
        padding: '4px 12px',
        borderRadius: 6,
        pointerEvents: 'none',
        zIndex: 10,
        fontSize: 16,
        fontWeight: 500,
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
      }
    : { display: 'none' };

  return (
    <div style={{ position: 'fixed', width: '100vw', height: '100vh', top: 0, left: 0, zIndex: 0 }}>
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ background: 'black', display: 'block', width: '100vw', height: '100vh' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
      <div style={tooltipStyle}>
        {hoveredConstellation}
      </div>
    </div>
  );
};

export default StarMap;
