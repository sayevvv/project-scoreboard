import React, { useState } from 'react';

const FullscreenToggleButton: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <button
      onClick={toggleFullscreen}
      className="fixed top-4 left-4 z-50 rounded-full bg-green-600 text-white p-3 shadow-lg hover:bg-green-700 transition"
    >
      {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
    </button>
  );
};

export default FullscreenToggleButton;
