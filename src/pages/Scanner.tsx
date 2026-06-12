import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/browser'
import { fetchProductByBarcode, type FoodProduct } from '../lib/foodfacts'
import { extractENumbers, type ENumberInfo } from '../data/eNumbers'

const STATUS_STYLES: Record<ENumberInfo['status'], string> = {
  halal: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
  haram: 'bg-red-100 text-red-800 border border-red-300',
  mushbooh: 'bg-amber-100 text-amber-800 border border-amber-300',
}

const STATUS_LABELS: Record<ENumberInfo['status'], string> = {
  halal: 'Halal',
  haram: 'Haram',
  mushbooh: 'Mushbooh (Uncertain)',
}

function deriveHalalStatus(eNumbers: ENumberInfo[]) {
  if (eNumbers.some((e) => e.status === 'haram')) {
    return { label: STATUS_LABELS.haram, style: STATUS_STYLES.haram, verdict: 'haram' as const }
  }
  if (eNumbers.some((e) => e.status === 'mushbooh')) {
    return { label: STATUS_LABELS.mushbooh, style: STATUS_STYLES.mushbooh, verdict: 'mushbooh' as const }
  }
  if (eNumbers.length > 0) {
    return { label: STATUS_LABELS.halal, style: STATUS_STYLES.halal, verdict: 'halal' as const }
  }
  return { label: 'No E-numbers detected - verify manually', style: 'bg-gray-100 text-gray-700 border border-gray-300', verdict: 'halal' as const }
}

const isMobile = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

export default function Scanner() {
  const [manualBarcode, setManualBarcode] = useState('')
  const [product, setProduct] = useState<FoodProduct | null>(null)
  const [eNumbers, setENumbers] = useState<ENumberInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [mobile] = useState(isMobile)

  const videoRef = useRef<HTMLVideoElement>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => { stopCamera() }
  }, [])

  function stopCamera() {
    try { BrowserMultiFormatReader.releaseAllStreams() } catch (_) {}
    readerRef.current = null
    setCameraActive(false)
  }

  async function lookupBarcode(barcode: string) {
    const cleaned = barcode.trim()
    if (!cleaned) return
    setLoading(true)
    setError(null)
    setProduct(null)
    setENumbers([])
    try {
      const result = await fetchProductByBarcode(cleaned)
      if (!result) {
        setError('No product found for barcode: ' + cleaned)
      } else {
        setProduct(result)
        setENumbers(extractENumbers(result.ingredientsText))
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Lookup failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleImageCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    setError(null)
    setProduct(null)
    setENumbers([])
    try {
      const reader = new BrowserMultiFormatReader()
      const imgUrl = URL.createObjectURL(file)
      const img = new Image()
      img.src = imgUrl
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('Failed to load image'))
      })
      const result = await reader.decodeFromImageElement(img)
      URL.revokeObjectURL(imgUrl)
      await lookupBarcode(result.getText())
    } catch (e: unknown) {
      if (e instanceof NotFoundException) {
        setError('No barcode found in photo. Try better lighting or angle.')
      } else {
        setError(e instanceof Error ? e.message : 'Failed to decode image')
      }
      setLoading(false)
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function startCamera() {
    setCameraActive(true)
    setError(null)
    setProduct(null)
    setENumbers([])
    try {
      const reader = new BrowserMultiFormatReader()
      readerRef.current = reader
      const devices = await BrowserMultiFormatReader.listVideoInputDevices()
      const deviceId = devices[0]?.deviceId
      if (!videoRef.current) return
      await reader.decodeFromVideoDevice(deviceId, videoRef.current, (result, err) => {
        if (result) {
          stopCamera()
          lookupBarcode(result.getText())
        }
        if (err && !(err instanceof NotFoundException)) console.warn('Scan error:', err)
      })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Camera access failed')
      setCameraActive(false)
    }
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault()
    await lookupBarcode(manualBarcode)
  }

  const halalStatus = product ? deriveHalalStatus(eNumbers) : null

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b px-4 py-4 flex items-center gap-3">
        <span className="text-2xl">📷</span>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Halal Scanner</h1>
          <p className="text-xs text-gray-500">Scan a barcode to check halal status</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

        {mobile && (
          <div className="bg-white rounded-2xl shadow-sm border p-5 text-center space-y-3">
            <p className="text-sm font-semibold text-gray-700">Scan Product Barcode</p>
            <label className="inline-block">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleImageCapture}
              />
              <span className="cursor-pointer inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold py-3 px-8 rounded-xl text-sm transition-colors">
                Take Photo
              </span>
            </label>
            <p className="text-xs text-gray-400">Point your camera at the barcode on the product</p>
          </div>
        )}

        {!mobile && (
          <div className="bg-white rounded-2xl shadow-sm border p-5 space-y-3">
            <p className="text-sm font-semibold text-gray-700">Live Camera Scanner</p>
            {!cameraActive ? (
              <button
                onClick={startCamera}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
              >
                Use Camera
              </button>
            ) : (
              <div className="space-y-2">
                <video ref={videoRef} className="w-full rounded-xl bg-black" autoPlay muted playsInline />
                <button
                  onClick={stopCamera}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 rounded-xl text-sm"
                >
                  Stop Camera
                </button>
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border p-5 space-y-3">
          <p className="text-sm font-semibold text-gray-700">Enter Barcode Manually</p>
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              placeholder="e.g. 9300650000000"
              className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={loading || !manualBarcode.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-xl text-sm"
            >
              Search
            </button>
          </form>
        </div>

        {loading && (
          <div className="bg-white rounded-2xl shadow-sm border p-6 text-center space-y-3">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
            <p className="text-sm text-gray-600">Looking up product...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {product && halalStatus && !loading && (
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            {product.imageUrl && (
              <img src={product.imageUrl} alt={product.productName} className="w-full h-40 object-contain bg-gray-50 p-2" />
            )}
            <div className="p-5 space-y-3">
              <div>
                <h2 className="text-base font-bold text-gray-900">{product.productName}</h2>
                {product.brands && <p className="text-xs text-gray-500">{product.brands}</p>}
                <p className="text-xs text-gray-400 mt-0.5">Barcode: {product.code}</p>
              </div>
              <span className={`inline-block text-xs font-semibold px-3 py-1.5 rounded-full ${halalStatus.style}`}>
                {halalStatus.label}
              </span>
              {eNumbers.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">E-Numbers Found</p>
                  <div className="flex flex-wrap gap-1.5">
                    {eNumbers.map((e) => (
                      <span key={e.code} title={e.name} className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLES[e.status]}`}>
                        {e.code}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {product.ingredientsText && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Ingredients</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{product.ingredientsText}</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
    }
