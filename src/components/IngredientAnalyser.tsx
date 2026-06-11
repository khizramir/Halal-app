import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import LoadingSpinner from './LoadingSpinner';

const haramIngredients = ['gelatin', 'lard', 'pork', 'alcohol', 'wine', 'beer', 'carmine', 'e120', 'e441', 'e542'];
const doubtfulIngredients = ['e471', 'e472', 'e473', 'e474', 'e475', 'vanilla extract', 'l-cysteine'];

function analyseIngredients(text: string): { status: 'halal' | 'haram' | 'doubtful'; found: string[] } {
  const lower = text.toLowerCase();
  const foundHaram = haramIngredients.filter(i => lower.includes(i));
  const foundDoubtful = doubtfulIngredients.filter(i => lower.includes(i));
  if (foundHaram.length > 0) return { status: 'haram', found: foundHaram };
  if (foundDoubtful.length > 0) return { status: 'doubtful', found: foundDoubtful };
  return { status: 'halal', found: [] };
}

const IngredientAnalyser: React.FC = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<{ status: 'halal' | 'haram' | 'doubtful'; found: string[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyse = () => {
    if (!input.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setResult(analyseIngredients(input));
      setLoading(false);
    }, 600);
  };

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h2 className="text-lg font-bold text-gray-800 mb-2">Ingredient Analyser</h2>
      <textarea
        className="w-full border border-gray-300 rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-400"
        rows={4}
        placeholder="Paste ingredients list here..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button
        className="mt-2 w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition"
        onClick={handleAnalyse}
      >
        Analyse
      </button>
      {loading && <LoadingSpinner />}
      {result && !loading && (
        <div className="mt-3">
          <StatusBadge status={result.status} />
          {result.found.length > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              Found: <span className="font-medium">{result.found.join(', ')}</span>
            </p>
          )}
          {result.status === 'halal' && (
            <p className="text-sm text-green-700 mt-1">No haram or doubtful ingredients detected.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default IngredientAnalyser;
