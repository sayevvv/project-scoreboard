import { useState, useEffect, useCallback } from "react";
import "./App.css";
import PlayerCard from "./components/PlayerCard"; // Pastikan komponen PlayerCard ada
import Timer from "./components/Timer"; // Pastikan komponen Timer ada
import SetupModal from "./components/SetupModal"; // Pastikan komponen SetupModal ada
import SplashScreen from "./components/SplashScreen"; // Pastikan komponen SplashScreen ada
import FloatingButton from "./components/FloatingButton"; // Pastikan komponen FloatingButton ada
import FullscreenToggleButton from "./components/FullScreenToggleButton";

// Fungsi bantuan untuk format waktu
const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
};

const SPLASH_VISIBLE_DURATION = 1500;
const FADE_DURATION = 800;

export default function App() {
  // --- State Splash Screen ---
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [isSplashFading, setIsSplashFading] = useState(false);

  // --- State Pengaturan Game ---
  const [maxScore, setMaxScore] = useState(50);
  const [maxFoul, setMaxFoul] = useState(5);
  const [player1, setPlayer1] = useState("Pemain 1");
  const [player2, setPlayer2] = useState("Pemain 2");
  const [playerFrom1, setPlayerFrom1] = useState("");
  const [playerFrom2, setPlayerFrom2] = useState("");
  const [initialDuration, setInitialDuration] = useState(1200);

  // --- State Game ---
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [foul1, setFoul1] = useState(0);
  const [foul2, setFoul2] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [endReason, setEndReason] = useState<string>("");
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [firstScorer, setFirstScorer] = useState<1 | 2 | null>(null); // BARU: State untuk pencetak skor pertama

  // --- State Timer ---
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [timerEverStarted, setTimerEverStarted] = useState(false);

  // --- State UI ---
  const [showSetup, setShowSetup] = useState(true);
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);

  // --- NEW: State for Player Controls Visibility (Lifted Up) ---
  const [showControls1, setShowControls1] = useState(true);
  const [showControls2, setShowControls2] = useState(true);

  // --- useEffect untuk Mengelola Splash Screen ---
  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsSplashFading(true);
      const unmountTimer = setTimeout(() => {
        setIsSplashVisible(false);
      }, FADE_DURATION);
      return () => clearTimeout(unmountTimer);
    }, SPLASH_VISIBLE_DURATION);
    return () => clearTimeout(fadeTimer);
  }, []);

  const toggleBothControls = useCallback(() => {
    setShowControls1((prev) => !prev);
    setShowControls2((prev) => !prev);
  }, []);
  // --- Fungsi Logika Game ---
  const endGame = useCallback(
    (winnerName: string | null, reason: string) => {
      if (gameEnded) return;

      const elapsed = initialDuration - timeLeft;
      setElapsedTime(elapsed < 0 ? 0 : elapsed);
      setIsRunning(false);
      setWinner(winnerName);
      setEndReason(reason);
      setGameEnded(true);
    },
    [gameEnded, initialDuration, timeLeft]
  );

  const handleManualGameEnd = useCallback(() => {
    let finalWinner: string | null = null;
    let finalReason = "Permainan diselesaikan";

    if (score1 > score2) {
      finalWinner = player1;
      finalReason += " dengan skor lebih tinggi";
    } else if (score2 > score1) {
      finalWinner = player2;
      finalReason += " dengan skor lebih tinggi";
    } else {
      // Skor sama
      if (firstScorer === 1) {
        finalWinner = player1;
        finalReason = `${player1} menang karena skor duluan (skor seri ${score1}-${score2})`;
      } else if (firstScorer === 2) {
        finalWinner = player2;
        finalReason = `${player2} menang karena skor duluan (skor seri ${score1}-${score2})`;
      } else {
        // Jika tidak ada yang skor duluan (misal, skor masih 0-0 dan belum ada yg input skor)
        finalReason += ` dengan skor seri (${score1}-${score2})`;
      }
    }
    endGame(finalWinner, finalReason);
    setShowEndConfirmation(false);
  }, [score1, score2, player1, player2, endGame, firstScorer]); // MODIFIKASI: Menambahkan firstScorer

  const handleSetupSubmit = useCallback(
    ({
      name1,
      name2,
      from1,
      from2,
      score,
      fouls,
      time,
    }: {
      name1: string;
      name2: string;
      from1: string;
      from2: string;
      score: number;
      fouls: number;
      time: number;
    }) => {
      const newDuration = time * 60;
      setPlayer1(name1 || "Pemain 1");
      setPlayer2(name2 || "Pemain 2");
      setPlayerFrom1(from1 || "");
      setPlayerFrom2(from2 || "");
      setMaxScore(score);
      setMaxFoul(fouls);
      setInitialDuration(newDuration);

      setScore1(0);
      setScore2(0);
      setFoul1(0);
      setFoul2(0);
      setGameEnded(false);
      setWinner(null);
      setEndReason("");
      setElapsedTime(0);
      setTimeLeft(newDuration);
      setIsRunning(false);
      setTimerEverStarted(false);
      setFirstScorer(null); // BARU: Reset firstScorer
      setShowSetup(false);
    },
    []
  );

  const updateScore = useCallback(
    (player: 1 | 2, points: number) => {
      if (!timerEverStarted || gameEnded) {
        console.log(
          "Tidak dapat mengubah skor: Timer belum dimulai atau game telah berakhir."
        );
        return;
      }

      if (firstScorer === null && points > 0) {
        setFirstScorer(player);
      }

      if (player === 1) {
        setScore1((currentScore) => {
          const newScore = currentScore + points;
          if (newScore >= maxScore) {
            endGame(player1, `Mencapai skor maksimal (${maxScore})`);
          }
          return newScore;
        });
      } else {
        setScore2((currentScore) => {
          const newScore = currentScore + points;
          if (newScore >= maxScore) {
            endGame(player2, `Mencapai skor maksimal (${maxScore})`);
          }
          return newScore;
        });
      }
    },
    [
      timerEverStarted,
      gameEnded,
      maxScore,
      player1,
      player2,
      endGame,
      firstScorer,
    ]
  ); // MODIFIKASI: Menambahkan firstScorer ke dependencies

  const updateFouls = useCallback(
    (player: 1 | 2, change: number) => {
      if (!timerEverStarted || gameEnded || maxFoul <= 0) {
        console.log(
          "Tidak dapat mengubah pelanggaran: Timer belum dimulai, game berakhir, atau pelanggaran dinonaktifkan."
        );
        return;
      }

      if (player === 1) {
        setFoul1((currentFoul) => {
          const newFoul = Math.max(0, currentFoul + change);
          if (newFoul >= maxFoul) {
            endGame(
              player2,
              `${player1} mencapai pelanggaran maksimal (${maxFoul})`
            );
          }
          return newFoul;
        });
      } else {
        setFoul2((currentFoul) => {
          const newFoul = Math.max(0, currentFoul + change);
          if (newFoul >= maxFoul) {
            endGame(
              player1,
              `${player2} mencapai pelanggaran maksimal (${maxFoul})`
            );
          }
          return newFoul;
        });
      }
    },
    [timerEverStarted, gameEnded, maxFoul, player1, player2, endGame]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        gameEnded
      ) {
        return;
      }
      if (
        !timerEverStarted &&
        ["1", "2", "3", "8", "9", "0", "a", "s", "k", "l"].includes(event.key)
      ) {
        console.log("Timer belum dimulai, tombol skor dinonaktifkan.");
        return;
      }
      switch (event.key) {
        case "1":
          updateScore(1, 1);
          break;
        case "2":
          updateScore(1, 2);
          break;
        case "3":
          updateScore(1, 3);
          break;
        case "8":
          updateScore(2, 1);
          break;
        case "9":
          updateScore(2, 2);
          break;
        case "0":
          updateScore(2, 3);
          break;
        case "a":
          updateScore(1, -1);
          break;
        case "s":
          updateFouls(1, -1);
          break;
        case "k":
          updateScore(2, -1);
          break;
        case "l":
          updateFouls(2, -1);
          break;
        case "x":
          updateFouls(1, 1);
          break;
        case "m":
          updateFouls(2, 1);
          break;
        case " ":
          // Toggle Timer Logic (existing)
          if (timerEverStarted) {
            setIsRunning((prev) => !prev);
          } else {
            setIsRunning(true);
            handleTimerFirstStart(); // Make sure this function is defined or imported if needed elsewhere
          }
          event.preventDefault(); // Prevent default space bar action
          break;
        case "Shift":
          // Toggle Controls Logic (NEW)
          toggleBothControls();

          event.preventDefault(); // Prevent default space bar action
          break;
        default:
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameEnded, updateScore, updateFouls, timerEverStarted]);

  useEffect(() => {
    let interval: number | undefined;
    if (isRunning && timeLeft > 0 && !gameEnded) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => {
          const nextTime = prev - 1;
          if (nextTime <= 0) {
            clearInterval(interval);
            setIsRunning(false);
            setElapsedTime(initialDuration);
            if (!gameEnded) {
              let finalWinner: string | null = null;
              let finalReason = "Waktu habis";
              if (score1 > score2) {
                finalWinner = player1;
                finalReason += " dengan skor lebih tinggi";
              } else if (score2 > score1) {
                finalWinner = player2;
                finalReason += " dengan skor lebih tinggi";
              } else {
                // Skor sama
                // BARU: Periksa firstScorer saat waktu habis
                if (firstScorer === 1) {
                  finalWinner = player1;
                  finalReason = `${player1} menang karena skor duluan (skor seri ${score1}-${score2} saat waktu habis)`;
                } else if (firstScorer === 2) {
                  finalWinner = player2;
                  finalReason = `${player2} menang karena skor duluan (skor seri ${score1}-${score2} saat waktu habis)`;
                } else {
                  // Jika tidak ada yang skor duluan (misal, skor masih 0-0 dan belum ada yg input skor)
                  finalReason += ` dengan skor seri (${score1}-${score2})`;
                }
              }
              endGame(finalWinner, finalReason);
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
  }, [isRunning, gameEnded, initialDuration, timeLeft, endGame, firstScorer]);

  useEffect(() => {
    setTimeLeft(initialDuration);
    setIsRunning(false);
    setTimerEverStarted(false);
  }, [initialDuration]);

  const handleTimerFirstStart = useCallback(() => {
    if (!timerEverStarted) {
      setTimerEverStarted(true);
    }
  }, [timerEverStarted]);

  const handleNewGameFromTimer = useCallback(() => {
    setShowSetup(true);
  }, []);

  if (isSplashVisible) {
    return <SplashScreen isFading={isSplashFading} />;
  }

  if (showSetup) {
    return <SetupModal onSubmit={handleSetupSubmit} />;
  }

  const canModifyScore = timerEverStarted && !gameEnded;

  return (
    <div className=" mt-10 max-h-screen bg-black flex items-start py-3 text-white overflow-hidden overflow-y-hidden scroll-m-0">
      {/* Winner Modal */}
      {gameEnded && (
        <div className="montserrat fixed inset-0 bg-black bg-opacity-90 flex z-50 p-10 items-center justify-center">
          <div className="bg-gray-900 w-full h-full max-w-none max-h-none p-6 rounded-xl border border-gray-700 flex flex-col shadow-2xl overflow-y-none">
            {/* This div will grow and provide space */}
            <div className="flex-grow flex flex-col">
              {" "}
              {/* ADDED: flex flex-col here */}
              <div className="bg-gray-800 border border-gray-700 text-center px-4 py-5 rounded-lg text-white flex flex-col gap-y-2">
                {winner ? (
                  <>
                    <p className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold mb-1">
                      {winner.toUpperCase()} WIN
                    </p>
                    <p className="text-md sm:text-lg md:text-xl lg:text-2xl text-gray-300">
                      {endReason}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold mb-1">
                      Hasil Seri!
                    </p>
                    <p className="text-md sm:text-lg md:text-xl lg:text-2xl text-gray-300">
                      {endReason}
                    </p>
                  </>
                )}
                <p className="text-lg sm:text-xl md:text-2xl mt-3 text-gray-300 font-semibold">
                  Durasi Permainan: {formatTime(elapsedTime)}
                </p>
              </div>
              <section className="grid grid-cols-1 md:grid-cols-2 gap-4 text-start mt-6 mb-6 flex-grow">
                <div
                  className={`bg-gradient-to-br from-red-600 to-black p-4 rounded-lg border ${
                    winner === player1
                      ? "border-green-400 shadow-[0_0_60px_#22c55e]"
                      : "border-gray-600"
                  } relative flex flex-col justify-between items-start py-7 px-10 md:h-auto`}
                >
                  <header>
                    <h3
                      className="text-[50px] font-semibold w-full text-start mb-2"
                      title={player1}
                    >
                      {player1.toUpperCase()}
                    </h3>
                    <h4
                      className="text-[40px] font-semibold w-full text-start mb-2"
                      title={playerFrom1.toUpperCase()}
                    >
                      {playerFrom1.toUpperCase()}
                    </h4>
                  </header>

                  {firstScorer === 1 && (
                    <span className="text-xs absolute top-2 right-2 bg-green-500 text-white px-1.5 py-0.5 rounded font-semibold">
                      SKOR AWAL
                    </span>
                  )}
                  <section className="flex flex-col gap-3 w-full text-5xl">
                    <div className="flex w-full justify-between items-center">
                    <p className="text-white">SKOR :</p>
                    <p className="font-bold karantina-regular text-8xl">{score1}</p>
                  </div>
                  {maxFoul > 0 && (
                    <div className="flex w-full justify-between items-center">
                      <p className="text-white">FOUL :</p>
                      <p className="font-bold text-yellow-300 karantina-regular text-8xl">{foul1}</p>
                    </div>
                  )}
                  </section>
                </div>

                <div
                  className={`bg-gradient-to-bl from-blue-600 to-black p-4 rounded-lg border ${
                    winner === player2
                      ? "border-green-400 shadow-[0_0_60px_#22c55e]"
                      : "border-gray-600"
                  } relative flex flex-col justify-between items-start py-7 px-10 md:h-auto`}
                >
                  <header>
                    <h3
                      className="text-[50px] font-semibold w-full text-start mb-2"
                      title={player2}
                    >
                      {player2.toUpperCase()}
                    </h3>
                    <h4
                      className="text-[40px] font-semibold w-full text-start mb-2"
                      title={playerFrom2.toUpperCase()}
                    >
                      {playerFrom2.toUpperCase()}
                    </h4>
                  </header>

                  {firstScorer === 2 && (
                    <span className="text-xs absolute top-2 right-2 bg-yellow-500 text-black px-1.5 py-0.5 rounded font-semibold">
                      SKOR AWAL
                    </span>
                  )}
                  <section className="flex flex-col gap-3 w-full text-5xl">
                    <div className="flex w-full justify-between items-center">
                    <p className="text-white">SKOR :</p>
                    <p className="font-bold karantina-regular text-8xl">{score2}</p>
                  </div>
                  {maxFoul > 0 && (
                    <div className="flex w-full justify-between items-center">
                      <p className="text-white">FOUL :</p>
                      <p className="font-bold text-yellow-300 karantina-regular text-8xl">{foul2}</p>
                    </div>
                  )}
                  </section>
                </div>
              </section>
            </div>

            {/* Bagian Bawah: Tombol Aksi */}
            <div className="pt-4 border-t border-gray-700 flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => setShowSetup(true)}
                className="px-4 py-2 rounded-lg border border-blue-600 text-blue-300 hover:bg-blue-900 hover:text-white transition w-full sm:w-auto text-lg"
              >
                Main Lagi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Konfirmasi Akhiri Game */}
      {showEndConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 p-6 rounded-xl text-center max-w-md w-full shadow-2xl border border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-yellow-400">
              Konfirmasi Selesaikan Game
            </h3>
            <p className="text-white mb-6">
              Apakah Anda yakin ingin menyelesaikan permainan sekarang?
            </p>
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

      {/* Komponen Timer */}

      {/* Area Player Cards */}
      <div className="fixed flex flex-col md:flex-row justify-around items-start w-full h-full max-h-screen gap-6 md:gap-10">
        {!gameEnded && <FloatingButton />}
        {!gameEnded && <FullscreenToggleButton />}
        <PlayerCard
          name={player1}
          from={playerFrom1}
          score={score1}
          setScore={(newScore) => {
            // Digunakan jika PlayerCard mengizinkan input skor manual
            if (canModifyScore) {
              if (firstScorer === null && newScore > score1 && newScore > 0)
                setFirstScorer(1);
              setScore1(newScore);
              if (newScore >= maxScore) {
                endGame(player1, `Mencapai skor maksimal (${maxScore})`);
              }
            }
          }}
          addScore={(points) => updateScore(1, points)}
          fouls={foul1}
          setFouls={(newFoul) => {
            // Digunakan jika PlayerCard mengizinkan input foul manual
            if (canModifyScore && maxFoul > 0) {
              setFoul1(newFoul);
              if (newFoul >= maxFoul) {
                endGame(
                  player2,
                  `${player1} mencapai pelanggaran maksimal (${maxFoul})`
                );
              }
            }
          }}
          addFoul={(change) => updateFouls(1, change)}
          maxFoul={maxFoul}
          disabled={!canModifyScore}
          gradient="from-black via-red-600 to-black"
          gradient2="from-red-600 to-black"
          isFirstScorer={firstScorer === 1} // BARU: Mengirim status pencetak pertama
          showControls={showControls1}
          setShowControls={setShowControls1}
        />

        <div className="mt-64 flex flex-col items-center justify-center">
          <Timer
            timeLeft={timeLeft}
            isRunning={isRunning}
            initialDuration={initialDuration}
            setTimeLeft={setTimeLeft}
            setIsRunning={setIsRunning}
            disabled={gameEnded}
            onNewGame={handleNewGameFromTimer}
            onTimerFirstStart={handleTimerFirstStart}
          />
          <button
            onClick={() => setShowEndConfirmation(true)}
            className="mb-4 px-4 py-2 rounded-lg border border-red-600 text-red-300 hover:bg-red-900 hover:text-white transition text-lg"
            disabled={gameEnded || !timerEverStarted}
          >
            Selesaikan Game
          </button>
        </div>

        <PlayerCard
          name={player2}
          from={playerFrom2}
          score={score2}
          setScore={(newScore) => {
            if (canModifyScore) {
              if (firstScorer === null && newScore > score2 && newScore > 0)
                setFirstScorer(2);
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
                endGame(
                  player1,
                  `${player2} mencapai pelanggaran maksimal (${maxFoul})`
                );
              }
            }
          }}
          addFoul={(change) => updateFouls(2, change)}
          maxFoul={maxFoul}
          disabled={!canModifyScore}
          gradient="from-black via-blue-600 to-black"
          gradient2="from-blue-600 to-black"
          isFirstScorer={firstScorer === 2} // BARU: Mengirim status pencetak pertama
          showControls={showControls2}
          setShowControls={setShowControls2}
        />
      </div>

      {/* Kontrol Bawah */}
      {/* <div className="flex flex-col items-center mt-8 w-full max-w-lg">
        
        <header className="text-center">
          <p className="text-sm text-gray-400">
            Skor Maksimal: {maxScore}{" "}
            {maxFoul > 0 && `• Pelanggaran Maksimal: ${maxFoul}`}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            P1: '1' (+1), '2' (+2), '3' (+3) | P2: '8' (+1), '9' (+2), '0' (+3)
            | Full Screen : 'F11' | Escape: 'Esc'
          </p>
        </header>
      </div> */}
    </div>
  );
}
