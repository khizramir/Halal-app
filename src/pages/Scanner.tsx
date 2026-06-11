import React, { useState } from 'react';
import IngredientAnalyser from '../components/IngredientAnalyser';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';

const Scanner: React.FC = () => {
  const [scanning, setScanning] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-green-700">Scanner</h1>
        <p className="text-gray-500 text-sm">Scan barcodes or paste ingredients</p>
      </header>
      <div className="bg-white rounded-xl shadow p-4 mb-4">
        <div className="bg-gray-100 rounded-lg h-48 flex flex-col items-center justify-center">
          <span className="text-5xl mb-2">📷</span>
          <p className="text-gray-500 text-sm">Barcode scanner coming soon</p>
        </div>
        <button
          className="mt-3 w-full bg-green-600 text-white py-2 rounded-lg font-medium"
          onClick={() => setScanning(!scanning)}
        >
          {scanning ? 'Stop Scanning' : 'Start Scanning'}
        </button>
        {scanning && <LoadingSpinner />}
      </div>
      <IngredientAnalyser />
    </div>
  );
};

export default Scanner;
