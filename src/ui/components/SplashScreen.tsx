import React from 'react';

interface SplashScreenProps {
  isFading: boolean;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ isFading }) => {
  // Base classes with smooth transition
  const baseClasses = "fixed inset-0 z-50 flex justify-center items-center bg-gradient-to-br from-gray-900 via-black to-gray-800 transition-opacity duration-1000";
  
  // Toggle visibility based on fading state
  const visibilityClasses = isFading ? "opacity-0 pointer-events-none" : "opacity-100";

  return (
    <div className={`${baseClasses} ${visibilityClasses}`}>
      <div className="text-center p-8">
        {/* Logo */}
        <div className="mb-6 animate-pulse">
          <p 
            className="mx-auto text-8xl karantina-bold text-white"
          >
            AKAI DOJO SCOREBOARD
          </p>
        </div>
        
      </div>
    </div>
  );
};

export default SplashScreen;