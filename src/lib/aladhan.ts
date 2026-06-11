const ALADHAN_BASE = 'https://api.aladhan.com/v1'

// Muslim World League — commonly used by Australian mosques/AFIC.
export const DEFAULT_CALC_METHOD = 3

export interface PrayerTimings {
  Fajr: string
  Sunrise: string
  Dhuhr: string
  Asr: string
  Maghrib: string
  Isha: string
}

export interface TimingsResponse {
  timings: PrayerTimings
  date: {
    hijri: {
      date: string
      day: string
      month: { number: number; en: string; ar: string }
      year: string
      weekday: { en: string; ar: string }
    }
    gregorian: {
      date: string
    }
  }
}

export async function fetchPrayerTimes(
  latitude: number,
  longitude: number,
  method: number = DEFAULT_CALC_METHOD,
): Promise<TimingsResponse> {
  const timestamp = Math.floor(Date.now() / 1000)
  const url = `${ALADHAN_BASE}/timings/${timestamp}?latitude=${latitude}&longitude=${longitude}&method=${method}`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch prayer times (${res.status})`)
  }
  const json = await res.json()
  return json.data as TimingsResponse
}

export interface QiblaResponse {
  latitude: number
  longitude: number
  direction: number
}

export async function fetchQiblaDirection(
  latitude: number,
  longitude: number,
): Promise<number> {
  const url = `${ALADHAN_BASE}/qibla/${latitude}/${longitude}`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch qibla direction (${res.status})`)
  }
  const json = await res.json()
  return (json.data as QiblaResponse).direction
}

export async function fetchHijriDate(): Promise<TimingsResponse['date']['hijri']> {
  const today = new Date()
  const dd = String(today.getDate()).padStart(2, '0')
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const yyyy = today.getFullYear()
  const url = `${ALADHAN_BASE}/gToH/${dd}-${mm}-${yyyy}`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch Hijri date (${res.status})`)
  }
  const json = await res.json()
  return json.data.hijri
}
