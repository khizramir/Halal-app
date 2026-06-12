import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { buildBasket, searchShop } from '../lib/api'
import { useAppProfile } from '../lib/useAppProfile'
import type { BasketGroup, ShopProduct } from '../types'

const COLES_URL = 'https://www.coles.com.au/search?q='
const IGA_URL = 'https://www.igashop.com.au/search?q='

function priceLabel(price: number | null): string {
  return price != null ? `$${price.toFixed(2)}` : 'Price unavailable'
}

function ProductCard({ product }: { product: ShopProduct }) {
  return (
    <div className="flex gap-3 rounded-xl bg-white p-3 shadow">
      {product.image ? (
        <img src={product.image} alt="" className="h-16 w-16 rounded object-cover" />
      ) : (
        <div className="h-16 w-16 rounded bg-cream" />
      )}
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-emerald-deep">{product.name}</p>
        {product.brand && <p className="text-xs text-gray-500">{product.brand}</p>}
        <div className="mt-1 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-800">{priceLabel(product.price)}</span>
          <a href={product.url} target="_blank" rel="noreferrer" className="text-xs text-emerald underline">
            Woolworths →
          </a>
        </div>
        {product.badges.includes('halal_labelled') && (
          <span className="mt-1 inline-block rounded-full bg-emerald/10 px-2 py-0.5 text-xs font-medium text-emerald">
            Halal labelled
          </span>
        )}
      </div>
    </div>
  )
}

function ComparisonLinks({ query }: { query: string }) {
  return (
    <div className="flex gap-2 text-xs">
      <a
        href={`${COLES_URL}${encodeURIComponent(query)}`}
        target="_blank"
        rel="noreferrer"
        className="rounded-lg border border-gray-200 px-2 py-1 text-gray-600"
      >
        Find at Coles →
      </a>
      <a
        href={`${IGA_URL}${encodeURIComponent(query)}`}
        target="_blank"
        rel="noreferrer"
        className="rounded-lg border border-gray-200 px-2 py-1 text-gray-600"
      >
        Find at IGA →
      </a>
    </div>
  )
}

export default function Shop() {
  const profile = useAppProfile()
  const location = useLocation()

  const [basketRequest, setBasketRequest] = useState('')
  const [basketLoading, setBasketLoading] = useState(false)
  const [basketError, setBasketError] = useState<string | null>(null)
  const [basketGroups, setBasketGroups] = useState<BasketGroup[] | null>(null)
  const [basketTotal, setBasketTotal] = useState(0)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<ShopProduct[] | null>(null)

  const handleBuildBasket = async (override?: string) => {
    const text = override ?? basketRequest
    if (!text.trim()) return
    setBasketLoading(true)
    setBasketError(null)
    setBasketGroups(null)
    try {
      const result = await buildBasket(text, profile.dietaryRequirements)
      if (!result) {
        setBasketError('Could not build a basket for that request.')
        return
      }
      setBasketGroups(result.groups)
      setBasketTotal(result.estimatedTotal)
    } finally {
      setBasketLoading(false)
    }
  }

  useEffect(() => {
    const incoming = (location.state as { basketRequest?: string } | null)?.basketRequest
    if (incoming) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBasketRequest(incoming)
      handleBuildBasket(incoming)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setSearchLoading(true)
    setSearchError(null)
    setSearchResults(null)
    try {
      const result = await searchShop(searchQuery, profile.dietaryRequirements)
      if (!result) {
        setSearchError('Search failed. Please try again.')
        return
      }
      setSearchResults(result.products)
    } finally {
      setSearchLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-emerald-deep">Shop Halal Groceries</h2>

      {/* Smart Basket Builder */}
      <section className="space-y-3 rounded-xl bg-white p-4 shadow">
        <h3 className="font-semibold text-emerald-deep">Smart Basket Builder</h3>
        <p className="text-sm text-gray-500">
          Tell us what you want to cook and we'll build a shopping list from Woolworths, filtered to your dietary profile.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder='e.g. "chicken biryani for 4"'
            value={basketRequest}
            onChange={(e) => setBasketRequest(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleBuildBasket()}
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
          <button
            onClick={() => handleBuildBasket()}
            disabled={!basketRequest.trim() || basketLoading}
            className="rounded-lg bg-emerald-deep px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Build
          </button>
        </div>

        {basketLoading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-cream" />
            ))}
          </div>
        )}
        {basketError && <p className="text-sm text-red-600">{basketError}</p>}

        {basketGroups && (
          <div className="space-y-4">
            {basketGroups.length === 0 && (
              <p className="text-sm text-gray-400">Couldn't work out a shopping list for that — try rephrasing.</p>
            )}
            {basketGroups.map((group) => (
              <div key={group.ingredient} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-700 capitalize">{group.ingredient}</h4>
                  <ComparisonLinks query={group.query} />
                </div>
                {group.products.length === 0 ? (
                  <p className="text-xs text-gray-400">No matching products found.</p>
                ) : (
                  <div className="space-y-2">
                    {group.products.slice(0, 3).map((p) => (
                      <ProductCard key={p.sku} product={p} />
                    ))}
                  </div>
                )}
              </div>
            ))}
            {basketGroups.length > 0 && (
              <div className="flex items-center justify-between rounded-xl bg-emerald-deep/5 p-3">
                <span className="text-sm font-medium text-emerald-deep">Estimated total (cheapest items)</span>
                <span className="text-lg font-bold text-emerald-deep">${basketTotal.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Dietary Filter Search */}
      <section className="space-y-3 rounded-xl bg-white p-4 shadow">
        <h3 className="font-semibold text-emerald-deep">Search Products</h3>
        <p className="text-sm text-gray-500">
          {profile.dietaryRequirements.length > 0
            ? `Results filtered for: ${profile.dietaryRequirements.join(', ')}`
            : 'Set a dietary profile to filter results automatically.'}
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search for a product…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
          <button
            onClick={handleSearch}
            disabled={!searchQuery.trim() || searchLoading}
            className="rounded-lg bg-emerald-deep px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Search
          </button>
        </div>

        {searchLoading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-cream" />
            ))}
          </div>
        )}
        {searchError && <p className="text-sm text-red-600">{searchError}</p>}

        {searchResults && (
          <div className="space-y-2">
            {searchResults.length === 0 ? (
              <p className="text-sm text-gray-400">No products found matching your dietary profile.</p>
            ) : (
              <>
                {searchResults.map((p) => (
                  <ProductCard key={p.sku} product={p} />
                ))}
                <ComparisonLinks query={searchQuery} />
              </>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
