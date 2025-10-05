/**
 * Natural Language Processing Engine for Astronomical Queries
 * 
 * AI Usage Disclosure (NASA Space Apps Challenge 2025):
 * - GitHub Copilot assisted with regex pattern suggestions (~30% of code)
 * - Human-designed: NLP architecture, entity types, intent classification, query logic
 * - No external AI APIs used (fully local processing)
 * 
 * @author Rudraneel
 * @created October 2025
 */

// Natural Language Processing utilities for astronomy queries

interface QueryIntent {
  action: 'show' | 'find' | 'info' | 'filter' | 'compare' | 'unknown';
  target: 'constellation' | 'star' | 'galaxy' | 'planet' | 'dso' | 'general';
  entities: string[];
  filters?: {
    month?: string;
    brightness?: string;
    location?: string;
    timeOfYear?: string;
  };
  originalQuery: string;
}

// Constellation name variations and aliases
const CONSTELLATION_ALIASES: Record<string, string[]> = {
  'Orion': ['orion', 'hunter', 'the hunter'],
  'Ursa Major': ['ursa major', 'big dipper', 'great bear', 'big bear'],
  'Ursa Minor': ['ursa minor', 'little dipper', 'little bear'],
  'Cassiopeia': ['cassiopeia', 'queen'],
  'Andromeda': ['andromeda', 'chained maiden'],
  'Leo': ['leo', 'lion'],
  'Scorpius': ['scorpius', 'scorpio', 'scorpion'],
  'Sagittarius': ['sagittarius', 'archer'],
  'Aquarius': ['aquarius', 'water bearer'],
  'Pisces': ['pisces', 'fish'],
  'Gemini': ['gemini', 'twins'],
  'Cancer': ['cancer', 'crab'],
  'Taurus': ['taurus', 'bull'],
  'Aries': ['aries', 'ram'],
  'Virgo': ['virgo', 'maiden'],
  'Libra': ['libra', 'scales'],
  'Capricornus': ['capricornus', 'capricorn', 'goat'],
  'Cygnus': ['cygnus', 'swan', 'northern cross'],
  'Lyra': ['lyra', 'lyre', 'harp'],
  'Aquila': ['aquila', 'eagle'],
  'Pegasus': ['pegasus', 'winged horse'],
  'Perseus': ['perseus', 'hero'],
  'Draco': ['draco', 'dragon'],
  'Hercules': ['hercules', 'hero'],
  'Boötes': ['bootes', 'boötes', 'herdsman'],
  'Canis Major': ['canis major', 'big dog', 'greater dog'],
  'Canis Minor': ['canis minor', 'little dog', 'lesser dog'],
};

// Month to constellation visibility mapping
const MONTHLY_CONSTELLATIONS: Record<string, string[]> = {
  january: ['Orion', 'Taurus', 'Gemini', 'Canis Major', 'Auriga', 'Perseus'],
  february: ['Orion', 'Gemini', 'Canis Major', 'Canis Minor', 'Cancer', 'Leo'],
  march: ['Leo', 'Cancer', 'Hydra', 'Virgo', 'Ursa Major', 'Boötes'],
  april: ['Leo', 'Virgo', 'Boötes', 'Corvus', 'Crater', 'Ursa Major'],
  may: ['Virgo', 'Boötes', 'Libra', 'Hercules', 'Corona Borealis', 'Ursa Major'],
  june: ['Hercules', 'Scorpius', 'Libra', 'Ophiuchus', 'Sagittarius', 'Corona Borealis'],
  july: ['Scorpius', 'Sagittarius', 'Ophiuchus', 'Hercules', 'Lyra', 'Cygnus'],
  august: ['Sagittarius', 'Aquila', 'Cygnus', 'Lyra', 'Scorpius', 'Capricornus'],
  september: ['Aquila', 'Cygnus', 'Pegasus', 'Capricornus', 'Aquarius', 'Delphinus'],
  october: ['Pegasus', 'Andromeda', 'Pisces', 'Aquarius', 'Capricornus', 'Cetus'],
  november: ['Andromeda', 'Pegasus', 'Pisces', 'Aries', 'Taurus', 'Perseus'],
  december: ['Taurus', 'Orion', 'Aries', 'Perseus', 'Andromeda', 'Eridanus'],
};

