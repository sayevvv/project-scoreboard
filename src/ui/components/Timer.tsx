// components/Timer.tsx
import { useState, useEffect, useRef, useCallback } from 'react';

// Type Props tidak berubah
type Props = {
    timeLeft: number;
    centisecondsLeft?: number;
    isRunning: boolean;
    initialDuration: number;
    setTimeLeft: (value: number | ((prev: number) => number)) => void;
    setIsRunning: (value: boolean | ((prev: boolean) => boolean)) => void;
    disabled?: boolean;
    onNewGame?: () => void;
    onTimerFirstStart?: () => void;
    onChangeTime?: (newTimeInSeconds: number) => void;
    onAdjustTime?: (amount: number) => void;
    formatTime: (seconds: number, centiseconds?: number) => string;
};

// Konstanta untuk logika tekan lama
const LONG_PRESS_DELAY = 500; // ms
const RAPID_CHANGE_INTERVAL = 80; // ms

export default function Timer({
    timeLeft,
    centisecondsLeft,
    isRunning,
    initialDuration,
    setTimeLeft,
    setIsRunning,
    disabled = false,
    onNewGame,
    onChangeTime,
    onAdjustTime,
    formatTime,
    onTimerFirstStart 
}: Props) {
    // State untuk modal, tidak berubah
    const [showResetConfirmation, setShowResetConfirmation] = useState(false);
    const [showNewGameConfirmation, setShowNewGameConfirmation] = useState(false);
    const [showChangeTimeModal, setShowChangeTimeModal] = useState(false);
    const [newTimeInputMinutes, setNewTimeInputMinutes] = useState<string>('0');
    const [newTimeInputSeconds, setNewTimeInputSeconds] = useState<string>('0');
    
    // Refs untuk logika tekan lama, tidak berubah
    const longPressTimeoutRef = useRef<number | null>(null);
    const rapidChangeIntervalRef = useRef<number | null>(null);

    // Semua fungsi handler (logika) tidak berubah dari versi sebelumnya
     const handlePlusMinusAdjust = useCallback((amount: number) => {
        // Hapus kondisi '|| isRunning' agar fungsi ini bisa berjalan kapan saja
        if (!onAdjustTime) return; 
        onAdjustTime(amount);
    }, [onAdjustTime]);

    const stopLongPress = useCallback(() => {
        if (longPressTimeoutRef.current) clearTimeout(longPressTimeoutRef.current);
        if (rapidChangeIntervalRef.current) clearInterval(rapidChangeIntervalRef.current);
        longPressTimeoutRef.current = null;
        rapidChangeIntervalRef.current = null;
    }, []);

    const startLongPress = useCallback((amount: number) => {
        handlePlusMinusAdjust(amount); 
        longPressTimeoutRef.current = window.setTimeout(() => {
            rapidChangeIntervalRef.current = window.setInterval(() => {
                handlePlusMinusAdjust(amount);
            }, RAPID_CHANGE_INTERVAL);
        }, LONG_PRESS_DELAY);
    }, [handlePlusMinusAdjust]);

    useEffect(() => {
        return () => stopLongPress();
    }, [stopLongPress]);

    useEffect(() => {
        if (showChangeTimeModal) {
            const currentMinutes = Math.floor(timeLeft / 60);
            const currentSeconds = Math.floor(timeLeft % 60);
            setNewTimeInputMinutes(currentMinutes.toString());
            setNewTimeInputSeconds(currentSeconds.toString());
        }
    }, [timeLeft, showChangeTimeModal]);

   const toggleTimer = () => {
        if (disabled) return;
        if ((timeLeft <= 0 && (centisecondsLeft ?? 0) <= 0) && !isRunning) return;

        if (!isRunning && onTimerFirstStart) {
            onTimerFirstStart();
        }
        
        setIsRunning(prev => !prev);
    };
    const handleResetTime = () => {
        if (!disabled && !isRunning) {
            if (onChangeTime) onChangeTime(initialDuration);
            else setTimeLeft(initialDuration);
            setShowResetConfirmation(false);
        }
    };

    const handleNewGame = () => {
        if (onNewGame) {
            onNewGame();
            setShowNewGameConfirmation(false);
        }
    };

    const openChangeTimeModal = () => {
        if (!isRunning && !disabled) setShowChangeTimeModal(true);
    };

    const handleChangeTimeSubmit = () => {
        const minutes = parseInt(newTimeInputMinutes, 10);
        const seconds = parseInt(newTimeInputSeconds, 10);
        if (isNaN(minutes) || minutes < 0 || isNaN(seconds) || seconds < 0 || seconds > 59) {
            alert("Masukkan jumlah menit dan detik yang valid.");
            return;
        }
        if (onChangeTime) {
            onChangeTime((minutes * 60) + seconds);
            setShowChangeTimeModal(false);
        }
    };

    return (
        <>
            {/* --- PERBAIKAN: Mengembalikan JSX Modal yang Hilang --- */}
            {showResetConfirmation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm md:backdrop-blur p-4">
                    <div className="w-full max-w-md rounded-xl border border-gray-700 bg-gray-900 p-6 text-center shadow-2xl">
                        <h3 className="text-xl font-bold text-yellow-400 mb-4">Konfirmasi Reset Timer</h3>
                        <p className="text-white mb-6">Apakah Anda yakin ingin mengatur ulang waktu ke durasi awal ({formatTime(initialDuration)})?</p>
                        <div className="flex flex-col justify-center gap-3 sm:flex-row">
                            <button onClick={handleResetTime} className="w-full rounded-lg bg-yellow-600 px-6 py-2 text-white transition duration-200 hover:bg-yellow-700 sm:w-auto">Ya, Reset</button>
                            <button onClick={() => setShowResetConfirmation(false)} className="w-full rounded-lg bg-gray-600 px-6 py-2 text-white transition duration-200 hover:bg-gray-700 sm:w-auto">Batal</button>
                        </div>
                    </div>
                </div>
            )}
            {showNewGameConfirmation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm md:backdrop-blur p-4">
                    <div className="w-full max-w-md rounded-xl border border-gray-700 bg-gray-900 p-6 text-center shadow-2xl">
                        <h3 className="text-xl font-bold text-blue-400 mb-4">Konfirmasi Game Baru</h3>
                        <p className="text-white mb-6">Apakah Anda yakin ingin memulai game baru? Semua data game saat ini akan hilang.</p>
                        <div className="flex flex-col justify-center gap-3 sm:flex-row">
                            <button onClick={handleNewGame} className="w-full rounded-lg bg-blue-600 px-6 py-2 text-white transition duration-200 hover:bg-blue-700 sm:w-auto">Ya, Game Baru</button>
                            <button onClick={() => setShowNewGameConfirmation(false)} className="w-full rounded-lg bg-gray-600 px-6 py-2 text-white transition duration-200 hover:bg-gray-700 sm:w-auto">Batal</button>
                        </div>
                    </div>
                </div>
            )}
            {showChangeTimeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm md:backdrop-blur p-4">
                    <div className="w-full max-w-md rounded-xl border border-gray-700 bg-gray-900 p-6 text-center shadow-2xl">
                        <h3 className="text-xl font-bold text-teal-400 mb-4">Ubah Waktu Permainan</h3>
                        <p className="text-white mb-3">Masukkan waktu baru (Menit : Detik):</p>
                        <div className="flex items-center justify-center gap-2 mb-6">
                            <input type="number" value={newTimeInputMinutes} onChange={(e) => setNewTimeInputMinutes(e.target.value)} className="w-20 rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-center text-white focus:border-teal-500 focus:ring-teal-500" placeholder="MM" min="0"/>
                            <span className="text-xl text-white">:</span>
                            <input type="number" value={newTimeInputSeconds} onChange={(e) => setNewTimeInputSeconds(e.target.value)} className="w-20 rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-center text-white focus:border-teal-500 focus:ring-teal-500" placeholder="SS" min="0" max="59"/>
                        </div>
                        <div className="flex flex-col justify-center gap-3 sm:flex-row">
                            <button onClick={handleChangeTimeSubmit} className="w-full rounded-lg bg-teal-600 px-6 py-2 text-white transition duration-200 hover:bg-teal-700 sm:w-auto">Simpan Waktu</button>
                            <button onClick={() => setShowChangeTimeModal(false)} className="w-full rounded-lg bg-gray-600 px-6 py-2 text-white transition duration-200 hover:bg-gray-700 sm:w-auto">Batal</button>
                        </div>
                    </div>
                </div>
            )}

            <div className={`flex w-full flex-col items-center mx-auto text-center py-3 ${disabled ? 'opacity-70' : ''}`}>
                {/* Tampilan Waktu dengan border */}
                <div className="tabular-nums text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-mono font-bold text-white mb-3 px-4 py-2 w-full rounded-2xl border border-slate-600/70 bg-black/40">
                    {formatTime(timeLeft, centisecondsLeft)}
                </div>

                {/* Kontainer kontrol utama tanpa border */}
                <div className="flex flex-col items-center justify-center w-full gap-3">
                    
                    {/* Baris 1: Kontrol Utama (+, -, Play/Pause) */}
                    <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-3.5">
                        {/* Tombol Kurang */}
                        <button
                            onMouseDown={() => startLongPress(-1)} onMouseUp={stopLongPress} onMouseLeave={stopLongPress}
                            onTouchStart={() => startLongPress(-1)} onTouchEnd={stopLongPress}
                            title="Kurangi 1 Detik"
                            // --- PERUBAHAN 1: Hapus 'isRunning' dari kondisi disabled ---
                            disabled={disabled}
                            className="p-2 sm:p-2.5 rounded-xl bg-gray-700 text-white transition hover:bg-gray-600 active:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                        </button>

                        {/* Tombol Utama Play/Pause (Logika tidak berubah) */}
                        <button
                            onClick={toggleTimer}
                            disabled={disabled || (timeLeft <= 0 && (centisecondsLeft ?? 0) <= 0 && !isRunning)}
                            title={isRunning ? "Jeda" : (timeLeft <= 0 && (centisecondsLeft ?? 0) <= 0 ? "Waktu Habis" : "Mulai")}
                            className={`p-2 sm:p-2.5 rounded-xl text-base sm:text-lg font-semibold transition duration-200 ease-in-out text-white ${
                                isRunning ? "bg-orange-500 hover:bg-orange-600" : (timeLeft <= 0 && (centisecondsLeft ?? 0) <= 0) ? "bg-gray-500" : "bg-green-500 hover:bg-green-600"
                            } ${disabled || (timeLeft <= 0 && (centisecondsLeft ?? 0) <= 0 && !isRunning) ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            {isRunning ? <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v4a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                                : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>}
                        </button>
                        
                        {/* Tombol Tambah */}
                        <button
                            onMouseDown={() => startLongPress(1)} onMouseUp={stopLongPress} onMouseLeave={stopLongPress}
                            onTouchStart={() => startLongPress(1)} onTouchEnd={stopLongPress}
                            title="Tambah 1 Detik"
                            // --- PERUBAHAN 2: Hapus 'isRunning' dari kondisi disabled ---
                            disabled={disabled}
                            className="p-2 sm:p-2.5 rounded-xl bg-gray-700 text-white transition hover:bg-gray-600 active:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>
                        </button>
                    </div>

                    {/* Baris 2: Kontrol Utilitas */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-3.5">
                        <button onClick={openChangeTimeModal} title="Ubah Waktu Permainan" 
                            // 4. Tombol dinonaktifkan saat timer berjalan atau jika game berakhir
                            disabled={isRunning || disabled}
                className="p-2 sm:p-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white transition disabled:opacity-50 disabled:cursor-not-allowed">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </button>
                        <button onClick={() => setShowResetConfirmation(true)} title={`Reset Waktu ke ${formatTime(initialDuration)}`} 
                             // 5. Tombol dinonaktifkan saat timer berjalan atau jika game berakhir
                            disabled={isRunning || disabled}
                className="p-2 sm:p-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white transition disabled:opacity-50 disabled:cursor-not-allowed">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l5 5M20 20l-5-5M4 20h5v-5M20 4h-5v5" /></svg>
                        </button>
                        {onNewGame && (
                            <button onClick={() => setShowNewGameConfirmation(true)} title="Game Baru" 
                                 // 6. Tombol dinonaktifkan saat timer berjalan atau jika game berakhir
                                disabled={isRunning || disabled}
                className="p-2 sm:p-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition disabled:opacity-50 disabled:cursor-not-allowed">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </button>
                        )}
                    </div>
                </div>
                 {/* --- PERUBAHAN UTAMA SELESAI --- */}
            </div>
        </>
    );
}