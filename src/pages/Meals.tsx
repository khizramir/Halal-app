import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMealPlan } from '../lib/api'
import { useAppProfile } from '../lib/useAppProfile'
import type { MealSuggestion } from '../types'

function MealCard({ meal }: { meal: MealSuggestion }) {
  return (
    <div className="space-y-2 rounded-xl bg-white p-4 shadow">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold text-emerald-deep">{meal.name}</h4>
          <p className="text-xs text-gray-500">{meal.cuisine}</p>
        </div>
        <div className="text-right text-xs text-gray-500">
          <p>~${meal.estimated_cost_aud?.toFixed?.(2) ?? meal.estimated_cost_aud}</p>
          <p>{meal.cook_time_minutes} min</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {meal.ingredients.map((ing) => (
          <span key={ing} className="rounded-full bg-cream px-2 py-0.5 text-xs text-gray-600">
            {ing}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Meals() {
  const profile = useAppProfile()
  const navigate = useNavigate()
  const [request, setRequest] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [meals, setMeals] = useState<MealSuggestion[] | null>(null)
  const [shoppingList, setShoppingList] = useState<string[]>([])

  const handlePlan = async () => {
    if (!request.trim()) return
    setLoading(true)
    setError(null)
    setMeals(null)
    try {
      const result = await getMealPlan(request, profile.dietaryRequirements)
      if (!result) {
        setError('Could not generate a meal plan. Please try again.')
        return
      }
      setMeals(result.meals)
      setShoppingList(result.shoppingList)
    } finally {
      setLoading(false)
    }
  }

  const totalCost = (meals ?? []).reduce((sum, m) => sum + (m.estimated_cost_aud ?? 0), 0)

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-emerald-deep">AI Meal Planner</h2>

      <section className="space-y-3 rounded-xl bg-white p-4 shadow">
        <p className="text-sm text-gray-500">
          Tell us what kind of food you're after this week and we'll suggest halal-friendly meals based on your
          dietary profile.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder='e.g. "I want to make Pakistani food this week"'
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handlePlan()}
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
          <button
            onClick={handlePlan}
            disabled={!request.trim() || loading}
            className="rounded-lg bg-emerald-deep px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Plan
          </button>
        </div>
      </section>

      {loading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-white shadow" />
          ))}
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {meals && (
        <>
          <div className="space-y-3">
            {meals.map((meal) => (
              <MealCard key={meal.name} meal={meal} />
            ))}
          </div>

          {shoppingList.length > 0 && (
            <section className="space-y-3 rounded-xl bg-white p-4 shadow">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-emerald-deep">Combined shopping list</h3>
                <span className="text-sm font-medium text-gray-500">Est. total ${totalCost.toFixed(2)}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {shoppingList.map((item) => (
                  <span key={item} className="rounded-full bg-cream px-2 py-0.5 text-xs text-gray-600">
                    {item}
                  </span>
                ))}
              </div>
              <button
                onClick={() => navigate('/shop', { state: { basketRequest: shoppingList.join(', ') } })}
                className="w-full rounded-xl bg-emerald-deep py-2 text-sm font-semibold text-white"
              >
                Shop this list →
              </button>
            </section>
          )}
        </>
      )}
    </div>
  )
}
