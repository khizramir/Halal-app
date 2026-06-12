import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchProductByBarcode, type FoodProduct } from '../lib/foodfacts'
import { extractENumbers, type ENumberInfo } from '../data/eNumbers'

// Extend Window type to include BarcodeDetector
declare global {
  interface Window {
    BarcodeDetector?: {
      new (options?: { formats: string[] }): {
        detect(source: ImageBitmapSource): Promise<Array<{ rawValue: string }>>
      }
      getSupportedFormats(): Promise<string[]>
    }
  }
}

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
    return { label: STATUS_LABELS.haram, style: STATUS_STYLES.haram }
  }
  if (eNumbers.some((e) => e.status === 'mushbooh')) {
    return { label: STATUS_LABELS.mushbooh, style: STATUS_STYLES.mushbooh }
  }
  if (eNumbers.length > 0) {
    return { label: STATUS_LABELS.halal, style: STATUS_STYLES.halal }
  }
  return { label: 'No E-numbers detected - verify manually', style: 'bg-gray-100 text-gray-700 border border-gray-300' }
}

export default function Scanner() {
  const [manualBarcode, setManualBarcode] = useState('')
  const [product, setProduct] = useState<FoodProduct | null>(null)
  const [eNumbers, setENumbers] = useState<ENumberInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [hasBarcodeDetector] = useState(() => !!window.BarcodeDetector)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number>(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setCameraActive(false)
  }, [])

  useEffect(() => {
    return stopCamera
  }, [stopCamera])

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
      if (!window.BarcodeDetector) throw new Error('BarcodeDetector not supported')
      const detector = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code'] })
      const bitmap = await createImageBitmap(file)
      const results = await detector.detect(bitmap)
      if (results.length === 0) {
        setError('No barcode found in photo. Try better lighting or a clearer image.')
        setLoading(false)
      } else {
        await lookupBarcode(results[0].rawValue)
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to decode image')
      setLoading(false)
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function startCamera() {
    setError(null)
    setProduct(null)
    setENumbers([])
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      streamRef.current = stream
      setCameraActive(true)
      // Wait for video to be ready
      await new Promise<void>((resolve) => {
        if (!videoRef.current) { resolve(); return }
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => resolve()
      })
      if (!window.BarcodeDetector || !videoRef.current || !canvasRef.current) return
      const detector = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code'] })
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const scan = async () => {
        const video = videoRef.current
        if (!video || !streamRef.current) return
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0)
        try {
          const results = await detector.detect(canvas)
          if (results.length > 0) {
            stopCamera()
            await lookupBarcode(results[0].rawValue)
            return
          }
        } catch (_) {}
        rafRef.current = requestAnimationFrame(() => { scan() })
      }
      rafRef.current = requestAnimationFrame(() => { scan() })
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

        {/* Live camera scanner */}
        {hasBarcodeDetector && (
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
                <div className="relative">
                  <video ref={videoRef} className="w-full rounded-xl bg-black" autoPlay muted playsInline />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
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

        {/* Photo / file capture */}
        <div className="bg-white rounded-2xl shadow-sm border p-5 text-center space-y-3">
          <p className="text-sm font-semibold text-gray-700">Scan Product Barcode</p>
          {hasBarcodeDetector ? (
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
          ) : (
            <p className="text-sm text-gray-500 bg-amber-50 border border-amber-200 rounded-xl p-3">
              Camera scanning is not supported in this browser. Use manual entry below, or try Chrome on Android/desktop.
            </p>
          )}
          <p className="text-xs text-gray-400">Point your camera at the barcode on the product</p>
        </div>

        {/* Manual barcode entry */}
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
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {product && halalStatus && !loading && (
          <div className="bg-white rounded-2xl shadow-sm border p-5 space-y-4">
            <div className="flex items-start gap-3">
              {product.imageUrl && (
                <img src={product.imageUrl} alt={product.productName} className="w-16 h-16 object-contain rounded-xl border" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm leading-tight">{product.productName}</p>
                {product.brands && <p className="text-xs text-gray-500 mt-0.5">{product.brands}</p>}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`inline-block text-xs font-semibold px-3 py-1.5 rounded-full ${halalStatus.style}`}>
                {halalStatus.label}
              </span>
            </div>

            {eNumbers.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">E-Numbers Found:</p>
                <div className="space-y-2">
                  {eNumbers.map((en) => (
                    <div key={en.code} className={`text-xs rounded-xl px-3 py-2 ${STATUS_STYLES[en.status]}`}>
                      <span className="font-bold">{en.code}</span>
                      {en.name && <span className="ml-1">– {en.name}</span>}
                      <span className="ml-1 opacity-75">({STATUS_LABELS[en.status]})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {product.ingredientsText && (
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">Ingredients:</p>
                <p className="text-xs text-gray-500 leading-relaxed">{product.ingredientsText}</p>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  )
}
