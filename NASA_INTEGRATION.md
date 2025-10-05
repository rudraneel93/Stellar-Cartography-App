# 🛰️ NASA SkyView Integration

## Overview

Stellar Cartography integrates **NASA SkyView Virtual Observatory** to provide real telescope images of constellations and star fields. This integration makes the project eligible for **NASA Space Apps Challenge Global Awards**.

---

## NASA Data Source

**Resource Name:** NASA SkyView Virtual Observatory  
**URL:** https://skyview.gsfc.nasa.gov/  
**Type:** Public API (No authentication required)  
**Data Provided:** Multi-wavelength astronomical sky surveys

---

## What is NASA SkyView?

NASA SkyView is a virtual observatory operated by NASA's High Energy Astrophysics Science Archive Research Center (HEASARC) at Goddard Space Flight Center. It provides access to image data from dozens of astronomical surveys covering the entire sky in multiple wavelengths—from radio to gamma rays.

### Available Surveys

1. **DSS (Digitized Sky Survey)** - Optical wavelengths
2. **2MASS** - Near-infrared all-sky survey
3. **WISE** - Wide-field Infrared Survey
4. **ROSAT** - X-ray observations
5. **GALEX** - Ultraviolet imaging

---

## Implementation in Stellar Cartography

### 1. Core Functions (`src/utils/api.ts`)

#### `getNASA_SkyViewImageURL()`
Generates URLs to fetch telescope images for any sky position.

```typescript
const imageUrl = getNASA_SkyViewImageURL(
  ra: 14.261,        // Right Ascension in hours
  dec: 19.182,       // Declination in degrees  
  size: 0.5,         // Field of view in degrees
  survey: 'DSS'      // Survey type
);
```

#### `fetchNASA_ConstellationImage()`
Fetches optimized telescope images for entire constellations.

```typescript
const data = await fetchNASA_ConstellationImage(
  'Orion',           // Constellation name
  5.5,               // Center RA
  -5.0               // Center Dec
);
```

#### `fetchNASA_StarFieldImage()`
Generates close-up telescope views around specific stars.

```typescript
const starImage = await fetchNASA_StarFieldImage(
  'Betelgeuse',      // Star name
  5.919,             // Star RA
  7.407              // Star Dec
);
```

---

### 2. UI Component (`src/components/NASASkyView.tsx`)

A dedicated modal component displays NASA telescope images with:

- **Real telescope imagery** from NASA archives
- **Survey selector** to switch between optical, infrared, X-ray views
- **Image metadata** showing position, field of view, and source
- **NASA attribution** and educational content
- **Responsive design** for all screen sizes

---

## Features Enabled by NASA Data

### 🔭 View Real Telescope Images
Users can click "View NASA Telescope Image" button on any constellation to see actual astronomical survey data.

### 📡 Multi-Wavelength Observation
Switch between different wavelengths to see how the same sky region looks in:
- Visible light (optical)
- Infrared (heat radiation from stars)
- Ultraviolet (hot young stars)
- X-rays (high-energy sources)

### 🎓 Educational Value
- Learn about different types of astronomical observations
- Understand how professional astronomers study the sky
- Compare catalog data with real telescope images

---

## Technical Details

### API Endpoint
```
https://skyview.gsfc.nasa.gov/cgi-bin/images
```

### Parameters
- `Survey`: Type of astronomical survey (DSS, 2MASS, WISE, etc.)
- `position`: Sky coordinates in degrees (RA, Dec)
- `size`: Field of view in degrees
- `Return`: Image format (GIF, FITS, JPEG)
- `scaling`: Image scaling algorithm (Linear, Log, etc.)
- `sampler`: Resampling method

### Example Request
```
https://skyview.gsfc.nasa.gov/cgi-bin/images?
Survey=DSS&
position=83.6333,-5.3911&
size=1.0&
Return=GIF&
scaling=Linear&
sampler=LI
```

---

## User Experience

### How Users Interact with NASA Data

1. **Select a Constellation**
   - Click on any constellation in the star map

2. **View Telescope Image**
   - Click "🛰️ View NASA Telescope Image" button
   - Modal opens showing real telescope data

3. **Explore Different Wavelengths**
   - Switch between DSS (optical), 2MASS (infrared), WISE surveys
   - See the same region in different wavelengths

4. **Learn More**
   - Read educational content about NASA SkyView
   - Click through to NASA's official website

---

## NASA Compliance

### ✅ Proper Attribution
- NASA SkyView credited in UI
- Direct link to https://skyview.gsfc.nasa.gov/
- Educational content about the service

### ✅ No Misrepresentation
- Clear labeling of NASA data
- No modifications to NASA images
- Accurate metadata display

### ✅ Public Access
- No authentication barriers
- Free and open data usage
- Compliant with NASA open data policy

---

## Global Awards Eligibility

This integration satisfies NASA Space Apps Challenge requirements:

> **"In order to be eligible for a Global Award, you must use NASA data or resources."**

**NASA Resource Used:**  
- Link Text: NASA SkyView Virtual Observatory
- URL: https://skyview.gsfc.nasa.gov/

**How It's Used:**
- Fetching real telescope images via public API
- Displaying multi-wavelength astronomical survey data
- Educational integration of NASA's scientific archives

---

## Future Enhancements

### Planned Features
- [ ] More survey options (NVSS radio, Fermi gamma-ray)
- [ ] Image download capability
- [ ] Side-by-side wavelength comparison
- [ ] Overlay constellation lines on NASA images
- [ ] Integration with NASA's other APIs (APOD, Exoplanet Archive)

### Additional NASA Resources to Explore
- NASA Astronomy Picture of the Day (APOD) API
- NASA Exoplanet Archive
- NASA HEASARC data archives
- NASA Earth Observatory EONET (Natural Events)

---

## Credits

**Data Source:** NASA/GSFC SkyView Virtual Observatory  
**Integration Developer:** Rudraneel  
**Project:** Stellar Cartography  
**Challenge:** NASA Space Apps Challenge 2025 - "Embiggen Your Eyes!"

---

## References

- **NASA SkyView:** https://skyview.gsfc.nasa.gov/
- **HEASARC (NASA/GSFC):** https://heasarc.gsfc.nasa.gov/
- **NASA Open Data Policy:** https://www.nasa.gov/open/
- **NASA APIs:** https://api.nasa.gov/

---

**Last Updated:** October 5, 2025  
**Status:** ✅ Production Ready - Global Awards Eligible
