import { useEffect, useRef, useState } from 'react'
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
  const [cameraSupported, setCameraSupported] = useState(false)
  const [scanning, setScanning] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    setCameraSupported('BarcodeDetector' in window)
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

  const startScan = async () => {
    if (!cameraSupported) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setScanning(true)

      type BarcodeDetectorCtor = new (options: { formats: string[] }) => {
        detect: (source: HTMLVideoElement) => Promise<{ rawValue: string }[]>
      }
      const Detector = (window as unknown as { BarcodeDetector: BarcodeDetectorCtor }).BarcodeDetector
      const detector = new Detector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] })

      const tick = async () => {
        if (!videoRef.current || !streamRef.current) return
        try {
          const codes = await detector.detect(videoRef.current)
          if (codes.length > 0) {
            stopScan()
            setBarcode(codes[0].rawValue)
            await lookup(codes[0].rawValue)
            return
          }
        } catch {
          // ignore detection errors and keep trying
        }
        if (streamRef.current) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Camera access failed.')
    }
  }

  const stopScan = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setScanning(false)
  }

  useEffect(() => () => stopScan(), [])

  const eNumbers = product ? extractENumbers(product.ingredientsText) : []
  const hasHaram = eNumbers.some((e) => e.status === 'haram')
  const hasMushbooh = eNumbers.some((e) => e.status === 'mushbooh')

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-emerald-deep">Halal Product Scanner</h2>

      <div className="space-y-2 rounded-xl bg-white p-3 shadow">
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            placeholder="Enter barcode number"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
          <button
            onClick={() => lookup(barcode)}
            disabled={!barcode || loading}
            className="rounded-lg bg-emerald-deep px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Look up
          </button>
        </div>

        {cameraSupported && (
          <button
            onClick={scanning ? stopScan : startScan}
            className="w-full rounded-lg border border-emerald py-2 text-sm font-medium text-emerald"
          >
            {scanning ? 'Stop camera' : '📷 Scan with camera'}
          </button>
        )}
        {!cameraSupported && (
          <p className="text-xs text-gray-400">
            Camera barcode scanning isn't supported in this browser — enter the barcode manually.
          </p>
        )}

        {scanning && (
          <video ref={videoRef} className="w-full rounded-lg" muted playsInline />
        )}
      </div>

      {loading && <p className="text-gray-500">Looking up product…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {localProduct && (
        <div className={`rounded-xl p-4 shadow ${STATUS_STYLES[localProduct.status]}`}>
          <p className="font-semibold">
            {localProduct.name}
            {localProduct.brand ? ` — ${localProduct.brand}` : ''}
          </p>
          <p className="text-sm">
            Status: <span className="font-medium uppercase">{localProduct.status}</span>
            {localProduct.certifier ? ` · ${localProduct.certifier}` : ''}
          </p>
          {localProduct.notes && <p className="mt-1 text-xs opacity-90">{localProduct.notes}</p>}
        </div>
      )}

      {product && (
        <div className="space-y-3 rounded-xl bg-white p-4 shadow">
          <div className="flex items-center gap-3">
            {product.imageUrl && (
              <img src={product.imageUrl} alt="" className="h-16 w-16 rounded object-cover" />
            )}
            <div>
              <h3 className="font-semibold text-emerald-deep">{product.productName}</h3>
              {product.brands && <p className="text-sm text-gray-500">{product.brands}</p>}
            </div>
          </div>

          {hasHaram && (
            <p className="rounded-lg bg-red-50 p-2 text-sm font-medium text-red-700">
              ⚠️ Contains additives commonly considered haram. Check certification before consuming.
            </p>
          )}
          {!hasHaram && hasMushbooh && (
            <p className="rounded-lg bg-amber-50 p-2 text-sm font-medium text-amber-700">
              ❓ Contains additives of doubtful (mushbooh) status — source verification recommended.
            </p>
          )}
          {!hasHaram && !hasMushbooh && eNumbers.length === 0 && (
            <p className="rounded-lg bg-emerald/10 p-2 text-sm font-medium text-emerald">
              No flagged additives detected from ingredient list.
            </p>
          )}

          {eNumbers.length > 0 && (
            <div className="space-y-2">
              {eNumbers.map((e) => (
                <div key={e.code} className={`rounded-lg p-2 text-sm ${STATUS_STYLES[e.status]}`}>
                  <span className="font-semibold">{e.code} — {e.name}</span>
                  <p className="text-xs opacity-90">{e.note}</p>
                </div>
              ))}
            </div>
          )}

          {product.ingredientsText && (
            <details className="text-sm text-gray-600">
              <summary className="cursor-pointer text-emerald-deep">Full ingredients</summary>
              <p className="mt-1">{product.ingredientsText}</p>
            </details>
          )}

          <a
            href={AFIC_SEARCH_URL}
            target="_blank"
            rel="noreferrer"
            className="block text-center text-sm text-emerald underline"
          >
            Check AFIC halal certification directory →
          </a>
        </div>
      )}
    </div>
  )
}
