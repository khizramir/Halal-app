import React from 'react';
import PrayerCountdown from '../components/PrayerCountdown';
import IngredientAnalyser from '../components/IngredientAnalyser';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-green-700">Halal App</h1>
        <p className="text-gray-500 text-sm">Your halal lifestyle companion</p>
      </header>
      <div className="space-y-4">
        <PrayerCountdown />
        <IngredientAnalyser />
      </div>
    </div>
  );
};

export default Home;
