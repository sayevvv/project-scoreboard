// FloatingButton.tsx
import React, { useState, useRef, useEffect } from 'react';

const FloatingButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="rounded-full text-white p-3 shadow-lg hover:bg-gray-700 transition"
      >
        ☰
      </button>

      {isOpen && (
        <div
          ref={popupRef}
          className="absolute top-0 right-full ml-3 mt-1 bg-white shadow-lg rounded-lg p-4 w-48"
        >
          <h1 className="text-lg font-bold text-gray-800">Keyboard Shortcuts</h1>
          <ul className="mt-2 text-gray-700">
            <li className="mb-1">Ctrl + N: New Game</li>
            <li className="mb-1">Ctrl + S: Save Game</li>
            <li className="mb-1">Ctrl + L: Load Game</li>
            <li className="mb-1">Ctrl + P: Pause Game</li>
            <li>Ctrl + R: Resume Game</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default FloatingButton;
