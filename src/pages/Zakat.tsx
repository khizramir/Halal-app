import React, { useState } from 'react';

const NISAB_GOLD_GRAMS = 87.48;
const GOLD_PRICE_PER_GRAM = 60;
const NISAB_VALUE = NISAB_GOLD_GRAMS * GOLD_PRICE_PER_GRAM;
const ZAKAT_RATE = 0.025;

const Zakat: React.FC = () => {
  const [savings, setSavings] = useState('');
  const [gold, setGold] = useState('');
  const [silver, setSilver] = useState('');
  const [business, setBusiness] = useState('');
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const total =
      (parseFloat(savings) || 0) +
      (parseFloat(gold) || 0) * GOLD_PRICE_PER_GRAM +
      (parseFloat(silver) || 0) * 0.7 +
      (parseFloat(business) || 0);
    if (total >= NISAB_VALUE) {
      setResult(total * ZAKAT_RATE);
    } else {
      setResult(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-green-700">Zakat Calculator</h1>
        <p className="text-gray-500 text-sm">Calculate your annual zakat</p>
      </header>
      <div className="bg-white rounded-xl shadow p-4 space-y-3">
        {[
          { label: 'Cash & Savings ($)', value: savings, setter: setSavings },
          { label: 'Gold (grams)', value: gold, setter: setGold },
          { label: 'Silver (grams)', value: silver, setter: setSilver },
          { label: 'Business Assets ($)', value: business, setter: setBusiness },
        ].map(({ label, value, setter }) => (
          <div key={label}>
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <input
              type="number"
              className="mt-1 w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="0"
              value={value}
              onChange={(e) => setter(e.target.value)}
            />
          </div>
        ))}
        <button
          className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition"
          onClick={calculate}
        >
          Calculate Zakat
        </button>
        {result !== null && (
          <div className={`rounded-lg p-3 text-center ${result > 0 ? 'bg-green-50' : 'bg-gray-50'}`}>
            {result > 0 ? (
              <>
                <p className="text-sm text-gray-600">Your Zakat due:</p>
                <p className="text-2xl font-bold text-green-700">${result.toFixed(2)}</p>
              </>
            ) : (
              <p className="text-sm text-gray-600">Your wealth is below the nisab threshold. No zakat is due.</p>
            )}
          </div>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-3 text-center">
        Nisab: ~${NISAB_VALUE.toFixed(0)} (based on gold rate)
      </p>
    </div>
  );
};

export default Zakat;
