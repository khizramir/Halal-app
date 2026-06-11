import React from 'react';
import StatusBadge from '../components/StatusBadge';

const mockRestaurants = [
  { id: 1, name: 'Al-Noor Grill', cuisine: 'Middle Eastern', status: 'halal' as const, rating: 4.5 },
  { id: 2, name: 'Spice Garden', cuisine: 'Indian', status: 'halal' as const, rating: 4.2 },
  { id: 3, name: 'Dragon Palace', cuisine: 'Chinese', status: 'doubtful' as const, rating: 3.8 },
  { id: 4, name: 'The Burger Spot', cuisine: 'American', status: 'unknown' as const, rating: 4.0 },
];

const Restaurants: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-green-700">Restaurants</h1>
        <p className="text-gray-500 text-sm">Find halal restaurants near you</p>
      </header>
      <div className="space-y-3">
        {mockRestaurants.map((r) => (
          <div key={r.id} className="bg-white rounded-xl shadow p-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">{r.name}</h3>
              <p className="text-sm text-gray-500">{r.cuisine}</p>
              <p className="text-xs text-yellow-500">{'★'.repeat(Math.floor(r.rating))} {r.rating}</p>
            </div>
            <StatusBadge status={r.status} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Restaurants;
