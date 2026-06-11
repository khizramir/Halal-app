import { useEffect, useState } from 'react'

export interface GeoState {
  latitude: number | null
  longitude: number | null
  error: string | null
  loading: boolean
}

// Sydney as a sensible default for Australian users while permission is pending/denied.
export const DEFAULT_LOCATION = { latitude: -33.8688, longitude: 151.2093, city: 'Sydney' }

export function useGeolocation(): GeoState {
  const [state, setState] = useState<GeoState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
  })

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setState({
        latitude: DEFAULT_LOCATION.latitude,
        longitude: DEFAULT_LOCATION.longitude,
        error: 'Geolocation not supported, using Sydney as default.',
        loading: false,
      })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
        })
      },
      (err) => {
        setState({
          latitude: DEFAULT_LOCATION.latitude,
          longitude: DEFAULT_LOCATION.longitude,
          error: `${err.message} — using Sydney as default.`,
          loading: false,
        })
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }, [])

  return state
}
