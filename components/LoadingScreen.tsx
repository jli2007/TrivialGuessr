import React from 'react';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading Google Maps...'
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-secondary-900 to-primary-800 flex items-center justify-center">
      <div className="text-white text-xl flex items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        {message}
      </div>
    </div>
  );
};

export default LoadingScreen;