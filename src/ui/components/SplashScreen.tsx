import React from 'react';

interface SplashScreenProps {
  isFading: boolean;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ isFading }) => {
  const baseClasses =
    "fixed inset-0 z-50 flex flex-col justify-center items-center bg-gradient-to-br from-gray-900 via-black to-gray-800 transition-opacity duration-1000";
  const visibilityClasses = isFading ? "opacity-0 pointer-events-none" : "opacity-100";

  return (
    <div className={`${baseClasses} ${visibilityClasses}`}>
      {/* Local keyframes for shimmer */}
      <style>
        {`
          @keyframes shimmer {
            0% { transform: translateX(-60%); opacity: 0.0; }
            40% { opacity: 0.22; }
            100% { transform: translateX(160%); opacity: 0.0; }
          }
        `}
      </style>

      {/* Scoreboard placeholder */}
      <div className="relative w-[min(90vw,900px)] aspect-[16/9] rounded-2xl border border-slate-700/60 bg-black/40 shadow-xl overflow-hidden">
        {/* Content skeleton */}
        <div className="absolute inset-0 grid grid-cols-3 gap-2 p-4">
          {/* Left (AO - Blue) */}
          <div className="flex flex-col gap-2">
            <div className="h-8 rounded-md bg-gradient-to-r from-blue-900/70 to-blue-700/50"></div>
            <div className="flex-1 rounded-xl bg-gradient-to-br from-blue-950/60 to-blue-800/40"></div>
          </div>
          {/* Center (Timer) */}
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-40 h-16 rounded-xl border border-slate-600/60 bg-black/40"></div>
            <div className="w-24 h-4 rounded bg-slate-700/50"></div>
          </div>
          {/* Right (AKA - Red) */}
          <div className="flex flex-col gap-2">
            <div className="h-8 rounded-md bg-gradient-to-l from-red-900/70 to-red-700/50"></div>
            <div className="flex-1 rounded-xl bg-gradient-to-bl from-red-950/60 to-red-800/40"></div>
          </div>
        </div>

    {/* One-time shimmer sweep across full width */}
    <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none z-10">
          <div
            className="h-full w-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent"
            style={{ animation: "shimmer 1.4s ease-out 1" }}
          />
        </div>
      </div>

    {/* Caption */}
    <p className="mt-4 text-[12px] sm:text-sm tracking-widest text-gray-200/85">AKAI DOJO SCOREBOARD</p>
    </div>
  );
};

export default SplashScreen;