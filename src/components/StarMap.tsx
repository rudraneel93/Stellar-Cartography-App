import React, { useRef, useEffect, useState } from 'react';
import AISearch from './AISearch';

interface Star {
  id?: number;
  ra: number; // right ascension
  dec: number; // declination
  mag: number; // magnitude
  name?: string; // star name (e.g., "Mu  Cen", "Sirius")
  spectype?: string; // spectral type (e.g., "A1V", "M4III")
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
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [hoveredConstellation, setHoveredConstellation] = useState<string | null>(null);
  const [hoveredStar, setHoveredStar] = useState<Star | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [selectedConstellation, setSelectedConstellation] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<{ x: number; y: number } | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [constellationData, setConstellationData] = useState<any | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  
  // Function to select a constellation programmatically (called by AI search)
  const selectConstellationByName = (constellationName: string) => {
    setSelectedConstellation(constellationName);
    // Center using circular mean for RA and average for Dec
    let sumSin = 0, sumCos = 0, sumDec = 0, count = 0;
    for (const feature of constellationLines) {
      const name = CONSTELLATION_NAMES[feature.id] || feature.id;
      if (name !== constellationName) continue;
      if (!feature.geometry || feature.geometry.type !== 'MultiLineString') continue;
      for (const line of feature.geometry.coordinates) {
        for (let i = 0; i < line.length; i++) {
          let [ra, dec] = line[i];
          if (ra < 0) ra += 360;
          if (ra >= 360) ra -= 360;
          const rad = (ra * Math.PI) / 180;
          sumSin += Math.sin(rad);
          sumCos += Math.cos(rad);
          sumDec += dec;
          count++;
        }
      }
    }
    if (count > 0) {
      const meanRad = Math.atan2(sumSin / count, sumCos / count);
      let avgRa = (meanRad * 180) / Math.PI;
      if (avgRa < 0) avgRa += 360;
      const avgDec = sumDec / count;
      const [centerX, centerY] = equirectangularProject(avgRa, avgDec, dimensions.width, dimensions.height);
      setCenter({ x: centerX, y: centerY });
      setZoom(2.2);
    }
    // Fetch detailed data for the selected constellation
    setLoadingData(true);
    setDataError(null);
    import('../utils/api').then(api => {
      api.fetchConstellationData(constellationName)
        .then((data: any) => {
          setConstellationData(data);
          setLoadingData(false);
        })
        .catch(() => {
          setConstellationData({
            name: constellationName,
            description: `Details about ${constellationName}.`,
            area: 'N/A',
            brightestStar: 'Unknown',
          });
          setLoadingData(false);
          setDataError('Failed to fetch constellation data.');
        });
    });
  };

  // Click handler: select constellation, center and zoom
  const handleCanvasClick = (_e: React.MouseEvent<HTMLCanvasElement>) => {
    if (hoveredConstellation) {
      // Allow clicking any constellation, even when one is already selected
      // This enables switching between constellations
      if (hoveredConstellation !== selectedConstellation) {
        selectConstellationByName(hoveredConstellation);
      }
      // If clicking the same constellation, toggle the collapsed state
      else {
        setCollapsed(!collapsed);
      }
    }
  };

  // Reset view
  const handleShowAll = () => {
    setSelectedConstellation(null);
    setZoom(1);
    setCenter(null);
    setConstellationData(null);
    setCollapsed(false);
  };

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
    
    // Check for both constellation lines AND stars simultaneously
    // This allows us to show combined information when both are present
    
    // Check for constellation line hover and find nearby constellation stars
    let foundConstellation: string | null = null;
    let minConstellationDist = 10; // px threshold for constellation lines (slightly increased for better detection)
    let nearbyConstellationStars: Star[] = [];
    
