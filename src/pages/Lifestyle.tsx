import React from 'react';

const categories = [
  { icon: '🥚', title: 'Food & Drink', desc: 'Halal-certified products' },
  { icon: '💊', title: 'Medicines', desc: 'Check medication ingredients' },
  { icon: '💄', title: 'Cosmetics', desc: 'Halal beauty products' },
  { icon: '👕', title: 'Fashion', desc: 'Modest & ethical clothing' },
  { icon: '🏦', title: 'Finance', desc: 'Islamic banking & finance' },
  { icon: '✈️', title: 'Travel', desc: 'Muslim-friendly destinations' },
];

const Lifestyle: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-green-700">Lifestyle</h1>
        <p className="text-gray-500 text-sm">Halal living made easy</p>
      </header>
      <div className="grid grid-cols-2 gap-3">
        {categories.map((cat) => (
          <div key={cat.title} className="bg-white rounded-xl shadow p-4 flex flex-col items-center text-center">
            <span className="text-3xl mb-2">{cat.icon}</span>
            <h3 className="font-semibold text-gray-800 text-sm">{cat.title}</h3>
            <p className="text-xs text-gray-500 mt-1">{cat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Lifestyle;