// Famous stars mapping
const FAMOUS_STARS: Record<string, { properName: string; constellation: string; magnitude: number }> = {
  sirius: { properName: 'Sirius', constellation: 'Canis Major', magnitude: -1.46 },
  canopus: { properName: 'Canopus', constellation: 'Carina', magnitude: -0.74 },
  arcturus: { properName: 'Arcturus', constellation: 'Boötes', magnitude: -0.05 },
  vega: { properName: 'Vega', constellation: 'Lyra', magnitude: 0.03 },
  capella: { properName: 'Capella', constellation: 'Auriga', magnitude: 0.08 },
  rigel: { properName: 'Rigel', constellation: 'Orion', magnitude: 0.13 },
  procyon: { properName: 'Procyon', constellation: 'Canis Minor', magnitude: 0.34 },
  betelgeuse: { properName: 'Betelgeuse', constellation: 'Orion', magnitude: 0.50 },
  altair: { properName: 'Altair', constellation: 'Aquila', magnitude: 0.77 },
  aldebaran: { properName: 'Aldebaran', constellation: 'Taurus', magnitude: 0.85 },
  spica: { properName: 'Spica', constellation: 'Virgo', magnitude: 1.04 },
  antares: { properName: 'Antares', constellation: 'Scorpius', magnitude: 1.09 },
  pollux: { properName: 'Pollux', constellation: 'Gemini', magnitude: 1.14 },
  fomalhaut: { properName: 'Fomalhaut', constellation: 'Pisces Austrinus', magnitude: 1.16 },
  deneb: { properName: 'Deneb', constellation: 'Cygnus', magnitude: 1.25 },
  regulus: { properName: 'Regulus', constellation: 'Leo', magnitude: 1.35 },
  castor: { properName: 'Castor', constellation: 'Gemini', magnitude: 1.58 },
  bellatrix: { properName: 'Bellatrix', constellation: 'Orion', magnitude: 1.64 },
  polaris: { properName: 'Polaris', constellation: 'Ursa Minor', magnitude: 1.98 },
};

/**
 * Parse natural language query into structured intent
 */
export function parseQuery(query: string): QueryIntent {
  const lowerQuery = query.toLowerCase().trim();
  
  // Determine action
  let action: QueryIntent['action'] = 'unknown';
  if (/\b(show|display|see|view|look at)\b/.test(lowerQuery)) {
    action = 'show';
  } else if (/\b(find|locate|where|search)\b/.test(lowerQuery)) {
    action = 'find';
  } else if (/\b(what|tell me|info|information|about|describe)\b/.test(lowerQuery)) {
    action = 'info';
  } else if (/\b(visible|see|observe)\b/.test(lowerQuery)) {
    action = 'filter';
  } else if (/\b(brightest|dimmest|largest|smallest|compare)\b/.test(lowerQuery)) {
    action = 'compare';
  }

  // Determine target
  let target: QueryIntent['target'] = 'general';
  if (/\b(constellation|constellations)\b/.test(lowerQuery)) {
    target = 'constellation';
  } else if (/\b(star|stars)\b/.test(lowerQuery)) {
    target = 'star';
  } else if (/\b(galaxy|galaxies)\b/.test(lowerQuery)) {
    target = 'galaxy';
  } else if (/\b(planet|planets)\b/.test(lowerQuery)) {
    target = 'planet';
  } else if (/\b(nebula|cluster|object)\b/.test(lowerQuery)) {
    target = 'dso';
  }

  // Extract entities (constellation names, star names, etc.)
  const entities: string[] = [];
  
  // Check for constellation names
  for (const [canonical, aliases] of Object.entries(CONSTELLATION_ALIASES)) {
    for (const alias of aliases) {
      if (lowerQuery.includes(alias)) {
        entities.push(canonical);
        if (target === 'general') target = 'constellation';
        break;
      }
    }
  }

  // Check for star names
  for (const [key, star] of Object.entries(FAMOUS_STARS)) {
    if (lowerQuery.includes(key)) {
      entities.push(star.properName);
      if (target === 'general') target = 'star';
    }
  }

  // Extract filters
  const filters: QueryIntent['filters'] = {};
  
  // Month detection
  const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  for (const month of months) {
    if (lowerQuery.includes(month)) {
      filters.month = month;
      if (target === 'general') target = 'constellation';
      break;
    }
  }

  // Brightness detection
  if (/\bbrightest\b/.test(lowerQuery)) {
    filters.brightness = 'brightest';
  } else if (/\bdimmest\b/.test(lowerQuery)) {
    filters.brightness = 'dimmest';
  }

  // Time of year
  if (/\b(winter|summer|spring|fall|autumn)\b/.test(lowerQuery)) {
    const match = lowerQuery.match(/\b(winter|summer|spring|fall|autumn)\b/);
    if (match) filters.timeOfYear = match[1];
  }

  return {
    action,
    target,
    entities,
    filters,
    originalQuery: query,
  };
}

