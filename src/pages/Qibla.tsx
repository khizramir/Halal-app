import { useEffect, useState } from 'react'
import { fetchQiblaDirection } from '../lib/aladhan'
import { useGeolocation } from '../lib/useGeolocation'

export default function Qibla() {
  const { latitude, longitude, error: geoError, loading: geoLoading } = useGeolocation()
  const [qiblaBearing, setQiblaBearing] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [heading, setHeading] = useState<number | null>(null)
  const [permissionNeeded, setPermissionNeeded] = useState(false)

  useEffect(() => {
    if (latitude == null || longitude == null) return
    fetchQiblaDirection(latitude, longitude)
      .then(setQiblaBearing)
      .catch((err) => setError(err.message))
  }, [latitude, longitude])

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      const webkitEvent = event as DeviceOrientationEvent & { webkitCompassHeading?: number }
      if (typeof webkitEvent.webkitCompassHeading === 'number') {
        setHeading(webkitEvent.webkitCompassHeading)
      } else if (event.alpha != null) {
        setHeading(360 - event.alpha)
      }
    }

    type DeviceOrientationEventWithPermission = typeof DeviceOrientationEvent & {
      requestPermission?: () => Promise<'granted' | 'denied'>
    }
    const DOE = DeviceOrientationEvent as DeviceOrientationEventWithPermission

    if (typeof DOE?.requestPermission === 'function') {
      setPermissionNeeded(true)
      return
    }

    window.addEventListener('deviceorientationabsolute', handleOrientation, true)
    window.addEventListener('deviceorientation', handleOrientation, true)
    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation, true)
      window.removeEventListener('deviceorientation', handleOrientation, true)
    }
  }, [])

  const requestCompassPermission = async () => {
    type DeviceOrientationEventWithPermission = typeof DeviceOrientationEvent & {
      requestPermission?: () => Promise<'granted' | 'denied'>
    }
    const DOE = DeviceOrientationEvent as DeviceOrientationEventWithPermission
    if (typeof DOE?.requestPermission !== 'function') return

    const result = await DOE.requestPermission()
    if (result === 'granted') {
      setPermissionNeeded(false)
      window.addEventListener(
        'deviceorientation',
        (event) => {
          if (event.alpha != null) setHeading(360 - event.alpha)
        },
        true,
      )
    }
  }

  const rotation =
    qiblaBearing != null ? qiblaBearing - (heading ?? 0) : null

  return (
    <div className="space-y-4 text-center">
      <h2 className="text-xl font-semibold text-emerald-deep">Qibla Compass</h2>

      {geoLoading && <p className="text-gray-500">Getting your location…</p>}
      {geoError && <p className="text-sm text-amber-600">{geoError}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {permissionNeeded && (
        <button
          onClick={requestCompassPermission}
          className="w-full rounded-lg border border-emerald bg-white py-2 text-emerald font-medium"
        >
          Enable compass
        </button>
      )}

      {heading == null && !permissionNeeded && (
        <p className="text-sm text-gray-500">
          Move your phone to calibrate the compass. On desktop, the arrow points to Qibla
          relative to North.
        </p>
      )}

      <div className="relative mx-auto flex h-64 w-64 items-center justify-center rounded-full border-4 border-emerald-deep bg-white shadow">
        <span className="absolute top-2 text-xs font-semibold text-gray-400">N</span>
        <span className="absolute bottom-2 text-xs font-semibold text-gray-400">S</span>
        <span className="absolute left-2 text-xs font-semibold text-gray-400">W</span>
        <span className="absolute right-2 text-xs font-semibold text-gray-400">E</span>
        <div
          className="absolute h-28 w-2 origin-bottom rounded-full bg-gold transition-transform duration-300"
          style={{
            transform: `rotate(${rotation ?? qiblaBearing ?? 0}deg) translateY(-50%)`,
            bottom: '50%',
          }}
        />
        <div className="text-2xl">🕋</div>
      </div>

      {qiblaBearing != null && (
        <p className="text-gray-600">
          Qibla is <span className="font-semibold text-emerald-deep">{qiblaBearing.toFixed(1)}°</span>{' '}
          from true North
          {heading != null && (
            <>
              , device heading <span className="font-mono">{heading.toFixed(0)}°</span>
            </>
          )}
        </p>
      )}
    </div>
  )
}
