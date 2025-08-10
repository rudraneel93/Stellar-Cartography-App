// Example: fetch stars, constellations, and deep sky objects from Stellarium Web API or similar
// This is a mock. Replace with real API integration as needed.

export async function fetchStarData(lat: number, lon: number, time: Date) {
  // TODO: Replace with real API call. This is a mock response.
  // For demo, return a few stars, lines, and DSOs
  return {
    stars: [
      { ra: 14.261, dec: 19.182, mag: 0.03, name: 'Arcturus' },
      { ra: 13.419, dec: -11.161, mag: 1.06, name: 'Spica' },
      { ra: 16.490, dec: -26.432, mag: -0.05, name: 'Antares' },
      { ra: 18.615, dec: 38.783, mag: 0.03, name: 'Vega' },
      { ra: 5.242, dec: -8.201, mag: 0.18, name: 'Rigel' },
    ],
    constellations: [
      { from: [14.261, 19.182], to: [13.419, -11.161] },
      { from: [13.419, -11.161], to: [16.490, -26.432] },
    ],
    dsos: [
      { ra: 13.158, dec: -49.312, type: 'galaxy', name: 'Centaurus A' },
      { ra: 17.761, dec: -29.007, type: 'nebula', name: 'Lagoon Nebula' },
    ],
  };
}
