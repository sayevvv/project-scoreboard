import { useState, useEffect } from 'react';

type Props = {
  duration: number; // in seconds
  onTimeEnd?: () => void;
  disabled?: boolean;
  onNewGame?: () => void; // <-- Prop baru untuk aksi game baru
};

export default function Timer({ duration, onTimeEnd, disabled = false, onNewGame }: Props) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);

  // Format time to MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Toggle timer Play/Pause
  const toggleTimer = () => {
    if (!disabled) {
      // Jika waktu sudah 0 dan kita menekan 'Mulai' lagi, reset dulu
      if (timeLeft <= 0 && !isRunning) {
          setTimeLeft(duration);
      }
      setIsRunning(prev => !prev);
    }
  };

  // Fungsi untuk mereset timer ke durasi awal (saat dipause)
  const handleReset = () => {
    if (!disabled) {
        setTimeLeft(duration);
        // Biarkan isRunning tetap false (paused)
    }
  };

  // Reset timer saat durasi berubah (misal dari setup baru)
  const resetTimerToDuration = () => {
      setTimeLeft(duration);
      setIsRunning(false);
  };

  // Handle timer countdown logic
  useEffect(() => {
    let interval: number | undefined;

    if (isRunning && timeLeft > 0 && !disabled) {
      interval = window.setInterval(() => {
        setTimeLeft(prev => {
          const nextTime = prev - 1;
          if (nextTime <= 0) {
            clearInterval(interval);
            setIsRunning(false);
            if (onTimeEnd) onTimeEnd();
            return 0;
          }
          return nextTime;
        });
      }, 1000);
    } else {
        if (interval) clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, onTimeEnd, disabled]);

  // Effect to reset timer when duration prop changes
  useEffect(() => {
    resetTimerToDuration();
  }, [duration]);

  return (
    // Menggunakan justify-between agar waktu di kiri dan tombol di kanan
    <div className={`flex justify-between items-center w-full text-center py-2 px-4 rounded-full bg-gray-900 text-white shadow-lg border border-gray-700 ${disabled ? 'opacity-70' : ''}`}>
      {/* Time Display */}
      <div className="text-2xl sm:text-3xl font-mono px-4 sm:px-6 py-2">
        {formatTime(timeLeft)}
      </div>

      {/* --- START: Button Controls Area --- */}
      <div className="flex items-center gap-2"> {/* Wadah untuk semua tombol kontrol */}
        {/* Tombol Play/Pause Utama */}
        <button
          onClick={toggleTimer}
          disabled={disabled || (timeLeft <= 0 && !isRunning)}
          title={isRunning ? "Jeda" : "Mulai"} // Tooltip
          className={`p-2 rounded-full text-base sm:text-lg font-semibold transition duration-200 ease-in-out ${
            isRunning
              ? "bg-orange-500 hover:bg-orange-600 active:bg-orange-700" // State Jeda (Pause)
              : "bg-green-500 hover:bg-green-600 active:bg-green-700"   // State Mulai (Play)
          } text-white ${disabled || (timeLeft <= 0 && !isRunning) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          {isRunning ? (
            // Ikon Pause
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v4a1 1 0 11-2 0V8z" clipRule="evenodd" />
            </svg>
          ) : (
            // Ikon Play
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        {/* --- Tombol Reset dan Game Baru (Hanya muncul saat dipause) --- */}
        {!isRunning && timeLeft > 0 && !disabled && (
          <>
            {/* Tombol Reset Waktu */}
            <button
              onClick={handleReset}
              title="Reset Waktu" // Tooltip
              className="p-2 rounded-full bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white transition duration-200 ease-in-out"
            >
              {/* Ikon Reset (contoh: Refresh) */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l5 5M20 20l-5-5M4 20h5v-5M20 4h-5v5" /> {/* Icon Refresh (Adjust as needed) */}
              </svg>
            </button>

            {/* Tombol Game Baru (Hanya jika prop onNewGame ada) */}
            {onNewGame && (
              <button
                onClick={onNewGame}
                title="Game Baru" // Tooltip
                className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white transition duration-200 ease-in-out"
              >
                {/* Ikon Game Baru (contoh: Plus/Settings/Replay) */}
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /> {/* Icon Plus Circle (Adjust as needed) */}
                 </svg>
              </button>
            )}
          </>
        )}
        {/* --- END: Tombol Reset dan Game Baru --- */}

      </div>
      {/* --- END: Button Controls Area --- */}
    </div>
  );
}