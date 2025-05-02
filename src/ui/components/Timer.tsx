import { useState, useEffect } from 'react';

type Props = {
  duration: number; // in seconds
  onTimeEnd?: () => void;
  disabled?: boolean;
};

export default function Timer({ duration, onTimeEnd, disabled = false }: Props) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  
  // Format time to MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Reset timer
  const resetTimer = () => {
    if (!disabled) {
      setTimeLeft(duration);
      setIsRunning(false);
    }
  };
  
  // Toggle timer
  const toggleTimer = () => {
    if (!disabled) {
      setIsRunning(prev => !prev);
    }
  };
  
  // Handle timer countdown
  useEffect(() => {
    let interval: number | undefined;
    
    if (isRunning && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            if (onTimeEnd) onTimeEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, onTimeEnd]);
  
  return (
    <div className="flex justify-between w-full text-center py-2 rounded-full bg-black text-white shadow-lg">
      <div className="text-3xl font-mono border px-10 py-3 rounded-full">{formatTime(timeLeft)}</div>
      <div className="flex gap-3 justify-center">
        <button 
          onClick={toggleTimer}
          disabled={disabled}
          className={`px-4 rounded-full ${
            isRunning 
              ? "bg-orange-500 hover:bg-orange-600" 
              : "bg-green-500 hover:bg-green-600"
          } text-white ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isRunning ? "Jeda" : "Mulai"}
        </button>
        <button 
          onClick={resetTimer}
          disabled={disabled}
          className={`px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          Reset
        </button>
      </div>
    </div>
  );
}