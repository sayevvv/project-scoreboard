import { useState } from 'react';

type Props = {
    timeLeft: number;
    isRunning: boolean;
    initialDuration: number;
    setTimeLeft: (value: number | ((prev: number) => number)) => void;
    setIsRunning: (value: boolean | ((prev: boolean) => boolean)) => void;
    disabled?: boolean;
    onNewGame?: () => void;
    onTimerFirstStart?: () => void;
};

// Fungsi bantuan untuk format waktu
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
    onTimerFirstStart
}: Props) {
    const [showResetConfirmation, setShowResetConfirmation] = useState(false);
    const [showNewGameConfirmation, setShowNewGameConfirmation] = useState(false);

    const toggleTimer = () => {
        if (!disabled) {
            if (!isRunning && timeLeft > 0 && onTimerFirstStart) {
                onTimerFirstStart();
            }
            setIsRunning(prev => !prev);
        }
    };

    const handleReset = () => {
        if (!disabled && !isRunning) {
            setTimeLeft(initialDuration);
            setShowResetConfirmation(false);
        }
    };

    const handleNewGame = () => {
        if (onNewGame) {
            onNewGame();
            setShowNewGameConfirmation(false);
        }
    };

    return (
        <>
            {/* Alert Konfirmasi Reset Timer */}
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

            {/* Alert Konfirmasi Game Baru */}
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

            {/* BARU: Kontainer Utama Timer dengan flex-col */}
            <div className={`flex flex-col items-center w-full max-w-xl mx-auto text-center py-3 ${disabled ? 'opacity-70' : ''}`}>
                {/* Tampilan Waktu (diperbesar) */}
                <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-mono font-bold text-white mb-4 px-4 py-2 bg-gray-900 rounded-xl shadow-lg border border-gray-700 w-auto min-w-[200px] sm:min-w-[250px] md:min-w-[300px]">
                    {formatTime(timeLeft)}
                </div>

                {/* Area Kontrol Tombol (di bawah waktu) */}
                <div className={`flex items-center justify-center gap-2 sm:gap-3 md:gap-4 p-3 rounded-full bg-gray-900 shadow-lg border border-gray-700 w-auto`}>
                    {/* Tombol Play/Pause Utama */}
                    <button
                        onClick={toggleTimer}
                        disabled={disabled || (timeLeft <= 0 && !isRunning)}
                        title={isRunning ? "Jeda" : "Mulai"}
                        className={`p-2 sm:p-3 rounded-full text-base sm:text-lg font-semibold transition duration-200 ease-in-out ${
                            isRunning
                                ? "bg-orange-500 hover:bg-orange-600 active:bg-orange-700"
                                : "bg-green-500 hover:bg-green-600 active:bg-green-700"
                        } text-white ${disabled || (timeLeft <= 0 && !isRunning) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                        {isRunning ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v4a1 1 0 11-2 0V8z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                        )}
                    </button>

                    {/* Tombol Reset dan Game Baru (hanya tampil saat dijeda, waktu > 0, dan tidak disabled) */}
                    {!isRunning && timeLeft > 0 && !disabled && (
                        <>
                            {/* Tombol Reset Waktu */}
                            <button
                                onClick={() => setShowResetConfirmation(true)}
                                title="Reset Waktu"
                                className="p-2 sm:p-3 rounded-full bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white transition duration-200 ease-in-out"
                            >
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l5 5M20 20l-5-5M4 20h5v-5M20 4h-5v5" /> {/* Ini ikon reset yang lebih umum, bisa diganti jika ada yang lebih sesuai */}
                                    {/* Alternatif ikon reset (lebih mirip refresh):
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m-15.357-2a8.001 8.001 0 0015.357 2M15 15h-5.418" />
                                    */}
                                </svg>
                            </button>

                            {/* Tombol Game Baru */}
                            {onNewGame && (
                                <button
                                    onClick={() => setShowNewGameConfirmation(true)}
                                    title="Game Baru"
                                    className="p-2 sm:p-3 rounded-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white transition duration-200 ease-in-out"
                                >
                                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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