    for (const feature of constellationLines) {
      if (!feature.geometry || feature.geometry.type !== 'MultiLineString') continue;
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
              if (dist < minConstellationDist) {
                foundConstellation = name;
                minConstellationDist = dist;
                
                // Find stars near this constellation line segment
                // Look for stars at the endpoints of this line segment
                const searchRadius = 15; // pixels to search for stars
                nearbyConstellationStars = [];
                
                for (const star of stars) {
                  const [sx, sy] = equirectangularProject(star.ra, star.dec, canvas.width, canvas.height);
                  const distToPrev = prev ? Math.sqrt((sx - prev[0]) ** 2 + (sy - prev[1]) ** 2) : Infinity;
                  const distToCurrent = Math.sqrt((sx - x1) ** 2 + (sy - y1) ** 2);
                  
                  if (distToPrev < searchRadius || distToCurrent < searchRadius) {
                    // Check if star is not already in the array
                    if (!nearbyConstellationStars.find(s => s.id === star.id)) {
                      nearbyConstellationStars.push(star);
                    }
                  }
                }
                
                // Sort by distance to the line segment and limit to top 3-4 stars
                nearbyConstellationStars.sort((a, b) => {
                  const [ax, ay] = equirectangularProject(a.ra, a.dec, canvas.width, canvas.height);
                  const [bx, by] = equirectangularProject(b.ra, b.dec, canvas.width, canvas.height);
                  const distA = Math.min(
                    prev ? Math.sqrt((ax - prev[0]) ** 2 + (ay - prev[1]) ** 2) : Infinity,
                    Math.sqrt((ax - x1) ** 2 + (ay - y1) ** 2)
                  );
                  const distB = Math.min(
                    prev ? Math.sqrt((bx - prev[0]) ** 2 + (by - prev[1]) ** 2) : Infinity,
                    Math.sqrt((bx - x1) ** 2 + (by - y1) ** 2)
                  );
                  return distA - distB;
                });
                nearbyConstellationStars = nearbyConstellationStars.slice(0, 4);
              }
            }
          }
          prev = [x1, y1];
          prevRa = ra;
        }
      }
    }
    
    // Check for star hover independently
    let foundStar: Star | null = null;
    let minStarDist = 10; // px threshold for stars
    for (const star of stars) {
      const [sx, sy] = equirectangularProject(star.ra, star.dec, canvas.width, canvas.height);
      const dist = Math.sqrt((x - sx) ** 2 + (y - sy) ** 2);
      // Calculate star size (same as rendering logic)
      const minSize = 1.1;
      const maxSize = 4.5;
      const size = Math.max(minSize, maxSize - star.mag * 0.6);
      const hitboxSize = Math.max(size + 3, 8); // Good-sized hitbox for easy hovering
      if (dist < hitboxSize && dist < minStarDist) {
        foundStar = star;
        minStarDist = dist;
      }
    }
    
    // Set both states - they can both be active at the same time!
    setHoveredConstellation(foundConstellation);
    setHoveredStar(foundStar);
    
    // Store nearby constellation stars in state for tooltip display
    if (foundConstellation && nearbyConstellationStars.length > 0 && !foundStar) {
      // If we have constellation stars and no specific star is hovered, show them
      (window as any).__nearbyConstellationStars = nearbyConstellationStars;
    } else {
      (window as any).__nearbyConstellationStars = [];
    }
  };

  // Mouse leave handler
  const handleMouseLeave = () => {
    setHoveredConstellation(null);
    setHoveredStar(null);
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

    const spectralColors: Record<string, string> = {
      O: '#9bb0ff', B: '#aabfff', A: '#cad7ff', F: '#f8f7ff', G: '#fff4ea', K: '#ffd2a1', M: '#ffcc6f',
    };
    function getStarColor(spectype: string | undefined) {
      if (!spectype || typeof spectype !== 'string') return '#fff';
      const t = spectype[0].toUpperCase();
      return spectralColors[t] || '#fff';
    }

    function drawFrame(time: number) {
      if (!ctx) return;
      const { width, height } = dimensions;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, width, height);

      let zoomed = false;
      if (selectedConstellation && center && zoom > 1) {
        // Clamp center so zoomed view doesn't go out of bounds
        let clampedCenterX = Math.max(Math.min(center.x, width - width/(2*zoom)), width/(2*zoom));
        let clampedCenterY = Math.max(Math.min(center.y, height - height/(2*zoom)), height/(2*zoom));
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.scale(zoom, zoom);
        ctx.translate(-clampedCenterX, -clampedCenterY);
        zoomed = true;
      }

      // Draw constellation lines
      ctx.save();
      for (const feature of constellationLines) {
        if (!feature.geometry || feature.geometry.type !== 'MultiLineString') continue;
        const name = CONSTELLATION_NAMES[feature.id] || feature.id;
        // Only draw selected constellation lines if selected, else draw all
        if (selectedConstellation) {
          if (name === selectedConstellation) {
            ctx.strokeStyle = 'rgba(255,255,255,0.98)'; // much brighter
            ctx.lineWidth = 3.2 / (zoom > 1 ? zoom : 1); // thicker
            ctx.shadowColor = '#fff';
            ctx.shadowBlur = 12;
          } else {
            continue;
          }
        } else {
          ctx.strokeStyle = 'rgba(255,255,255,0.5)';
          ctx.lineWidth = 1.2;
          ctx.shadowBlur = 0;
        }
        for (const line of feature.geometry.coordinates) {
          ctx.beginPath();
          let prev: [number, number] | null = null;
          let prevRa: number | null = null;
          for (let i = 0; i < line.length; i++) {
            let [ra, dec] = line[i];
            if (ra < 0) ra += 360;
            if (ra >= 360) ra -= 360;
            const [x, y] = equirectangularProject(ra, dec, width, height);
            if (i === 0) {
              ctx.moveTo(x, y);
            } else if (prev && prevRa !== null) {
              let dra = Math.abs(ra - prevRa);
              if (dra > 180) {
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

      // Draw all stars, regardless of selection
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
      if (zoomed) {
        ctx.restore();
      }
      animationId = requestAnimationFrame(drawFrame);
    }
    animationId = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(animationId);
  }, [stars, constellationLines, dimensions, selectedConstellation, zoom, center]);

  // Tooltip style - shows for stars or constellations (or both!)
  const showTooltip = mousePos && !selectedConstellation && (hoveredStar || hoveredConstellation);
  const hasBoth = hoveredStar && hoveredConstellation;
  
  // Calculate smart tooltip position to avoid screen edges
  const getTooltipPosition = () => {
    if (!mousePos) return { left: 0, top: 0 };
    
    const tooltipWidth = hasBoth ? 360 : 320;
    const tooltipHeight = 250; // Estimated max height
    const offset = 18;
    const padding = 10; // Padding from screen edges
    
    let left = mousePos.x + offset;
    let top = mousePos.y + offset;
    
    // Check if tooltip would extend beyond right edge
    if (left + tooltipWidth > window.innerWidth - padding) {
      left = mousePos.x - tooltipWidth - offset;
    }
    
    // Check if tooltip would extend beyond bottom edge
    if (top + tooltipHeight > window.innerHeight - padding) {
      top = mousePos.y - tooltipHeight - offset;
    }
    
    // Ensure tooltip doesn't go beyond left edge
    if (left < padding) {
      left = padding;
    }
    
    // Ensure tooltip doesn't go beyond top edge
    if (top < padding) {
      top = padding;
    }
    
    return { left, top };
  };
  
  const tooltipPosition = getTooltipPosition();
  
  const tooltipStyle: React.CSSProperties = showTooltip
    ? {
        position: 'fixed',
        left: tooltipPosition.left,
        top: tooltipPosition.top,
        background: hasBoth 
          ? 'linear-gradient(135deg, rgba(10,10,30,0.96) 0%, rgba(5,5,20,0.96) 100%)' 
          : hoveredConstellation 
            ? 'rgba(10,10,30,0.95)' 
            : 'rgba(0,0,0,0.92)',
        color: 'white',
        padding: hasBoth ? '12px 16px' : '10px 14px',
        borderRadius: 8,
        pointerEvents: hoveredConstellation ? 'auto' : 'none',
        zIndex: 10,
        fontSize: 14,
        fontWeight: 400,
        boxShadow: hasBoth
          ? '0 6px 20px rgba(100,150,255,0.5), 0 3px 10px rgba(0,0,0,0.7)'
          : hoveredConstellation 
            ? '0 4px 16px rgba(100,150,255,0.4), 0 2px 8px rgba(0,0,0,0.6)' 
            : '0 4px 12px rgba(0,0,0,0.5)',
        cursor: hoveredConstellation ? 'pointer' : 'default',
        maxWidth: hasBoth ? '360px' : '320px',
        maxHeight: '80vh',
        overflowY: 'auto',
        border: hasBoth
          ? '1.5px solid rgba(150,180,255,0.5)'
          : hoveredConstellation 
            ? '1px solid rgba(150,180,255,0.3)' 
            : '1px solid rgba(255,255,255,0.15)',
        backdropFilter: 'blur(10px)',
      }
    : { display: 'none' };
  
  // Tooltip content - intelligently combines star and constellation info
  const getTooltipContent = () => {
    // Get nearby constellation stars from temporary storage
    const nearbyStars = (window as any).__nearbyConstellationStars || [];
    
    // Case 1: Both star AND constellation are hovered (star on a constellation line)
    if (hoveredStar && hoveredConstellation) {
      const starName = hoveredStar.name && hoveredStar.name.trim() !== '' 
        ? hoveredStar.name 
        : 'Unnamed Star';
      const magStr = hoveredStar.mag.toFixed(2);
      const raStr = hoveredStar.ra.toFixed(4);
      const decStr = hoveredStar.dec.toFixed(4);
      
      return (
        <div>
          {/* Constellation header */}
          <div style={{ 
            fontWeight: 700, 
            marginBottom: 6, 
            fontSize: 14, 
            letterSpacing: '0.3px',
            paddingBottom: 6,
            borderBottom: '1px solid rgba(150,180,255,0.3)'
          }}>
            ✨ {hoveredConstellation}
          </div>
          
          {/* Star information */}
          <div style={{ marginTop: 6 }}>
            <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 13 }}>⭐ {starName}</div>
            {hoveredStar.id && (
              <div style={{ fontSize: 11, opacity: 0.85, marginBottom: 2 }}>
                🆔 BSC {hoveredStar.id}
              </div>
            )}
            <div style={{ fontSize: 11, opacity: 0.85, marginBottom: 2 }}>
              📍 RA: {raStr}° | Dec: {decStr}°
            </div>
            <div style={{ fontSize: 11, opacity: 0.85, marginBottom: 2 }}>
              ✨ Magnitude: {magStr}
            </div>
            {hoveredStar.spectype && (
              <div style={{ fontSize: 11, opacity: 0.85 }}>
                🌈 Type: {hoveredStar.spectype}
              </div>
            )}
          </div>
          
          <div style={{ fontSize: 10, opacity: 0.7, fontStyle: 'italic', marginTop: 6 }}>
            Click to focus on {hoveredConstellation}
          </div>
        </div>
      );
    }
    
    // Case 2: Only star is hovered (star not on a constellation line)
    if (hoveredStar) {
      const starName = hoveredStar.name && hoveredStar.name.trim() !== '' 
        ? hoveredStar.name 
        : 'Unnamed Star';
      const magStr = hoveredStar.mag.toFixed(2);
      const raStr = hoveredStar.ra.toFixed(4);
      const decStr = hoveredStar.dec.toFixed(4);
      
      return (
        <div>
          <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 13 }}>⭐ {starName}</div>
          {hoveredStar.id && (
            <div style={{ fontSize: 11, opacity: 0.85, marginBottom: 2 }}>
              🆔 BSC {hoveredStar.id}
            </div>
          )}
          <div style={{ fontSize: 11, opacity: 0.85, marginBottom: 2 }}>
            📍 RA: {raStr}°
          </div>
          <div style={{ fontSize: 11, opacity: 0.85, marginBottom: 2 }}>
            📍 Dec: {decStr}°
          </div>
          <div style={{ fontSize: 11, opacity: 0.85, marginBottom: 2 }}>
            ✨ Magnitude: {magStr}
          </div>
          {hoveredStar.spectype && (
            <div style={{ fontSize: 11, opacity: 0.85 }}>
              🌈 Type: {hoveredStar.spectype}
            </div>
          )}
        </div>
      );
    }
    
    // Case 3: Only constellation is hovered - show constellation and nearby stars that form it
    if (hoveredConstellation) {
      return (
        <div>
          <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 15, letterSpacing: '0.3px' }}>
            ✨ {hoveredConstellation}
          </div>
          
          {/* Show stars that form this constellation line */}
          {nearbyStars.length > 0 && (
            <div style={{ 
              marginTop: 6, 
              marginBottom: 6,
              paddingTop: 6,
              borderTop: '1px solid rgba(150,180,255,0.2)'
            }}>
              <div style={{ fontSize: 10, opacity: 0.7, marginBottom: 4 }}>
                Stars forming this line:
              </div>
              {nearbyStars.map((star: Star, idx: number) => {
                const displayName = star.name && star.name.trim() !== '' 
                  ? star.name 
                  : `Star ${star.id || 'Unknown'}`;
                return (
                  <div key={idx} style={{ fontSize: 11, opacity: 0.9, marginBottom: 2 }}>
                    ⭐ {displayName}
                    {star.mag && (
                      <span style={{ opacity: 0.7, marginLeft: 4 }}>
                        (mag {star.mag.toFixed(1)})
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          
          <div style={{ fontSize: 11, opacity: 0.85, fontStyle: 'italic', marginTop: 4 }}>
            Click to focus on this constellation
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div style={{ position: 'fixed', width: '100vw', height: '100vh', top: 0, left: 0, zIndex: 0 }}>
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ background: 'black', display: 'block', width: '100vw', height: '100vh', cursor: selectedConstellation ? 'default' : 'crosshair' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleCanvasClick}
      />
      <div
        style={tooltipStyle}
      >
        {getTooltipContent()}
      </div>
      {selectedConstellation && (
        <button
          style={{
            position: 'fixed',
            top: 24,
            left: 24,
            zIndex: 20,
            background: 'rgba(0,0,0,0.85)',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            padding: '8px 18px',
            fontSize: 18,
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            cursor: 'pointer',
          }}
          onClick={handleShowAll}
        >
          Show All Constellations
        </button>
      )}
      {selectedConstellation && (
        <div
          style={{
            position: 'fixed',
            left: '50%',
            bottom: 32,
            transform: 'translateX(-50%)',
            width: collapsed ? 60 : 420,
            maxWidth: '90vw',
            maxHeight: collapsed ? 60 : '40vh',
            overflowY: collapsed ? 'hidden' : 'auto',
            background: 'rgba(20,20,30,0.98)',
            color: 'white',
            borderRadius: 12,
            boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
            zIndex: 30,
            padding: collapsed ? '8px' : '24px 28px',
            fontSize: 16,
            transition: 'width 0.2s, max-height 0.2s, padding 0.2s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          <button
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              background: 'rgba(0,0,0,0.5)',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              padding: '4px 10px',
              fontSize: 18,
              fontWeight: 600,
              cursor: 'pointer',
              zIndex: 31,
            }}
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Show Info' : 'Hide Info'}
          >
            {collapsed ? '🛈' : '×'}
          </button>
          {!collapsed && (
            <>
              <h2 style={{ fontSize: 24, marginBottom: 8 }}>{selectedConstellation}</h2>
              {loadingData ? (
                <div>Loading constellation data...</div>
              ) : dataError ? (
                <div style={{ color: '#ff8888', marginBottom: 12 }}>{dataError}</div>
              ) : constellationData ? (
                <div>
                  <div style={{ marginBottom: 12 }}>
                    <strong>Description:</strong> {constellationData.description || 'No data'}
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <strong>Area:</strong> {constellationData.area || 'Unknown'} sq deg
                  </div>
                  {constellationData.brightestStar && (
                    <div style={{ marginBottom: 12 }}>
                      <strong>Brightest Star:</strong> {constellationData.brightestStar}
                    </div>
                  )}
                  {constellationData.wikiUrl && (
                    <div style={{ marginBottom: 12 }}>
                      <a href={constellationData.wikiUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#aaf', textDecoration: 'underline' }}>Wikipedia</a>
                    </div>
                  )}
                </div>
              ) : (
                <div>No data available.</div>
              )}
            </>
          )}
        </div>
      )}
      
      {/* AI Search Component */}
      <AISearch
        onSelectConstellation={selectConstellationByName}
        stars={stars}
        constellationLines={constellationLines}
      />
    </div>
  );
};

export default StarMap;