/**
 * Process query and return results with explanations
 */
export function processQuery(
  intent: QueryIntent,
  _stars: any[],
  _constellationLines: any[]
): {
  result: string;
  action?: 'selectConstellation' | 'highlightStar' | 'showInfo';
  data?: any;
} {
  const { action, target, entities, filters } = intent;

  // Handle month-based queries
  if (filters?.month && target === 'constellation') {
    const visibleConstellations = MONTHLY_CONSTELLATIONS[filters.month] || [];
    if (visibleConstellations.length > 0) {
      return {
        result: `Constellations visible in ${filters.month.charAt(0).toUpperCase() + filters.month.slice(1)}: ${visibleConstellations.join(', ')}. Click on any constellation to explore it!`,
        action: 'showInfo',
        data: { constellations: visibleConstellations },
      };
    }
  }

  // Handle constellation-specific queries
  if (entities.length > 0 && target === 'constellation') {
    const constellation = entities[0];
    if (action === 'show' || action === 'find') {
      return {
        result: `Showing ${constellation} constellation.`,
        action: 'selectConstellation',
        data: { constellation },
      };
    } else if (action === 'info') {
      return {
        result: `${constellation} is a constellation. Click on it to see detailed information including its area, brightest stars, and Wikipedia description.`,
        action: 'selectConstellation',
        data: { constellation },
      };
    }
  }

  // Handle star queries
  if (entities.length > 0 && target === 'star') {
    const starName = entities[0].toLowerCase();
    const starInfo = FAMOUS_STARS[starName];
    if (starInfo) {
      if (action === 'info' || action === 'find') {
        return {
          result: `${starInfo.properName} is in the ${starInfo.constellation} constellation. Magnitude: ${starInfo.magnitude}. It's one of the brightest stars in the night sky!`,
          action: 'selectConstellation',
          data: { constellation: starInfo.constellation, star: starInfo.properName },
        };
      }
    }
  }

  // Handle "brightest star in constellation" queries
  if (filters?.brightness === 'brightest' && entities.length > 0) {
    const constellation = entities[0];
    // Find brightest star in that constellation
    const starsInConstellation = Object.values(FAMOUS_STARS).filter(
      s => s.constellation === constellation
    );
    if (starsInConstellation.length > 0) {
      const brightest = starsInConstellation.reduce((prev, curr) =>
        curr.magnitude < prev.magnitude ? curr : prev
      );
      return {
        result: `The brightest star in ${constellation} is ${brightest.properName} with a magnitude of ${brightest.magnitude}.`,
        action: 'selectConstellation',
        data: { constellation, star: brightest.properName },
      };
    }
  }

  // Handle galaxies and DSOs
  if (target === 'galaxy' || target === 'dso') {
    const dsoInfo = [
      'The Andromeda Galaxy (M31) is in the Andromeda constellation.',
      'The Orion Nebula (M42) is in the Orion constellation.',
      'The Pleiades star cluster (M45) is in the Taurus constellation.',
    ];
    return {
      result: `Deep sky objects include: ${dsoInfo.join(' ')} Use the search to find specific objects!`,
      action: 'showInfo',
      data: {},
    };
  }

  // Default response
  return {
    result: `I can help you explore the night sky! Try asking:\n- "Show me Orion"\n- "What constellations are visible in December?"\n- "What's the brightest star in Leo?"\n- "Find the Big Dipper"`,
    action: 'showInfo',
    data: {},
  };
}

/**
 * Get AI-powered response using local NLP processing
 */
export async function getAIResponse(query: string, stars: any[], constellationLines: any[]): Promise<{
  result: string;
  action?: 'selectConstellation' | 'highlightStar' | 'showInfo';
  data?: any;
}> {
  // Use local NLP processing
  const intent = parseQuery(query);
  const localResult = processQuery(intent, stars, constellationLines);
  
  return localResult;
}
