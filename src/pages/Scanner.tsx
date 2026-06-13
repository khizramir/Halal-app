import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { fetchProductByBarcode, type FoodProduct } from '../lib/foodfacts'
import { extractENumbers, type ENumberInfo } from '../data/eNumbers'
import { useSession } from '../lib/auth'
import { addScanHistory, getScanHistory, saveItem, scanBarcode, scanPhoto } from '../lib/api'
import { incrementGuestScanCount } from '../lib/guest'
import { FeedbackModal } from '../components/FeedbackWidget'
import { useAppProfile } from '../lib/useAppProfile'
import { DIETARY_REQUIREMENTS } from '../types'
import type { ProductAnalysis, ScanHistoryEntry } from '../types'

const VERDICT_STYLES: Record<ProductAnalysis['overallVerdict'], string> = {
  suitable: 'bg-emerald/10 text-emerald',
  not_suitable: 'bg-red-100 text-red-700',
  check_label: 'bg-amber-100 text-amber-700',
}

const VERDICT_LABELS: Record<ProductAnalysis['overallVerdict'], string> = {
  suitable: '✅ SUITABLE',
  not_suitable: '❌ NOT SUITABLE',
  check_label: '⚠️ CHECK LABEL',
}

const REQUIREMENT_VERDICT_STYLES: Record<ProductAnalysis['requirements'][number]['verdict'], string> = {
  ok: 'text-emerald',
  not_ok: 'text-red-600',
  uncertain: 'text-amber-600',
}

const REQUIREMENT_VERDICT_LABELS: Record<ProductAnalysis['requirements'][number]['verdict'], string> = {
  ok: '✅ OK',
  not_ok: '❌ Not OK',
  uncertain: '⚠️ Uncertain',
}

function requirementLabel(requirement: string): string {
  return DIETARY_REQUIREMENTS.find((d) => d.id === requirement)?.label ?? requirement
}

