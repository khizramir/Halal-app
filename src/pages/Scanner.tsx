import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/browser'
import { fetchProductByBarcode, type FoodProduct } from '../lib/foodfacts'
import { extractENumbers, type ENumberInfo } from '../data/eNumbers'

const STATUS_STYLES: Record<ENumberInfo['status'], string> = {
  halal: 'bg-emerald/10 text-emerald',
  haram: 'bg-red-100 text-red-700',
  mushbooh: 'bg-amber-100 text-amber-700',
}

const AFIC_SEARCH_URL = 'https://halal.afic.com.au/'

interface LocalProduct {
  barcode: string
  name: string
  brand: string | null
  certifier: string | null
  status: ENumberInfo['status']
  notes: string | null
}

export default function Scanner() {
  const [barcode, setBarcode] = useState('')
  const [product, setProduct] = useState<FoodProduct | null>(null)
  const [localProduct, setLocalProduct] = useState<LocalProduct | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [cameraPermission, setCameraPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown')
  const videoRef = useRef<HTMLVideoElement>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)

  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'camera' as PermissionName }).then((result) => {
        if (result.state === 'granted') setCameraPermission('granted')
        else if (result.state === 'denied') setCameraPermission('denied')
        result.onchange = () => {
          if (result.state === 'granted') setCameraPermission('granted')
          else if (result.state === 'denied') setCameraPermission('denied')
        }
      }).catch(() => {})
    }
    return () => { stopScan() }
  }, [])

  const lookup = async (code: string) => {
    setLoading(true)
    setError(null)
    setProduct(null)
    setLocalProduct(null)
    fetch(`/api/products/${encodeURIComponent(code)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setLocalProduct(data))
      .catch(() => {})
    try {
      const result = await fetchProductByBarcode(code)
      if (!result) {
        setError('Product not found in Open Food Facts.')
      } else {
        setProduct(result)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lookup failed.')
    } finally {
      setLoading(false)
    }
  }

  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      stream.getTracks().forEach((track) => track.stop())
      setCameraPermission('granted')
      return true
    } catch {
      setCameraPermission('denied')
      setError('Camera access denied. Please use manual barcode entry below.')
      return false
    }
  }

  const startScan = async () => {
    if (cameraPermission !== 'granted') {
      const granted = await requestCameraPermission()
      if (!granted) return
    }
    if (!videoRef.current) return
    try {
      setError(null)
      setScanning(true)
      const hints = new Map()
      const reader = new BrowserMultiFormatReader(hints)
      readerRef.current = reader
      await reader.decodeFromConstraints(
        { video: { facingMode: 'environment' } },
        videoRef.current,
        (result, err) => {
          if (result) {
            const code = result.getText()
            stopScan()
            setBarcode(code)
            lookup(code)
          }
          if (err && !(err instanceof NotFoundException)) {
            console.error('Barcode scan error:', err)
          }
        }
      )
    } catch (err) {
      setScanning(false)
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setCameraPermission('denied')
        setError('Camera access denied. Please use manual barcode entry below.')
      } else {
        setError(err instanceof Error ? err.message : 'Camera failed to start.')
      }
    }
  }

  const stopScan = () => {
    if (readerRef.current) {
      try { readerRef.current.reset() } catch { }
      readerRef.current = null
    }
    setScanning(false)
  }

  const eNumbers = product ? extractENumbers(product.ingredientsText) : []
  const hasHaram = eNumbers.some((e) => e.status === 'haram')
  const hasMushbooh = eNumbers.some((e) => e.status === 'mushbooh')

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-emerald-deep">Halal Product Scanner</h2>

      <div className="rounded-xl bg-white p-3 shadow space-y-3">
        <div className="relative bg-black rounded-lg overflow-hidden" style={{ minHeight: scanning ? 200 : 0 }}>
          <video
            ref={videoRef}
            playsinline={true}
            muted
            style={{ width: '100%' }}
            className={scanning ? 'block' : 'hidden'}
          />
        </div>

        {cameraPermission === 'denied' && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3">
            <p className="text-sm text-red-700">
              Camera access denied. Please use manual barcode entry below.
            </p>
          </div>
        )}

        <div className="flex gap-2">
          {!scanning ? (
            <button
              onClick={startScan}
              className="flex-1 rounded-lg bg-emerald-600 py-2 px-4 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Try Camera
            </button>
          ) : (
            <button
              onClick={stopScan}
              className="flex-1 rounded-lg bg-gray-200 py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-300"
            >
              Stop Camera
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2 rounded-xl bg-white p-3 shadow">
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            placeholder="Enter barcode manually..."
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && barcode && lookup(barcode)}
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
          <button
            onClick={() => barcode && lookup(barcode)}
            disabled={loading || !barcode}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? 'Looking up...' : 'Search'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700 shadow">{error}</div>
      )}

      {localProduct && (
        <div className={`rounded-xl p-3 shadow ${STATUS_STYLES[localProduct.status]}`}>
          <p className="font-semibold">{localProduct.name}</p>
          {localProduct.brand && <p className="text-xs">{localProduct.brand}</p>}
          <p className="mt-1 text-xs capitalize">Status: {localProduct.status}</p>
          {localProduct.certifier && (
            <p className="text-xs">Certified by: {localProduct.certifier}</p>
          )}
          {localProduct.notes && <p className="text-xs italic">{localProduct.notes}</p>}
        </div>
      )}

      {product && (
        <div className="space-y-3">
          <div className="rounded-xl bg-white p-3 shadow">
            <p className="font-semibold">{product.productName}</p>
            {product.brands && <p className="text-xs text-gray-500">{product.brands}</p>}
          </div>

          {eNumbers.length > 0 && (
            <div className="rounded-xl bg-white p-3 shadow space-y-2">
              <h3 className="font-semibold text-sm">
                E-Numbers Found
                {hasHaram && (
                  <span className="ml-2 text-xs font-normal text-red-600">Contains Haram</span>
                )}
                {!hasHaram && hasMushbooh && (
                  <span className="ml-2 text-xs font-normal text-amber-600">Contains Mushbooh</span>
                )}
              </h3>
              {eNumbers.map((e) => (
                <div key={e.code} className={`rounded-lg p-2 text-xs ${STATUS_STYLES[e.status]}`}>
                  <p className="font-semibold">{e.code} - {e.name}</p>
                  <p className="capitalize">{e.status}</p>
                  {e.description && <p className="mt-0.5 opacity-80">{e.description}</p>}
                </div>
              ))}
            </div>
          )}

          {eNumbers.length === 0 && (
            <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 shadow">
              No concerning E-numbers detected.
            </div>
          )}

          <a
            href={AFIC_SEARCH_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl bg-white p-3 text-center text-sm text-emerald-600 shadow hover:underline"
          >
            Check AFIC Halal Certification
          </a>
        </div>
      )}
    </div>
  )
}
