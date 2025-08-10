// Utility to get geolocation as a Promise
export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
    } else {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    }
  });
}

// Convert lat/lon to local sidereal time (approximate)
export function getSiderealTime(date: Date, lon: number) {
  // Greenwich Mean Sidereal Time at 0h UT
  const JD = (date.getTime() / 86400000) + 2440587.5;
  const D = JD - 2451545.0;
  const GMST = 18.697374558 + 24.06570982441908 * D;
  let LMST = (GMST + lon / 15) % 24;
  if (LMST < 0) LMST += 24;
  return LMST;
}