function AnalysisCard({ analysis }: { analysis: ProductAnalysis }) {
  return (
    <div className="space-y-3 rounded-xl bg-white p-4 shadow">
      <div className={`rounded-lg p-3 text-center font-semibold ${VERDICT_STYLES[analysis.overallVerdict]}`}>
        {VERDICT_LABELS[analysis.overallVerdict]}
      </div>
      <div className="space-y-2">
        {analysis.requirements.map((r) => (
          <div key={r.requirement} className="flex items-start justify-between gap-2 text-sm">
            <div>
              <p className="font-medium text-gray-700">{requirementLabel(r.requirement)}</p>
              <p className="text-xs text-gray-500">{r.reason}</p>
            </div>
            <span className={`whitespace-nowrap text-xs font-semibold ${REQUIREMENT_VERDICT_STYLES[r.verdict]}`}>
              {REQUIREMENT_VERDICT_LABELS[r.verdict]}
            </span>
          </div>
        ))}
      </div>
      {analysis.flaggedIngredients.length > 0 && (
        <p className="text-xs text-gray-500">
          Flagged ingredients: {analysis.flaggedIngredients.join(', ')}
        </p>
      )}
      <p className="text-xs text-gray-400">Confidence: {Math.round(analysis.confidence * 100)}%</p>
    </div>
  )
}

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
  const { session } = useSession()
  const profile = useAppProfile()
  const [barcode, setBarcode] = useState('')
  const [product, setProduct] = useState<FoodProduct | null>(null)
  const [localProduct, setLocalProduct] = useState<LocalProduct | null>(null)
  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [recentScans, setRecentScans] = useState<ScanHistoryEntry[]>([])
  const [saved, setSaved] = useState(false)
  const [showGuestPrompt, setShowGuestPrompt] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [ocrLoading, setOcrLoading] = useState(false)
  const [ocrAnalysis, setOcrAnalysis] = useState<ProductAnalysis | null>(null)
  const [ocrIngredients, setOcrIngredients] = useState<string | null>(null)
  const [ocrError, setOcrError] = useState<string | null>(null)
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)

  useEffect(() => {
    if (!session?.user) return
    getScanHistory().then((rows) => setRecentScans((rows ?? []).slice(0, 5)))
  }, [session?.user])

  const recordScan = (code: string, result: { name: string; brand: string | null; status: string; dietaryFlags?: string[] }) => {
    if (session?.user) {
      addScanHistory({
        barcode: code,
        productName: result.name,
        brand: result.brand,
        resultStatus: result.status,
        dietaryFlags: result.dietaryFlags ?? [],
      }).then(() => {
        getScanHistory().then((rows) => setRecentScans((rows ?? []).slice(0, 5)))
      })
    } else {
      const count = incrementGuestScanCount()
      if (count >= 5) setShowGuestPrompt(true)
    }
  }

  const lookup = async (code: string) => {
    setLoading(true)
    setError(null)
    setProduct(null)
    setLocalProduct(null)
    setAnalysis(null)
    setSaved(false)

    let foundLocal: LocalProduct | null = null
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(code)}`)
      if (res.ok) {
        foundLocal = await res.json()
        setLocalProduct(foundLocal)
      }
    } catch {
      // ignore
    }

    scanBarcode(code, profile.dietaryRequirements).then((result) => {
      if (result) setAnalysis(result.analysis)
    })

    try {
      const result = await fetchProductByBarcode(code)
      if (!result) {
        setError('Product not found in Open Food Facts.')
      } else {
        setProduct(result)
      }

      const eNumbers = result ? extractENumbers(result.ingredientsText) : []
      const hasHaram = eNumbers.some((e) => e.status === 'haram')
      const hasMushbooh = eNumbers.some((e) => e.status === 'mushbooh')
      const status = foundLocal?.status ?? (hasHaram ? 'haram' : hasMushbooh ? 'mushbooh' : result ? 'halal' : 'unknown')
      const name = foundLocal?.name ?? result?.productName ?? code
      const brand = foundLocal?.brand ?? result?.brands ?? null
      recordScan(code, { name, brand, status })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lookup failed.')
    } finally {
      setLoading(false)
    }
  }

  const startScan = () => {
    setError(null)
    setScanning(true)
  }

  const stopScan = () => {
    scannerRef.current?.clear().catch(() => {})
    scannerRef.current = null
    setScanning(false)
  }

  useEffect(() => {
    if (!scanning) return

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false,
    )
    scannerRef.current = scanner

    scanner.render(
      (decodedText) => {
        stopScan()
        setBarcode(decodedText)
        lookup(decodedText)
      },
      () => {
        // ignore per-frame scan errors
      },
    )

    return () => {
      scanner.clear().catch(() => {})
      scannerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning])

  const handleIngredientPhoto = async (file: File) => {
    setOcrError(null)
    setOcrAnalysis(null)
    setOcrIngredients(null)
    setOcrLoading(true)
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve((reader.result as string).split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const result = await scanPhoto(base64, file.type, profile.dietaryRequirements)
      if (!result) {
        setOcrError('Could not analyse ingredients.')
        return
      }

      setOcrAnalysis(result)
      setOcrIngredients(result.extractedIngredients)
    } catch (err) {
      setOcrError(err instanceof Error ? err.message : 'Could not analyse ingredients.')
    } finally {
      setOcrLoading(false)
    }
  }

  const eNumbers = product ? extractENumbers(product.ingredientsText) : []
  const hasHaram = eNumbers.some((e) => e.status === 'haram')
  const hasMushbooh = eNumbers.some((e) => e.status === 'mushbooh')

  const handleSaveProduct = async () => {
    if (!session?.user) {
      setShowGuestPrompt(true)
      return
    }
    const name = localProduct?.name ?? product?.productName ?? barcode
    await saveItem({
      itemType: 'product',
      referenceId: barcode,
      itemName: name,
      itemData: { localProduct, product },
    })
    setSaved(true)
  }

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

        <button
          onClick={scanning ? stopScan : startScan}
          className="w-full rounded-lg border border-emerald py-2 text-sm font-medium text-emerald"
        >
          {scanning ? 'Stop camera' : '📷 Scan with camera'}
        </button>

        {scanning && <div id="qr-reader" className="w-full" />}

        <label className="block w-full cursor-pointer rounded-lg border border-dashed border-gray-300 py-2 text-center text-sm font-medium text-gray-600">
          📸 Photograph ingredient list (AI analysis)
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleIngredientPhoto(file)
            }}
          />
        </label>
        {ocrLoading && <p className="text-xs text-gray-500">Analysing ingredients…</p>}
        {ocrError && <p className="text-xs text-red-600">{ocrError}</p>}
        {ocrIngredients && (
          <p className="rounded-lg bg-cream p-2 text-xs text-gray-700">{ocrIngredients || 'No ingredients detected.'}</p>
        )}
      </div>

      {ocrAnalysis && <AnalysisCard analysis={ocrAnalysis} />}

      {loading && <p className="text-gray-500">Looking up product…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {analysis && <AnalysisCard analysis={analysis} />}

      {localProduct && (
        <div className={`rounded-xl p-4 shadow ${STATUS_STYLES[localProduct.status]}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold">
                {localProduct.name}
                {localProduct.brand ? ` — ${localProduct.brand}` : ''}
              </p>
              <p className="text-sm">
                Status: <span className="font-medium uppercase">{localProduct.status}</span>
                {localProduct.certifier ? ` · ${localProduct.certifier}` : ''}
              </p>
            </div>
            <button onClick={handleSaveProduct} className="text-2xl" aria-label="Save product">
              {saved ? '🔖' : '📑'}
            </button>
          </div>
          {localProduct.notes && <p className="mt-1 text-xs opacity-90">{localProduct.notes}</p>}
        </div>
      )}

      {product && (
        <div className="space-y-3 rounded-xl bg-white p-4 shadow">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {product.imageUrl && (
                <img src={product.imageUrl} alt="" className="h-16 w-16 rounded object-cover" />
              )}
              <div>
                <h3 className="font-semibold text-emerald-deep">{product.productName}</h3>
                {product.brands && <p className="text-sm text-gray-500">{product.brands}</p>}
              </div>
            </div>
            {!localProduct && (
              <button onClick={handleSaveProduct} className="text-2xl" aria-label="Save product">
                {saved ? '🔖' : '📑'}
              </button>
            )}
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

          <div className="flex items-center justify-between text-sm">
            <a href={AFIC_SEARCH_URL} target="_blank" rel="noreferrer" className="text-emerald underline">
              Check AFIC halal certification directory →
            </a>
            <button onClick={() => setShowFeedback(true)} className="text-xs text-gray-400 underline">
              Report an issue
            </button>
          </div>
        </div>
      )}

      {session?.user && recentScans.length > 0 && (
        <div className="rounded-xl bg-white p-4 shadow">
          <h3 className="font-semibold text-emerald-deep">Recent Scans</h3>
          <div className="mt-2 space-y-2">
            {recentScans.map((s) => (
              <div key={s.id} className="rounded-lg bg-cream p-2 text-sm">
                <span className="font-medium text-emerald-deep">{s.productName}</span>
                {s.brand && <span className="text-gray-500"> · {s.brand}</span>}
                <span className="ml-2 text-xs uppercase text-gray-400">{s.resultStatus}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showGuestPrompt && !session?.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 text-center shadow-lg">
            <p className="text-2xl">📑</p>
            <p className="mt-2 font-semibold text-emerald-deep">
              Sign up to save your history and preferences
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Create a free account to keep your scan history and saved products across sessions.
            </p>
            <button
              onClick={() => setShowGuestPrompt(false)}
              className="mt-4 w-full rounded-xl bg-emerald-deep py-2 text-sm font-semibold text-white"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}

      {showFeedback && (
        <FeedbackModal
          initialCategory="wrong_info"
          prefillMessage={product ? `Issue with ${product.productName} (${barcode}): ` : ''}
          onClose={() => setShowFeedback(false)}
        />
      )}
    </div>
  )
}
