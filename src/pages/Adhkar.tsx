import { useState } from 'react'
import { ADHKAR_SETS } from '../data/adhkar'

export default function Adhkar() {
  const [activeSet, setActiveSet] = useState(ADHKAR_SETS[0].id)
  const [counts, setCounts] = useState<Record<string, number>>({})

  const set = ADHKAR_SETS.find((s) => s.id === activeSet)!

  const increment = (id: string, max: number) => {
    setCounts((prev) => {
      const current = prev[id] ?? 0
      return { ...prev, [id]: current >= max ? 0 : current + 1 }
    })
  }

  const reset = (id: string) => {
    setCounts((prev) => ({ ...prev, [id]: 0 }))
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-emerald-deep">Adhkar</h2>

      <div className="flex gap-2">
        {ADHKAR_SETS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSet(s.id)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium ${
              activeSet === s.id ? 'bg-emerald-deep text-white' : 'bg-white text-gray-600 shadow'
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {set.items.map((item) => {
          const count = counts[item.id] ?? 0
          const done = count >= item.repeat
          return (
            <div key={item.id} className="space-y-2 rounded-xl bg-white p-4 shadow">
              <p dir="rtl" className="text-right text-2xl leading-relaxed">
                {item.arabic}
              </p>
              <p className="text-sm italic text-gray-500">{item.transliteration}</p>
              <p className="text-sm text-gray-700">{item.translation}</p>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => reset(item.id)}
                  className="text-xs text-gray-400 underline"
                >
                  Reset
                </button>
                <button
                  onClick={() => increment(item.id, item.repeat)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                    done ? 'bg-emerald text-white' : 'bg-emerald-deep/10 text-emerald-deep'
                  }`}
                >
                  {count} / {item.repeat} {done ? '✓' : ''}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
