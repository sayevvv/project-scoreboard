import { useState } from 'react';

type Props = {
    timeLeft: number;             // Receive timeLeft from App
    isRunning: boolean;           // Receive isRunning from App
    initialDuration: number;      // Receive initial duration for reset
    setTimeLeft: (value: number | ((prev: number) => number)) => void; // Setter from App
    setIsRunning: (value: boolean | ((prev: boolean) => boolean)) => void; // Setter from App
    disabled?: boolean;           // To disable controls externally (e.g., game ended)
    onNewGame?: () => void;       // Callback for new game button
    onTimerFirstStart?: () => void; // NEW: Callback when timer starts for the first time
};

// Helper function to format time (can be removed if App has its own)
const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};


export default function Timer({
    timeLeft,
    isRunning,
    initialDuration,
    setTimeLeft,
    setIsRunning,
    disabled = false,
    onNewGame,
    onTimerFirstStart // Receive the new prop
}: Props) {
    // New state for confirmation alerts
    const [showResetConfirmation, setShowResetConfirmation] = useState(false);
    const [showNewGameConfirmation, setShowNewGameConfirmation] = useState(false);

    // Toggle timer Play/Pause
    const toggleTimer = () => {
        if (!disabled) {
            // If timer is not running and is about to start, trigger the callback
            if (!isRunning && timeLeft > 0 && onTimerFirstStart) {
                 onTimerFirstStart(); // Notify App that timer has started at least once
            }

            // If time is up and we press play again, reset time (optional, App handles this better now)
            // if (timeLeft <= 0 && !isRunning) {
            //     setTimeLeft(initialDuration);
            // }

            setIsRunning(prev => !prev); // Toggle running state via App's setter
        }
    };

    // Function to reset timer to the initial duration (when paused)
    const handleReset = () => {
        if (!disabled && !isRunning) { // Only allow reset when paused
            setTimeLeft(initialDuration);
            setShowResetConfirmation(false); // Close confirmation dialog
        }
    };

    // Function to handle new game confirmation
    const handleNewGame = () => {
        if (onNewGame) {
            onNewGame();
            setShowNewGameConfirmation(false); // Close confirmation dialog
        }
    };

    return (
        <>
            {/* Reset Timer Confirmation Alert */}
            {showResetConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 p-6 rounded-xl text-center max-w-md w-full shadow-2xl border border-gray-700">
                        <h3 className="text-xl font-bold mb-4 text-yellow-400">Konfirmasi Reset Timer</h3>
                        <p className="text-white mb-6">Apakah Anda yakin ingin mengatur ulang waktu?</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-3">
                            <button
                                onClick={handleReset}
                                className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition duration-200 w-full sm:w-auto"
                            >
                                Ya, Reset
                            </button>
                            <button
                                onClick={() => setShowResetConfirmation(false)}
                                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition duration-200 w-full sm:w-auto"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* New Game Confirmation Alert */}
            {showNewGameConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 p-6 rounded-xl text-center max-w-md w-full shadow-2xl border border-gray-700">
                        <h3 className="text-xl font-bold mb-4 text-blue-400">Konfirmasi Game Baru</h3>
                        <p className="text-white mb-6">Apakah Anda yakin ingin memulai game baru? Semua data game saat ini akan hilang.</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-3">
                            <button
                                onClick={handleNewGame}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200 w-full sm:w-auto"
                            >
                                Ya, Game Baru
                            </button>
                            <button
                                onClick={() => setShowNewGameConfirmation(false)}
                                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition duration-200 w-full sm:w-auto"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className={`flex justify-between items-center w-full max-w-md mx-auto text-center py-2 px-4 rounded-full bg-gray-900 text-white shadow-lg border border-gray-700 ${disabled ? 'opacity-70' : ''}`}>
                {/* Time Display */}
                <div className="text-2xl sm:text-3xl font-mono px-4 sm:px-6 py-2">
                    {formatTime(timeLeft)}
                </div>

                {/* Button Controls Area */}
                <div className="flex items-center gap-2">
                    {/* Main Play/Pause Button */}
                    <button
                        onClick={toggleTimer}
                        // Disable if externally disabled OR if time is 0 and not running
                        disabled={disabled || (timeLeft <= 0 && !isRunning)}
                        title={isRunning ? "Jeda" : "Mulai"}
                        className={`p-2 rounded-full text-base sm:text-lg font-semibold transition duration-200 ease-in-out ${
                            isRunning
                                ? "bg-orange-500 hover:bg-orange-600 active:bg-orange-700"
                                : "bg-green-500 hover:bg-green-600 active:bg-green-700"
                        } text-white ${disabled || (timeLeft <= 0 && !isRunning) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                        {isRunning ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v4a1 1 0 11-2 0V8z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                        )}
                    </button>

                    {/* Reset and New Game Buttons (only show when paused, time > 0, and not disabled) */}
                    {!isRunning && timeLeft > 0 && !disabled && (
                        <>
                            {/* Reset Time Button */}
                            <button
                                onClick={() => setShowResetConfirmation(true)}
                                title="Reset Waktu"
                                className="p-2 rounded-full bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white transition duration-200 ease-in-out"
                            >
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l5 5M20 20l-5-5M4 20h5v-5M20 4h-5v5" />
                                </svg>
                            </button>

                            {/* New Game Button */}
                            {onNewGame && (
                                <button
                                    onClick={() => setShowNewGameConfirmation(true)}
                                    title="Game Baru"
                                    className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white transition duration-200 ease-in-out"
                                >
                                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}