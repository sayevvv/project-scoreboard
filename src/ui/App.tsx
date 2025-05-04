import { useState, useEffect, useCallback } from 'react';
import './App.css';
import PlayerCard from './components/PlayerCard';
import Timer from './components/Timer';
import SetupModal from './components/SetupModal';
import SplashScreen from './components/SplashScreen';

// Helper function to format time (can be shared or kept here)
const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00"; // Return default format for invalid input
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60); // Use Math.floor for safety
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const SPLASH_VISIBLE_DURATION = 1500; // 2 detik splash terlihat jelas
const FADE_DURATION = 800;         


export default function App() {
     // --- Splash Screen State ---
     const [isSplashVisible, setIsSplashVisible] = useState(true);
     const [isSplashFading, setIsSplashFading] = useState(false);

    // --- Game Setup States ---
    const [maxScore, setMaxScore] = useState(50);
    const [maxFoul, setMaxFoul] = useState(5);
    const [player1, setPlayer1] = useState("Pemain 1");
    const [player2, setPlayer2] = useState("Pemain 2");
    const [playerFrom1, setPlayerFrom1] = useState("");
    const [playerFrom2, setPlayerFrom2] = useState("");
    const [initialDuration, setInitialDuration] = useState(1200); // Renamed from duration

    // --- Game State ---
    const [score1, setScore1] = useState(0);
    const [score2, setScore2] = useState(0);
    const [foul1, setFoul1] = useState(0);
    const [foul2, setFoul2] = useState(0);
    const [gameEnded, setGameEnded] = useState(false);
    const [winner, setWinner] = useState<string | null>(null);
    const [endReason, setEndReason] = useState<string>("");
    const [elapsedTime, setElapsedTime] = useState<number>(0); // State to store actual game duration

    // --- Timer State (Lifted from Timer component) ---
    const [timeLeft, setTimeLeft] = useState(initialDuration);
    const [isRunning, setIsRunning] = useState(false);
    const [timerEverStarted, setTimerEverStarted] = useState(false); // NEW: Track if timer was ever started

    // --- UI State ---
    const [showSetup, setShowSetup] = useState(true);
    // New state for confirmation alert
    const [showEndConfirmation, setShowEndConfirmation] = useState(false);

    // --- useEffect untuk Mengelola Splash Screen ---
    useEffect(() => {
        // Timer untuk mulai fade-out
        const fadeTimer = setTimeout(() => {
          setIsSplashFading(true); // Memicu animasi fade-out
  
          // Timer untuk benar-benar menyembunyikan splash screen setelah fade selesai
          const unmountTimer = setTimeout(() => {
            setIsSplashVisible(false); // Splash screen tidak dirender lagi
          }, FADE_DURATION); // Tunggu sesuai durasi fade
  
          // Cleanup untuk unmountTimer jika komponen App unmount sebelum selesai
          return () => clearTimeout(unmountTimer);
  
        }, SPLASH_VISIBLE_DURATION); // Tunggu sebelum mulai fade
  
        // Cleanup untuk fadeTimer jika komponen App unmount sebelum selesai
        return () => clearTimeout(fadeTimer);
  
      }, []); // [] berarti hanya dijalankan sekali saat mount

    // --- Game Logic Functions ---

    // Function to end the game
    const endGame = useCallback((winnerName: string | null, reason: string) => {
        if (gameEnded) return; // Prevent multiple calls

        const elapsed = initialDuration - timeLeft; // Calculate elapsed time
        setElapsedTime(elapsed < 0 ? 0 : elapsed); // Store elapsed time (handle potential negative if reset happens)
        setIsRunning(false);        // Ensure timer stops
        setWinner(winnerName);
        setEndReason(reason);
        setGameEnded(true);
    }, [gameEnded, initialDuration, timeLeft]); // Added dependencies

    // New function to handle manual game end
    const handleManualGameEnd = useCallback(() => {
        // Determine winner based on current score
        let finalWinner: string | null = null;
        let finalReason = "Permainan diselesaikan";
        
        if (score1 > score2) {
            finalWinner = player1;
            finalReason += " dengan skor lebih tinggi";
        } else if (score2 > score1) {
            finalWinner = player2;
            finalReason += " dengan skor lebih tinggi";
        } else {
            finalReason += " dengan skor seri";
        }
        
        endGame(finalWinner, finalReason);
        setShowEndConfirmation(false); // Close the confirmation dialog
    }, [score1, score2, player1, player2, endGame]);

    // Handle setup submission
    const handleSetupSubmit = useCallback(({
        name1, name2, from1, from2, score, fouls, time
    }: {
        name1: string; name2: string; from1: string; from2: string; score: number; fouls: number; time: number;
    }) => {
        const newDuration = time * 60;
        setPlayer1(name1 || "Pemain 1");
        setPlayer2(name2 || "Pemain 2");
        setPlayerFrom1(from1 || "");
        setPlayerFrom2(from2 || "");
        setMaxScore(score);
        setMaxFoul(fouls);
        setInitialDuration(newDuration);

        // Reset game state completely
        setScore1(0);
        setScore2(0);
        setFoul1(0);
        setFoul2(0);
        setGameEnded(false);
        setWinner(null);
        setEndReason("");
        setElapsedTime(0);
        setTimeLeft(newDuration); // Reset timer display
        setIsRunning(false);      // Ensure timer is paused
        setTimerEverStarted(false); // Reset timer started flag
        setShowSetup(false);
    }, []); // Dependencies are constants or setters, so empty array is fine

    // Handle score update logic
    const updateScore = useCallback((player: 1 | 2, points: number) => {
        // --- GUARD: Only allow score changes if timer has started and game not ended ---
        if (!timerEverStarted || gameEnded) {
            console.log("Cannot change score: Timer not started or game ended.");
            return;
        }

        if (player === 1) {
            setScore1(currentScore => {
                const newScore = currentScore + points;
                if (newScore >= maxScore) {
                    endGame(player1, `Mencapai skor maksimal (${maxScore})`);
                }
                return newScore;
            });
        } else {
            setScore2(currentScore => {
                const newScore = currentScore + points;
                if (newScore >= maxScore) {
                    endGame(player2, `Mencapai skor maksimal (${maxScore})`);
                }
                return newScore;
            });
        }
    }, [timerEverStarted, gameEnded, maxScore, player1, player2, endGame]); // Added dependencies

    // Handle foul update logic
    const updateFouls = useCallback((player: 1 | 2, change: number) => {
         // --- GUARD: Only allow foul changes if timer has started, game not ended, and fouls enabled ---
        if (!timerEverStarted || gameEnded || maxFoul <= 0) {
             console.log("Cannot change fouls: Timer not started, game ended, or fouls disabled.");
            return;
        }

        if (player === 1) {
            setFoul1(currentFoul => {
                const newFoul = Math.max(0, currentFoul + change); // Ensure fouls don't go below 0
                if (newFoul >= maxFoul) {
                    endGame(player2, `${player1} mencapai pelanggaran maksimal (${maxFoul})`);
                }
                return newFoul;
            });
        } else {
             setFoul2(currentFoul => {
                const newFoul = Math.max(0, currentFoul + change);
                if (newFoul >= maxFoul) {
                    endGame(player1, `${player2} mencapai pelanggaran maksimal (${maxFoul})`);
                }
                return newFoul;
            });
        }
    }, [timerEverStarted, gameEnded, maxFoul, player1, player2, endGame]); // Added dependencies


    // Keyboard handling
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Ignore if typing in input fields or game ended
            if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || gameEnded) {
                return;
            }

            // --- GUARD: Check if timer has started for score keys ---
             if (!timerEverStarted && ['1', '2', '3', '8', '9', '0'].includes(event.key)) {
                console.log("Timer not started, score keys disabled.");
                return; // Don't process score keys if timer hasn't run
            }


            switch (event.key) {
                case '1': updateScore(1, 1); break;
                case '2': updateScore(1, 2); break;
                case '3': updateScore(1, 3); break;
                case '8': updateScore(2, 1); break;
                case '9': updateScore(2, 2); break;
                case '0': updateScore(2, 3); break;
                // Add foul keys if needed, e.g., 'f' for P1 foul, 'j' for P2 foul
                // case 'f': updateFouls(1, 1); break;
                // case 'j': updateFouls(2, 1); break;
                default: break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
        // Depend on updateScore which includes timerEverStarted and gameEnded
    }, [gameEnded, updateScore, updateFouls, timerEverStarted]);


     // Timer countdown logic (moved from Timer component)
    useEffect(() => {
        let interval: number | undefined;

        if (isRunning && timeLeft > 0 && !gameEnded) {
            interval = window.setInterval(() => {
                setTimeLeft(prev => {
                    const nextTime = prev - 1;
                    if (nextTime <= 0) {
                        clearInterval(interval);
                        setIsRunning(false); // Stop running state
                        setElapsedTime(initialDuration); // Full duration elapsed
                        // --- Determine winner based on score when time runs out ---
                        if (!gameEnded) { // Check again to prevent race condition
                            let finalWinner: string | null = null;
                            let finalReason = "Waktu habis";
                            if (score1 > score2) {
                                finalWinner = player1;
                                finalReason += " dengan skor lebih tinggi";
                            } else if (score2 > score1) {
                                finalWinner = player2;
                                finalReason += " dengan skor lebih tinggi";
                            } else {
                                finalReason += " dengan skor seri";
                            }
                            endGame(finalWinner, finalReason); // Call endGame which handles setting state
                        }
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
    }, [isRunning, gameEnded, initialDuration, timeLeft]); // Added dependencies

    // Effect to reset timer display when initialDuration changes (new game setup)
    useEffect(() => {
        setTimeLeft(initialDuration);
        setIsRunning(false); // Ensure it's paused on reset
        setTimerEverStarted(false); // Reset this flag too
    }, [initialDuration]);

    // Function to handle the first time the timer starts
    const handleTimerFirstStart = useCallback(() => {
        if (!timerEverStarted) {
            setTimerEverStarted(true);
        }
    }, [timerEverStarted]);


    // Callback for Timer component to trigger new game setup
    const handleNewGameFromTimer = useCallback(() => {
        setShowSetup(true);
    }, []);

    // --- Render Logic ---
    if (isSplashVisible) {
        // Selama splash screen masih harus terlihat (termasuk saat fading)
        return <SplashScreen isFading={isSplashFading} />;
    }

    if (showSetup) {
        return <SetupModal onSubmit={handleSetupSubmit} />;
    }

    const canModifyScore = timerEverStarted && !gameEnded; // Determine if scores/fouls can be modified

    return (
        <div className="min-h-screen bg-gradient-to-bl  from-red-950 via-black to-blue-950 flex flex-col items-center justify-around py-10 text-white overflow-hidden px-4 sm:px-10 md:px-20 lg:px-60">
            {/* Winner Modal */}
            {gameEnded && (
                <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 p-6 md:p-8 rounded-xl text-center max-w-lg w-full shadow-2xl border border-gray-700 flex flex-col max-h-[90vh]">
                        {/* Top Section: Game Result & Buttons */}
                        <div>
                            <h2 className="text-3xl font-bold mb-4 text-white">Pertandingan Selesai!</h2>
                             <div className="bg-gradient-to-r from-blue-600 via-purple-900 to-red-600 p-4 rounded-lg mb-4 text-white">
                                {winner ? (
                                    <>
                                        <p className="text-2xl font-semibold mb-2">{winner} Menang!</p>
                                        <p className="text-lg text-gray-300">{endReason}</p>
                                    </>
                                ) : (
                                    <p className="text-2xl font-semibold">Hasil Seri!</p>
                                )}
                                <p className="text-sm text-gray-400 mt-1">{!winner ? endReason : ''}</p>
                                {/* --- NEW: Display Elapsed Time --- */}
                                <p className="text-lg mt-3 text-gray-300 font-semibold">
                                    Durasi Permainan: {formatTime(elapsedTime)}
                                </p>
                             </div>


                            {/* Final Scores */}
                            <div className="grid grid-cols-2 gap-4 text-center mt-6 mb-6">
                                <div className="bg-red-800 bg-opacity-40 p-3 rounded-lg border border-red-700">
                                    <h3 className="font-bold text-red-300">{player1}</h3>
                                    <p className="text-3xl font-bold text-white">{score1}</p>
                                    {maxFoul > 0 && <p className="text-sm text-red-400">Pelanggaran: {foul1}</p>}
                                </div>
                                <div className="bg-blue-800 bg-opacity-40 p-3 rounded-lg border border-blue-700">
                                    <h3 className="font-bold text-blue-300">{player2}</h3>
                                    <p className="text-3xl font-bold text-white">{score2}</p>
                                    {maxFoul > 0 && <p className="text-sm text-blue-400">Pelanggaran: {foul2}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Bottom Section: Action Buttons */}
                        <div className="mt-6 pt-4 border-t border-gray-700 flex flex-col sm:flex-row justify-center gap-3 flex-shrink-0">
                            <button
                                onClick={() => setShowSetup(true)}
                                className="mb-4 px-4 py-2 rounded-lg border border-blue-600 text-blue-300 hover:bg-blue-900 hover:text-white transition"
                            >
                                Main Lagi
                            </button>
                            <button
                                onClick={() => setGameEnded(false)} // Just close modal, keep state
                                className="mb-4 px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-900 hover:text-white transition"
                            >
                                Tutup (Lihat Skor Akhir)
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* End Game Confirmation Alert */}
            {showEndConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 p-6 rounded-xl text-center max-w-md w-full shadow-2xl border border-gray-700">
                        <h3 className="text-xl font-bold mb-4 text-yellow-400">Konfirmasi Selesaikan Game</h3>
                        <p className="text-white mb-6">Apakah Anda yakin ingin menyelesaikan permainan sekarang?</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-3">
                            <button
                                onClick={handleManualGameEnd}
                                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition duration-200 w-full sm:w-auto"
                            >
                                Ya, Selesaikan
                            </button>
                            <button
                                onClick={() => setShowEndConfirmation(false)}
                                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition duration-200 w-full sm:w-auto"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Timer Component */}
            <Timer
                timeLeft={timeLeft}
                isRunning={isRunning}
                initialDuration={initialDuration} // Pass initial duration for reset
                setTimeLeft={setTimeLeft}       // Pass setter
                setIsRunning={setIsRunning}     // Pass setter
                disabled={gameEnded}            // Disable controls when game ends
                onNewGame={handleNewGameFromTimer}
                onTimerFirstStart={handleTimerFirstStart} // Pass callback for first start
            />

            {/* Player Cards Area */}
             <div className="flex flex-col md:flex-row justify-center items-start mt-5 w-full gap-6 md:gap-12 lg:gap-80">
                <PlayerCard
                    name={player1}
                    from={playerFrom1}
                    score={score1}
                    setScore={(newScore) => {
                        // Use the canModifyScore flag
                        if (canModifyScore) {
                            setScore1(newScore);
                            if (newScore >= maxScore) {
                                endGame(player1, `Mencapai skor maksimal (${maxScore})`);
                            }
                        }
                    }}
                    addScore={(points) => updateScore(1, points)} // Pass direct update function
                    fouls={foul1}
                    setFouls={(newFoul) => { // Keep direct set for + / - buttons if needed in PlayerCard
                         if (canModifyScore && maxFoul > 0) {
                            setFoul1(newFoul);
                             if (newFoul >= maxFoul) {
                                endGame(player2, `${player1} mencapai pelanggaran maksimal (${maxFoul})`);
                            }
                        }
                    }}
                    addFoul={(change) => updateFouls(1, change)} // Pass direct update function
                    maxFoul={maxFoul}
                    disabled={!canModifyScore} // Disable based on flag
                    gradient="from-black to-red-500"
                />

                <PlayerCard
                    name={player2}
                    from={playerFrom2}
                    score={score2}
                     setScore={(newScore) => {
                         if (canModifyScore) {
                            setScore2(newScore);
                            if (newScore >= maxScore) {
                                endGame(player2, `Mencapai skor maksimal (${maxScore})`);
                            }
                        }
                    }}
                    addScore={(points) => updateScore(2, points)}
                    fouls={foul2}
                    setFouls={(newFoul) => {
                         if (canModifyScore && maxFoul > 0) {
                            setFoul2(newFoul);
                             if (newFoul >= maxFoul) {
                                endGame(player1, `${player2} mencapai pelanggaran maksimal (${maxFoul})`);
                            }
                        }
                    }}
                    addFoul={(change) => updateFouls(2, change)}
                    maxFoul={maxFoul}
                    disabled={!canModifyScore}
                    gradient="from-black to-blue-500"
                />
            </div>

            {/* Bottom Controls */}
             <div className="flex flex-col items-center mt-8 w-full max-w-lg">
                <button
                    onClick={() => setShowEndConfirmation(true)}
                    className="mb-4 px-4 py-2 rounded-lg border border-red-600 text-red-300 hover:bg-red-900 hover:text-white transition"
                    disabled={gameEnded || !timerEverStarted}
                >
                    Selesaikan Game
                </button>
                <header className="text-center">
                    <p className="text-sm text-gray-400">
                        Skor Maksimal: {maxScore} {maxFoul > 0 && `• Pelanggaran Maksimal: ${maxFoul}`}
                    </p>
                     <p className="text-xs text-gray-500 mt-1">
                        P1: '1' (+1), '2' (+2), '3' (+3) | P2: '8' (+1), '9' (+2), '0' (+3) | Full Screen : 'F11' | Escape: 'Esc'
                    </p>
                </header>
            </div>
        </div>
    );
}