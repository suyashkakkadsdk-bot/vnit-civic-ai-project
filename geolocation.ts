import { LocationData } from '../types/api';

export interface GeolocationResult {
  success: boolean;
  location?: LocationData;
  error?: string;
  errorCode?: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'NOT_SUPPORTED';
}

/**
 * Generates an alphanumeric Geohash code for spatial indexing
 */
export function generateGeohash(lat: number, lng: number): string {
  const base32 = '0123456789bcdefghjkmnpqrstuvwxyz';
  let latMin = -90, latMax = 90;
  let lonMin = -180, lonMax = 180;
  let geohash = '';
  let isEven = true;
  let bit = 0;
  let ch = 0;

  while (geohash.length < 8) {
    if (isEven) {
      const mid = (lonMin + lonMax) / 2;
      if (lng >= mid) {
        ch |= (1 << (4 - bit));
        lonMin = mid;
      } else {
        lonMax = mid;
      }
    } else {
      const mid = (latMin + latMax) / 2;
      if (lat >= mid) {
        ch |= (1 << (4 - bit));
        latMin = mid;
      } else {
        latMax = mid;
      }
    }
    isEven = !isEven;
    if (bit < 4) {
      bit++;
    } else {
      geohash += base32[ch];
      bit = 0;
      ch = 0;
    }
  }
  return geohash.toUpperCase();
}

/**
 * Performs real reverse geocoding via OpenStreetMap Nominatim with timeout.
 * If unavailable, returns "GPS location captured" with no fake address data.
 */
async function fetchReverseGeocode(lat: number, lng: number): Promise<{
  address: string;
  city?: string;
  ward?: string;
  postalCode?: string;
}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'NagarMitra-App/1.0',
        },
      }
    );

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.address) {
        const addr = data.address;
        const road = addr.road || addr.pedestrian || addr.street || addr.footway || addr.path;
        const suburb = addr.suburb || addr.neighbourhood || addr.city_district || addr.quarter;
        const city = addr.city || addr.town || addr.municipality || addr.village || addr.county || addr.state;
        const postalCode = addr.postcode;

        const parts: string[] = [];
        if (road) parts.push(road);
        if (suburb && suburb !== road) parts.push(suburb);
        if (city && city !== suburb && city !== road) parts.push(city);

        const formattedAddress = parts.length > 0 ? parts.join(', ') : (data.display_name ? data.display_name.split(',').slice(0, 3).join(',') : 'GPS location captured');

        return {
          address: formattedAddress || 'GPS location captured',
          city: city || undefined,
          ward: suburb || undefined,
          postalCode: postalCode || undefined,
        };
      }
    }
  } catch {
    // Reverse geocoding failed or timed out — return clean fallback without fake values
  }

  return {
    address: 'GPS location captured',
  };
}

/**
 * Gets real current browser GPS coordinates with high accuracy.
 * Never falls back to hardcoded mock coordinates.
 */
export async function getCurrentLocation(): Promise<GeolocationResult> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    return {
      success: false,
      error: 'Geolocation is not supported by your browser.',
      errorCode: 'NOT_SUPPORTED',
    };
  }

  return new Promise((resolve) => {
    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = Math.round(position.coords.accuracy || 0);
        const altitude = position.coords.altitude !== null ? Number(position.coords.altitude.toFixed(1)) : undefined;
        const altitudeAccuracy = position.coords.altitudeAccuracy !== null ? Number(position.coords.altitudeAccuracy.toFixed(1)) : undefined;
        const heading = position.coords.heading !== null ? Number(position.coords.heading.toFixed(1)) : undefined;
        const speed = position.coords.speed !== null ? Number(position.coords.speed.toFixed(1)) : undefined;

        const geohash = generateGeohash(lat, lng);
        const geoInfo = await fetchReverseGeocode(lat, lng);

        const locationData: LocationData = {
          latitude: Number(lat.toFixed(6)),
          longitude: Number(lng.toFixed(6)),
          accuracy,
          altitude,
          altitudeAccuracy,
          heading,
          speed,
          address: geoInfo.address,
          city: geoInfo.city,
          ward: geoInfo.ward,
          postalCode: geoInfo.postalCode,
          geohash,
          capturedAt: new Date().toISOString(),
          sensorType: 'Hardware GPS / GNSS Sensor (WGS84)',
        };

        resolve({
          success: true,
          location: locationData,
        });
      },
      (error) => {
        let friendlyMessage = 'Unable to retrieve your real GPS location.';
        let code: GeolocationResult['errorCode'] = 'POSITION_UNAVAILABLE';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            friendlyMessage = 'Location access was denied. Please allow location permissions in your browser to capture real coordinates.';
            code = 'PERMISSION_DENIED';
            break;
          case error.POSITION_UNAVAILABLE:
            friendlyMessage = 'Real GPS location is currently unavailable. Please verify device location services are enabled.';
            code = 'POSITION_UNAVAILABLE';
            break;
          case error.TIMEOUT:
            friendlyMessage = 'Location request timed out. Please click "Use My Current Location" again to retry.';
            code = 'TIMEOUT';
            break;
          default:
            friendlyMessage = error.message || 'An error occurred while requesting device GPS coordinates.';
            break;
        }

        resolve({
          success: false,
          error: friendlyMessage,
          errorCode: code,
        });
      },
      options
    );
  });
}

/**
 * Calculate distance between two coordinates in meters (Haversine formula)
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}
