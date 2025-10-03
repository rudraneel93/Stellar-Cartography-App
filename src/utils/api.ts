// Example: fetch stars, constellations, and deep sky objects from Stellarium Web API or similar
// This is a mock. Replace with real API integration as needed.

// Fetch detailed constellation data from Wikipedia and IAU
export async function fetchConstellationData(name: string) {
  // Format Wikipedia title
  const wikiTitle = name.replace(/ /g, '_') + '_(constellation)';
  const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`;
  let description = '';
  let area = 'Unknown';
  let brightestStar = 'Unknown';
  let wikiPageUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(wikiTitle)}`;
  
  console.log('Fetching constellation data for:', name);
  console.log('Wikipedia URL:', wikiUrl);
  
  try {
    const res = await fetch(wikiUrl);
    console.log('Wikipedia response status:', res.status);
    
    if (res.ok) {
      const data = await res.json();
      console.log('Wikipedia data:', data);
      description = data.extract || data.description || '';
      wikiPageUrl = data.content_urls?.desktop?.page || wikiPageUrl;
    } else {
      console.warn('Wikipedia API returned non-OK status:', res.status);
    }
  } catch (err) {
    console.error('Error fetching from Wikipedia:', err);
  }
  
  // Fallback description if Wikipedia failed
  if (!description) {
    description = `${name} is one of the 88 constellations recognized by the International Astronomical Union. It can be observed in the night sky and contains various stars and deep-sky objects.`;
  }
  // IAU constellation areas and brightest stars (static, partial list for demo)
  const IAU_CONSTELLATION_STATS: Record<string, { area: string; brightestStar: string }> = {
    Ophiuchus: { area: '948', brightestStar: 'Rasalhague (α Oph)' },
    Orion: { area: '594', brightestStar: 'Rigel (β Ori)' },
    Scorpius: { area: '497', brightestStar: 'Antares (α Sco)' },
    "Ursa Major": { area: '1280', brightestStar: 'Alioth (ε UMa)' },
    Andromeda: { area: '722', brightestStar: 'Alpheratz (α And)' },
    Cassiopeia: { area: '598', brightestStar: 'Schedar (α Cas)' },
    Lyra: { area: '286', brightestStar: 'Vega (α Lyr)' },
    Cygnus: { area: '804', brightestStar: 'Deneb (α Cyg)' },
    Leo: { area: '947', brightestStar: 'Regulus (α Leo)' },
    Taurus: { area: '797', brightestStar: 'Aldebaran (α Tau)' },
    Pisces: { area: '889', brightestStar: 'Eta Piscium (η Psc)' },
    Sagittarius: { area: '867', brightestStar: 'Kaus Australis (ε Sgr)' },
    Perseus: { area: '615', brightestStar: 'Mirfak (α Per)' },
    Hydra: { area: '1303', brightestStar: 'Alphard (α Hya)' },
    Cetus: { area: '1231', brightestStar: 'Deneb Kaitos (β Cet)' },
    Auriga: { area: '657', brightestStar: 'Capella (α Aur)' },
    "Canis Major": { area: '380', brightestStar: 'Sirius (α CMa)' },
    Virgo: { area: '1294', brightestStar: 'Spica (α Vir)' },
    Gemini: { area: '514', brightestStar: 'Pollux (β Gem)' },
    Capricornus: { area: '414', brightestStar: 'Deneb Algedi (δ Cap)' },
    Draco: { area: '1083', brightestStar: 'Eltanin (γ Dra)' },
    Pegasus: { area: '1121', brightestStar: 'Enif (ε Peg)' },
    Cancer: { area: '506', brightestStar: 'Altarf (β Cnc)' },
    Aquila: { area: '652', brightestStar: 'Altair (α Aql)' },
    "Canis Minor": { area: '183', brightestStar: 'Procyon (α CMi)' },
    Libra: { area: '538', brightestStar: 'Zubenelgenubi (α Lib)' },
    Aries: { area: '441', brightestStar: 'Hamal (α Ari)' },
    Pavo: { area: '378', brightestStar: 'Peacock (α Pav)' },
    Crux: { area: '68', brightestStar: 'Acrux (α Cru)' },
    Centaurus: { area: '1060', brightestStar: 'Alpha Centauri (α Cen)' },
    Delphinus: { area: '189', brightestStar: 'Rotanev (β Del)' },
    Vulpecula: { area: '268', brightestStar: 'Anser (α Vul)' },
    Triangulum: { area: '132', brightestStar: 'Beta Trianguli (β Tri)' },
    Tucana: { area: '295', brightestStar: 'Alpha Tucanae (α Tuc)' },
    Phoenix: { area: '469', brightestStar: 'Ankaa (α Phe)' },
    Indus: { area: '294', brightestStar: 'Alpha Indi (α Ind)' },
    Musca: { area: '138', brightestStar: 'Alpha Muscae (α Mus)' },
    Mensa: { area: '153', brightestStar: 'Alpha Mensae (α Men)' },
    Volans: { area: '141', brightestStar: 'Beta Volantis (β Vol)' },
    Norma: { area: '165', brightestStar: 'Gamma2 Normae (γ2 Nor)' },
    Octans: { area: '291', brightestStar: 'Nu Octantis (ν Oct)' },
    Apus: { area: '206', brightestStar: 'Alpha Apodis (α Aps)' },
    Chamaeleon: { area: '132', brightestStar: 'Alpha Chamaeleontis (α Cha)' },
    Circinus: { area: '93', brightestStar: 'Alpha Circini (α Cir)' },
    Caelum: { area: '125', brightestStar: 'Alpha Caeli (α Cae)' },
    Fornax: { area: '398', brightestStar: 'Alpha Fornacis (α For)' },
    Reticulum: { area: '114', brightestStar: 'Alpha Reticuli (α Ret)' },
    Pyxis: { area: '221', brightestStar: 'Alpha Pyxidis (α Pyx)' },
    Antlia: { area: '239', brightestStar: 'Alpha Antliae (α Ant)' },
    Telescopium: { area: '210', brightestStar: 'Alpha Telescopii (α Tel)' },
    Sextans: { area: '314', brightestStar: 'Alpha Sextantis (α Sex)' },
    Equuleus: { area: '72', brightestStar: 'Kitalpha (α Equ)' },
    Sagitta: { area: '80', brightestStar: 'Gamma Sagittae (γ Sge)' },
    "Corona Australis": { area: '128', brightestStar: 'Alpha Coronae Australis (α CrA)' },
    "Corona Borealis": { area: '179', brightestStar: 'Alphecca (α CrB)' },
    "Coma Berenices": { area: '386', brightestStar: 'Beta Comae Berenices (β Com)' },
    Columba: { area: '270', brightestStar: 'Phact (α Col)' },
    Lepus: { area: '290', brightestStar: 'Arneb (α Lep)' },
    Monoceros: { area: '482', brightestStar: 'Beta Monocerotis (β Mon)' },
    Lynx: { area: '545', brightestStar: 'Alpha Lyncis (α Lyn)' },
    Camelopardalis: { area: '757', brightestStar: 'Beta Camelopardalis (β Cam)' },
    Boötes: { area: '907', brightestStar: 'Arcturus (α Boo)' },
    "Canes Venatici": { area: '465', brightestStar: 'Cor Caroli (α CVn)' },
    Crater: { area: '282', brightestStar: 'Labrum (δ Crt)' },
    Corvus: { area: '184', brightestStar: 'Gienah (γ Crv)' },
    "Pisces Austrinus": { area: '245', brightestStar: 'Fomalhaut (α PsA)' },
    Puppis: { area: '673', brightestStar: 'Naos (ζ Pup)' },
    Vela: { area: '500', brightestStar: 'Suhail (λ Vel)' },
    Carina: { area: '494', brightestStar: 'Canopus (α Car)' },
    Dorado: { area: '179', brightestStar: 'Alpha Doradus (α Dor)' },
    Grus: { area: '366', brightestStar: 'Alnair (α Gru)' },
    Horologium: { area: '248', brightestStar: 'Alpha Horologii (α Hor)' },
    Hydrus: { area: '243', brightestStar: 'Beta Hydri (β Hyi)' },
    Lacerta: { area: '201', brightestStar: 'Alpha Lacertae (α Lac)' },
    Microscopium: { area: '210', brightestStar: 'Gamma Microscopii (γ Mic)' },
    Pictor: { area: '247', brightestStar: 'Alpha Pictoris (α Pic)' }
  };
  if (IAU_CONSTELLATION_STATS[name]) {
    area = IAU_CONSTELLATION_STATS[name].area;
    brightestStar = IAU_CONSTELLATION_STATS[name].brightestStar;
  }
  return {
    name,
    description,
    area,
    brightestStar,
    wikiUrl: wikiPageUrl,
  };
}
export async function fetchStarData() {
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
