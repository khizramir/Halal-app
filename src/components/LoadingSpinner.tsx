import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-500 border-t-transparent"></div>
    </div>
  );
};

export default LoadingSpinner;
