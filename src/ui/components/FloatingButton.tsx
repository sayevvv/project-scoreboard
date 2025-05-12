// FloatingButton.tsx
import React, { useState, useRef, useEffect } from "react";

const FloatingButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
          className="absolute top-0 right-full ml-3 mt-1 bg-black border border-gray-700 shadow-lg rounded-xl p-5 w-72 text-white"
        >
          <h1 className="text-xl font-semibold mb-3">🎮 Keyboard Shortcuts</h1>

          <div className="mb-4">
            <h2 className="text-sm font-medium text-gray-400 mb-1">
              ➕ Tambah Skor
            </h2>
            <ul className="text-sm space-y-1 pl-4 list-disc">
              <li>1 / 2 / 3: Tim 1</li>
              <li>8 / 9 / 0: Tim 2</li>
            </ul>
          </div>

          <div className="mb-4">
            <h2 className="text-sm font-medium text-gray-400 mb-1">
              ➖ Kurangi Skor
            </h2>
            <ul className="text-sm space-y-1 pl-4 list-disc">
              <li>A: Tim 1</li>
              <li>K: Tim 2</li>
            </ul>
          </div>

          <div className="mb-4">
            <h2 className="text-sm font-medium text-gray-400 mb-1">💢 Foul</h2>
            <ul className="text-sm space-y-1 pl-4 list-disc">
              <li>S: Kurangi Tim 1</li>
              <li>L: Kurangi Tim 2</li>
              <li>X: Tambah Tim 1</li>
              <li>M: Tambah Tim 2</li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-400 mb-1">
              ⏱ Kontrol Tambahan
            </h2>
            <ul className="text-sm space-y-1 pl-4 list-disc">
              <li>Spasi: Mulai/Jeda Timer</li>
              <li>Shift: Ganti Mode Kontrol</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingButton;
