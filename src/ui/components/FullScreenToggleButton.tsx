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
      className="fixed top-2 left-3 z-50 rounded-full text-white text-2xl not-odd:p-3 hover:font-bold transition"
    >
      {isFullscreen ? (
        // Exit fullscreen icon
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 10H5V6m0 0l4 4m6-4h4v4m0 0l-4-4m4 10h-4v4m0 0l4-4m-10 4H5v-4m0 0l4 4" />
        </svg>
      ) : (
        // Enter fullscreen icon
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h6v2H6v4H4V4zm16 0v6h-2V6h-4V4h6zm0 16h-6v-2h4v-4h2v6zM4 20v-6h2v4h4v2H4z" />
        </svg>
      )}
    </button>
  );
};

export default FullscreenToggleButton;
