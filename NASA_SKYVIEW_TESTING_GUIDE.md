# 🛰️ NASA SkyView Testing Guide

## How to Test NASA SkyView Integration

### Step-by-Step Testing:

1. **Start the App** (Already running at http://localhost:5173/)

2. **Click on a Constellation**
   - Click on any constellation line (e.g., Orion, Ursa Major, Leo)
   - The constellation info panel will appear at the bottom

3. **Click "🛰️ View NASA Telescope Image" Button**
   - The NASA SkyView modal will open
   - You should see a loading spinner initially

4. **Test Different Surveys**
   The dropdown now includes these working surveys:
   - **DSS (Digitized Sky Survey)** - Optical (visible light) ✅ Works reliably
   - **2mass-j** - Near-Infrared (J-band, 1.25 μm) ✅ Should work
   - **2mass-k** - Near-Infrared (K-band, 2.17 μm) ✅ Should work
   - **wise 3.4** - Mid-Infrared (W1, 3.4 μm) ⚠️ May have limited coverage
   - **wise 4.6** - Mid-Infrared (W2, 4.6 μm) ⚠️ May have limited coverage

5. **What to Expect**
   - **DSS**: Should always load (optical survey covers entire sky)
   - **2MASS**: Should load for most constellations (all-sky infrared survey)
   - **WISE**: May not load for all positions (limited coverage in some areas)

### Debugging Information:

Open your browser's Developer Console (F12) to see:
- `🛰️ NASA SkyView URL:` - The actual URL being requested
- `Loading NASA SkyView:` - Which constellation and survey
- `✅ Image loaded successfully:` - When image loads correctly
- `Image load error:` - If image fails to load

### Example URLs Generated:

**DSS (Optical):**
```
https://skyview.gsfc.nasa.gov/cgi-bin/images?Survey=DSS&position=83.8230,-5.3910&size=1.5&Return=JPEG&scaling=Log&sampler=LI&pixels=600&grid=J2000
```

**2MASS J-band (Near-Infrared):**
```
https://skyview.gsfc.nasa.gov/cgi-bin/images?Survey=2mass-j&position=83.8230,-5.3910&size=1.5&Return=JPEG&scaling=Log&sampler=LI&pixels=600&grid=J2000
```

**WISE 3.4 μm (Mid-Infrared):**
```
https://skyview.gsfc.nasa.gov/cgi-bin/images?Survey=wise+3.4&position=83.8230,-5.3910&size=1.5&Return=JPEG&scaling=Log&sampler=LI&pixels=600&grid=J2000
```

### Troubleshooting:

#### If 2MASS images aren't loading:

1. **Check Browser Console** - Look for the actual URL being requested
2. **Test URL Directly** - Copy the URL from console and paste into browser
3. **Verify Survey Code** - NASA might use different codes: try `2MASS-J`, `2mass-j`, or `2MASS J`

#### If WISE images aren't loading:

- WISE has **limited sky coverage** - not all positions were surveyed
- Try a different constellation (Orion, Cygnus, or Sagittarius usually work well)
- Error message will say: "NASA SkyView may not have coverage for this position in this wavelength"

#### Common Issues:

1. **Image shows but is black/dark** - This is normal for infrared! Infrared shows heat, not visible light
2. **Loading takes time** - NASA servers can be slow (10-30 seconds sometimes)
3. **Some surveys fail** - Not all surveys cover all sky positions

### What Makes Images Different:

- **DSS (Optical)**: Shows stars as you'd see them with your eyes
- **2MASS (Near-Infrared)**: Shows cooler stars and dust clouds (often looks reddish)
- **WISE (Mid-Infrared)**: Shows very cool objects and warm dust (often looks different from optical)

### Expected Behavior:

✅ **Working:**
- Modal opens when button is clicked
- Loading spinner appears
- Image loads for DSS survey
- Dropdown allows survey selection
- Console logs show URLs being requested

⚠️ **May Not Work:**
- Some constellations might not have WISE coverage
- Infrared images might appear darker or different colors
- Loading might take 10-30 seconds

### For NASA Space Apps Submission:

You can use these screenshots/descriptions:
1. **DSS Optical Image** - Shows the constellation in visible light
2. **2MASS Infrared Image** - Shows the same region in infrared (emphasizes cooler stars)
3. **Comparison** - Shows how different wavelengths reveal different features

### NASA Data Source Documentation:

**Link Text:** NASA SkyView Virtual Observatory  
**URL:** https://skyview.gsfc.nasa.gov/

**What it provides:**
- Access to 100+ astronomical sky surveys
- Multiple wavelengths (Optical, IR, UV, X-ray, Radio)
- Entire sky coverage (depending on survey)
- Free public access, no authentication required

---

## Quick Test Checklist:

- [ ] App loads at http://localhost:5173/
- [ ] Can click on a constellation
- [ ] Constellation info panel appears
- [ ] "🛰️ View NASA Telescope Image" button exists
- [ ] Clicking button opens NASA SkyView modal
- [ ] DSS survey image loads successfully
- [ ] Can change surveys using dropdown
- [ ] 2MASS survey loads (or shows appropriate error)
- [ ] Console shows debug URLs
- [ ] Modal can be closed with X button

---

**Status:** ✅ NASA SkyView integration is COMPLETE and ready for testing!

Your project now uses NASA data and is **eligible for NASA Space Apps Global Awards**! 🏆
