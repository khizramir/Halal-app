import { useMemo, useState } from 'react'

const GOLD_NISAB_GRAMS = 85
const SILVER_NISAB_GRAMS = 595
const ZAKAT_RATE = 0.025

export default function Zakat() {
  const [goldPrice, setGoldPrice] = useState('120')
  const [silverPrice, setSilverPrice] = useState('1.5')
  const [nisabBasis, setNisabBasis] = useState<'gold' | 'silver'>('silver')
  const [wealth, setWealth] = useState('')

  const goldPriceNum = Number(goldPrice) || 0
  const silverPriceNum = Number(silverPrice) || 0
  const wealthNum = Number(wealth) || 0

  const nisabValue = useMemo(() => {
    return nisabBasis === 'gold'
      ? GOLD_NISAB_GRAMS * goldPriceNum
      : SILVER_NISAB_GRAMS * silverPriceNum
  }, [nisabBasis, goldPriceNum, silverPriceNum])

  const zakatDue = wealthNum >= nisabValue && nisabValue > 0 ? wealthNum * ZAKAT_RATE : 0
  const eligible = wealthNum >= nisabValue && nisabValue > 0

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-emerald-deep">Zakat Calculator</h2>

      <div className="space-y-3 rounded-xl bg-white p-4 shadow">
        <label className="block text-sm font-medium text-gray-700">
          Nisab basis
          <div className="mt-1 flex gap-2">
            <button
              onClick={() => setNisabBasis('silver')}
              className={`flex-1 rounded-lg py-2 text-sm ${
                nisabBasis === 'silver' ? 'bg-emerald-deep text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Silver (595g)
            </button>
            <button
              onClick={() => setNisabBasis('gold')}
              className={`flex-1 rounded-lg py-2 text-sm ${
                nisabBasis === 'gold' ? 'bg-emerald-deep text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Gold (85g)
            </button>
          </div>
        </label>

        <label className="block text-sm font-medium text-gray-700">
          Gold price (AUD per gram)
          <input
            type="number"
            value={goldPrice}
            onChange={(e) => setGoldPrice(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </label>

        <label className="block text-sm font-medium text-gray-700">
          Silver price (AUD per gram)
          <input
            type="number"
            value={silverPrice}
            onChange={(e) => setSilverPrice(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </label>

        <label className="block text-sm font-medium text-gray-700">
          Total zakatable wealth (AUD)
          <input
            type="number"
            value={wealth}
            onChange={(e) => setWealth(e.target.value)}
            placeholder="Cash, savings, gold, silver, business assets…"
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div className="rounded-xl bg-emerald-deep p-4 text-center text-white shadow">
        <p className="text-sm uppercase tracking-wide opacity-80">
          Nisab threshold ({nisabBasis})
        </p>
        <p className="text-xl font-bold">${nisabValue.toFixed(2)} AUD</p>

        <div className="my-3 h-px bg-white/20" />

        {eligible ? (
          <>
            <p className="text-sm uppercase tracking-wide opacity-80">Zakat due (2.5%)</p>
            <p className="text-2xl font-bold">${zakatDue.toFixed(2)} AUD</p>
          </>
        ) : (
          <p className="text-sm">
            Your wealth is below the nisab threshold — Zakat is not obligatory this year.
          </p>
        )}
      </div>

      <p className="text-xs text-gray-400">
        Enter current gold/silver prices manually (e.g. from your local bullion dealer). Nisab is
        85g of gold or 595g of silver, whichever you select. Zakat is calculated at 2.5% of
        wealth held for one full lunar year above the nisab threshold. This tool is for guidance
        only — consult a knowledgeable scholar for your specific situation.
      </p>
    </div>
  )
}
