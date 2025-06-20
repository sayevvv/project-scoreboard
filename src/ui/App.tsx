// App.tsx
import { useState, useEffect, useCallback, useRef } from "react";
import "./App.css";
import PlayerCard from "./components/PlayerCard";
import Timer from "./components/Timer";
import SetupModal from "./components/SetupModal";
import SplashScreen from "./components/SplashScreen";
import FloatingButton from "./components/FloatingButton";
import FullscreenToggleButton from "./components/FullScreenToggleButton";
// BARU: Import interface dan key
import { type ScoreboardData, LOCAL_STORAGE_KEY } from "./types"; // Sesuaikan path jika perlu

// Fungsi formatTime (jika belum di-extract, bisa di-extract ke utils)
const formatTime = (seconds: number, centiseconds?: number): string => {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00:00"; // Default jika input tidak valid
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const csString =
    typeof centiseconds === "number" && centiseconds >= 0 && centiseconds <= 99
      ? centiseconds.toString().padStart(2, "0")
      : "00"; // Default ke "00" jika sentidetik tidak valid atau tidak ada

  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}:${csString}`;
};

const SPLASH_VISIBLE_DURATION = 1500; // Durasi splash screen terlihat
const FADE_DURATION = 800; // Durasi fade out splash screen
const TIMER_UI_UPDATE_INTERVAL_MS = 50;

const electronAPI = window.electronAPI;

export default function App() {
  // State untuk visibilitas splash screen
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [isSplashFading, setIsSplashFading] = useState(false);

  // State untuk pengaturan game
  const [maxScore, setMaxScore] = useState(50);
  const [maxFoul, setMaxFoul] = useState(5);
  const [player1, setPlayer1] = useState("Pemain 1");
  const [player2, setPlayer2] = useState("Pemain 2");
  const [playerFrom1, setPlayerFrom1] = useState("");
  const [playerFrom2, setPlayerFrom2] = useState("");
  const [initialDuration, setInitialDuration] = useState(1200); // Durasi awal dalam detik (20 menit)

  // State untuk skor dan foul
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [foul1, setFoul1] = useState(0);
  const [foul2, setFoul2] = useState(0);

  // State untuk label dan nomor tatami
  const [tatamiLabel, setTatamiLabel] = useState("TATAMI");
  const [tatamiNumber, setTatamiNumber] = useState("2");
  const [matchLabel, setMatchLabel] = useState("SEMI FINAL");

  // State untuk status game
  const [gameEnded, setGameEnded] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [endReason, setEndReason] = useState<string>("");
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [firstScorer, setFirstScorer] = useState<1 | 2 | null>(null);

  // State untuk tampilan waktu dan status timer
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [centisecondsLeft, setCentisecondsLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timerEverStarted, setTimerEverStarted] = useState(false); // Apakah timer pernah dimulai

  // State untuk modal dan kontrol UI
  const [showSetup, setShowSetup] = useState(true); // Tampilkan modal setup di awal
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);
  const [showControls1, setShowControls1] = useState(true);
  const [showControls2, setShowControls2] = useState(true);

  // Refs untuk logika timer berbasis Date.now()
  const targetEndTimeRef = useRef<number | null>(null); // Timestamp kapan timer seharusnya berakhir
  const pausedTimeLeftRef = useRef<number>(initialDuration * 1000); // Sisa waktu dalam ms saat di-pause

  // ... (semua useEffect dan fungsi yang sudah ada sebelumnya) ...
  // useEffect untuk Splash Screen
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

  const endGame = useCallback(
    (winnerName: string | null, reason: string) => {
      if (gameEnded) return;

      let currentElapsedTime = 0;
      if (timerEverStarted) {
        const totalDurationMs = initialDuration * 1000;
        let remainingMs = 0;

        // Logika baru: Cek targetEndTimeRef sebagai sumber kebenaran utama.
        // Jika ada, berarti timer baru saja berjalan. Kita bisa menghitung sisa waktu saat ini.
        if (targetEndTimeRef.current) {
          remainingMs = Math.max(0, targetEndTimeRef.current - Date.now());
        } else {
          // Jika tidak ada, berarti timer sudah dalam keadaan pause sebelumnya.
          // Gunakan nilai terakhir yang tersimpan di pausedTimeLeftRef.
          remainingMs = pausedTimeLeftRef.current;
        }

        currentElapsedTime = (totalDurationMs - remainingMs) / 1000;
      }
      setElapsedTime(Math.max(0, currentElapsedTime));

      setIsRunning(false);
      targetEndTimeRef.current = null;
      setWinner(winnerName);
      setEndReason(reason);
      setGameEnded(true);

      if (reason.toLowerCase().includes("waktu habis")) {
        setTimeLeft(0);
        setCentisecondsLeft(0);
        pausedTimeLeftRef.current = 0;
      }
    },
    [gameEnded, initialDuration, timerEverStarted]
  );

  const handleManualGameEnd = useCallback(() => {
    let finalWinner: string | null = null;
    let finalReason = "Permainan diselesaikan";

    if (score1 > score2) {
      finalWinner = player1;
      finalReason = `${player1} menang, permainan diselesaikan`;
    } else if (score2 > score1) {
      finalWinner = player2;
      finalReason = `${player2} menang, permainan diselesaikan`;
    } else {
      if (firstScorer === 1) {
        finalWinner = player1;
        finalReason = `${player1} menang skor duluan (seri ${score1}-${score2}), permainan diselesaikan`;
      } else if (firstScorer === 2) {
        finalWinner = player2;
        finalReason = `${player2} menang skor duluan (seri ${score1}-${score2}), permainan diselesaikan`;
      } else {
        finalReason = `Permainan diselesaikan dengan skor seri (${score1}-${score2})`;
      }
    }
    endGame(finalWinner, finalReason);
    setShowEndConfirmation(false);
  }, [score1, score2, player1, player2, endGame, firstScorer]);

  const handleSetupSubmit = useCallback(
    ({
      name1,
      name2,
      from1,
      from2,
      score,
      fouls,
      time,
      tatamiLabel,
      tatamiNumber,
      matchLabel,
    }: {
      name1: string;
      name2: string;
      from1: string;
      from2: string;
      score: number;
      fouls: number;
      time: number;
      tatamiLabel: string;
      tatamiNumber: string;
      matchLabel: string;
    }) => {
      const newDurationSeconds = time * 60;
      setPlayer1(name1 || "Pemain 1");
      setPlayer2(name2 || "Pemain 2");
      setPlayerFrom1(from1 || "");
      setPlayerFrom2(from2 || "");
      setMaxScore(score);
      setMaxFoul(fouls);
      setInitialDuration(newDurationSeconds);

      setTatamiLabel(tatamiLabel || "TATAMI");
      setTatamiNumber(tatamiNumber || "2");
      setMatchLabel(matchLabel || "SEMI FINAL");

      setScore1(0);
      setScore2(0);
      setFoul1(0);
      setFoul2(0);
      setGameEnded(false);
      setWinner(null);
      setEndReason("");
      setElapsedTime(0);

      // Reset eksplisit state timer dan ref
      setTimeLeft(newDurationSeconds);
      setCentisecondsLeft(0);
      pausedTimeLeftRef.current = newDurationSeconds * 1000;
      targetEndTimeRef.current = null;
      setIsRunning(false);
      setTimerEverStarted(false);

      setFirstScorer(null);
      setShowSetup(false);
      setShowControls1(true);
      setShowControls2(true);
    },
    []
  );

  const updateScore = useCallback(
    (player: 1 | 2, points: number) => {
      if (!timerEverStarted || gameEnded) return;
      if (firstScorer === null && points > 0) setFirstScorer(player);
      const scoreUpdater = (currentScore: number, pName: string) => {
        const newScore = Math.max(0, currentScore + points);
        if (newScore >= maxScore && maxScore > 0 && !gameEnded) {
          endGame(pName, `Mencapai skor ${maxScore}`);
        }
        return newScore;
      };
      if (player === 1) setScore1((s) => scoreUpdater(s, player1));
      else setScore2((s) => scoreUpdater(s, player2));
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
  );

  const handleSetFirstScorerManually = useCallback(
    (player: 1 | 2 | null) => {
      if (!timerEverStarted || gameEnded) return;
      setFirstScorer(player);
    },
    [timerEverStarted, gameEnded]
  );

  const updateFouls = useCallback(
    (player: 1 | 2, change: number) => {
      if (!timerEverStarted || gameEnded || maxFoul <= 0) return;
      if (player === 1)
        setFoul1((cf) => Math.max(0, Math.min(maxFoul, cf + change)));
      else setFoul2((cf) => Math.max(0, Math.min(maxFoul, cf + change)));
    },
    [timerEverStarted, gameEnded, maxFoul]
  );

  const handleTimerFirstStart = useCallback(() => {
    if (!timerEverStarted) setTimerEverStarted(true);
  }, [timerEverStarted]);

  const handleChangeTime = useCallback(
    (newTimeInSeconds: number) => {
      if (!isRunning && !gameEnded) {
        const newDurationSec = Math.max(0, newTimeInSeconds);
        // setInitialDuration akan diupdate, dan useEffect [initialDuration] akan menangani reset jika perlu.
        // Namun, untuk memastikan state konsisten saat handleChangeTime dipanggil saat pause:
        setInitialDuration(newDurationSec);
        setTimeLeft(newDurationSec);
        setCentisecondsLeft(0);
        pausedTimeLeftRef.current = newDurationSec * 1000;
        targetEndTimeRef.current = null;
      }
    },
    [isRunning, gameEnded]
  );

  const adjustTimeBySeconds = useCallback(
    (amount: number) => {
      if (isRunning || gameEnded) return;

      // Menggunakan `setTimeLeft` dengan sebuah fungsi di dalamnya.
      // `prevTimeLeft` dijamin oleh React sebagai nilai state yang paling baru.
      setTimeLeft((prevTimeLeft) => {
        const newTotalSeconds = Math.max(0, prevTimeLeft + amount);

        // Perbarui ref internal di dalam fungsi ini juga agar tetap sinkron.
        // Kita butuh `centisecondsLeft` di sini, dan karena nilainya tidak sering berubah,
        // aman untuk mengambilnya dari closure useCallback.
        pausedTimeLeftRef.current =
          newTotalSeconds * 1000 + centisecondsLeft * 10;

        return newTotalSeconds;
      });
    },
    [isRunning, gameEnded, centisecondsLeft]
  );

  // BARU: useEffect untuk menyimpan data ke localStorage
  useEffect(() => {
    const currentTotalMsLeft = timeLeft * 1000 + centisecondsLeft * 10;
    const dataToStore: ScoreboardData = {
      player1Name: player1,
      player1From: playerFrom1,
      score1,
      foul1,
      isFirstScorer1: firstScorer === 1,
      player2Name: player2,
      player2From: playerFrom2,
      score2,
      foul2,
      isFirstScorer2: firstScorer === 2,
      // Simpan timeLeft dan millisecondsLeft dari state yang diupdate UI
      timeLeft: Math.floor(currentTotalMsLeft / 1000),
      centisecondsLeft: Math.floor((currentTotalMsLeft % 1000) / 10),
      isRunning,
      timerEverStarted,
      initialDuration,
      gameEnded,
      winner,
      endReason,
      maxScore,
      maxFoul,
      elapsedTime,
      tatamiLabel,
      tatamiNumber,
      matchLabel,
    };
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToStore));
    } catch (error) {
      console.error("Gagal menyimpan ke localStorage:", error);
    }

    // Kirim update ke display window via IPC jika electronAPI tersedia
    if (electronAPI && typeof electronAPI.updateScoreboardData === "function") {
      electronAPI.updateScoreboardData(dataToStore);
    }
  }, [
    // Daftarkan semua state yang relevan sebagai dependensi
    player1,
    playerFrom1,
    score1,
    foul1,
    player2,
    playerFrom2,
    score2,
    foul2,
    firstScorer,
    timeLeft,
    centisecondsLeft,
    isRunning,
    timerEverStarted,
    initialDuration,
    gameEnded,
    winner,
    endReason,
    maxScore,
    maxFoul,
    elapsedTime,
    tatamiLabel,
    tatamiNumber,
    matchLabel,
  ]);

  // ... (useEffect untuk handleKeyDown, timer, dll.)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        gameEnded ||
        showSetup
      )
        return;
      const canPerformAction = timerEverStarted && !gameEnded;
      const actionKeys = [
        "1",
        "2",
        "3",
        "8",
        "9",
        "0",
        "a",
        "s",
        "k",
        "l",
        "x",
        "m",
        "q",
        "w",
        "e",
      ];
      if (!timerEverStarted && actionKeys.includes(event.key.toLowerCase()))
        return;

      switch (event.key.toLowerCase()) {
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
          if (maxFoul > 0) updateFouls(1, -1);
          break;
        case "k":
          updateScore(2, -1);
          break;
        case "l":
          if (maxFoul > 0) updateFouls(2, -1);
          break;
        case "x":
          if (maxFoul > 0) updateFouls(1, 1);
          break;
        case "m":
          if (maxFoul > 0) updateFouls(2, 1);
          break;
        case "q":
          if (canPerformAction) handleSetFirstScorerManually(1);
          break;
        case "w":
          if (canPerformAction) handleSetFirstScorerManually(2);
          break;
        case "e":
          if (canPerformAction) handleSetFirstScorerManually(null);
          break;
        case " ":
          const currentTotalMs = timeLeft * 1000 + centisecondsLeft * 10;
          if (currentTotalMs <= 0 && !isRunning && timerEverStarted) {
            event.preventDefault();
            return;
          }
          const newIsRunning = !isRunning;
          setIsRunning(newIsRunning);
          if (newIsRunning && !timerEverStarted) {
            handleTimerFirstStart();
          }
          event.preventDefault();
          break;
        case "shift":
          toggleBothControls();
          event.preventDefault();
          break;
        default:
          break;
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    gameEnded,
    showSetup,
    updateScore,
    updateFouls,
    timerEverStarted,
    toggleBothControls,
    handleSetFirstScorerManually,
    maxFoul,
    handleTimerFirstStart,
    isRunning,
    timeLeft,
    centisecondsLeft,
  ]);

  useEffect(() => {
    let intervalId: number | undefined;

    if (isRunning && !gameEnded) {
      if (!timerEverStarted) {
        setTimerEverStarted(true);
      }
      if (targetEndTimeRef.current === null) {
        targetEndTimeRef.current = Date.now() + pausedTimeLeftRef.current;
        const displaySeconds = Math.floor(pausedTimeLeftRef.current / 1000);
        const displayCs = Math.floor((pausedTimeLeftRef.current % 1000) / 10);
        if (timeLeft !== displaySeconds || centisecondsLeft !== displayCs) {
          setTimeLeft(displaySeconds);
          setCentisecondsLeft(displayCs);
        }
      }

      intervalId = window.setInterval(() => {
        if (targetEndTimeRef.current === null) {
          setIsRunning(false);
          return;
        }
        const now = Date.now();
        const remainingMs = Math.max(0, targetEndTimeRef.current - now);
        setTimeLeft(Math.floor(remainingMs / 1000)); // PERUBAHAN: Kalkulasi utama dari milidetik ke sentidetik
        setCentisecondsLeft(Math.floor((remainingMs % 1000) / 10));

        if (remainingMs <= 0) {
          setIsRunning(false);
        }
      }, TIMER_UI_UPDATE_INTERVAL_MS);
    } else {
      if (intervalId) clearInterval(intervalId);
      if (!isRunning && targetEndTimeRef.current !== null && !gameEnded) {
        const remainingMsOnPause = Math.max(
          0,
          targetEndTimeRef.current - Date.now()
        );
        pausedTimeLeftRef.current = remainingMsOnPause;
        setTimeLeft(Math.floor(remainingMsOnPause / 1000));
        setCentisecondsLeft(Math.floor((remainingMsOnPause % 1000) / 10));
      }
      targetEndTimeRef.current = null;
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRunning, gameEnded, timerEverStarted, timeLeft, centisecondsLeft]);

  // BARU: Fungsi untuk membuka display window via IPC
  const handleOpenDisplayWindow = () => {
    if (electronAPI && typeof electronAPI.openDisplayWindow === "function") {
      electronAPI.openDisplayWindow();
    } else {
      // Fallback untuk browser (jika masih perlu) atau jika IPC tidak tersedia
      console.warn(
        "electronAPI.openDisplayWindow tidak tersedia. Membuka dengan window.open()."
      );
      window.open(
        "/#display",
        "_blank",
        "width=1280,height=720,menubar=no,toolbar=no,location=no,status=no"
      );
    }
  };

  // BARU: Fungsi untuk memicu fullscreen di jendela display via IPC
  const handleToggleFullscreenDisplayIPC = () => {
    if (
      electronAPI &&
      typeof electronAPI.requestDisplayFullscreenToggle === "function"
    ) {
      electronAPI.requestDisplayFullscreenToggle();
      console.log(
        "Permintaan toggle fullscreen untuk display window dikirim via IPC."
      );
    } else {
      // Fallback jika perlu, misal untuk lingkungan browser murni
      console.warn(
        "electronAPI.requestDisplayFullscreenToggle tidak tersedia."
      );
      // Kode fallback localStorage bisa ditaruh di sini jika masih ingin mendukungnya di browser non-Electron
      // localStorage.setItem(FULLSCREEN_DISPLAY_REQUEST_KEY, Date.now().toString());
    }
  };

  const handleNewGameFromTimerOrButton = useCallback(() => {
    setShowSetup(true);
  }, []);

  if (isSplashVisible) return <SplashScreen isFading={isSplashFading} />;
  if (showSetup) return <SetupModal onSubmit={handleSetupSubmit} />;

  const canModifyGame = timerEverStarted && !gameEnded;

  return (
    <div className="mt-10 max-h-screen bg-black flex items-start py-3 text-white overflow-hidde scroll-m-0">
      {/* ... (Winner Modal, End Confirmation Modal - tidak ada perubahan signifikan) ... */}
      {gameEnded && (
        <div className="montserrat fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-6 md:p-8">
          {/* Kontainer modal dengan overflow-y-auto untuk scrolling di layar kecil */}
          <div className="flex h-full w-full flex-col rounded-xl border border-gray-700 bg-gray-900 p-4 shadow-2xl sm:p-6 overflow-y-auto">
            {/* Bagian Atas: Status Kemenangan & Durasi */}
            <div className="flex-grow flex flex-col">
              <div className="flex flex-col gap-y-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-center text-white sm:py-4">
                {winner ? (
                  <>
                    {/* Ukuran font dibuat responsif */}
                    <p className="text-3xl font-semibold sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
                      {winner.toUpperCase()} WIN
                    </p>
                    <p className="text-sm text-gray-300 sm:text-base md:text-lg lg:text-xl">
                      {endReason}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-3xl font-semibold sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
                      Hasil Seri!
                    </p>
                    <p className="text-sm text-gray-300 sm:text-base md:text-lg lg:text-xl">
                      {endReason}
                    </p>
                  </>
                )}
                <p className="montserrat-semibold mt-2 text-sm font-semibold text-gray-300 sm:text-base md:text-lg">
                  Durasi Permainan:{" "}
                  {formatTime(
                    Math.floor(elapsedTime),
                    Math.round(
                      ((elapsedTime - Math.floor(elapsedTime)) * 1000) / 10
                    )
                  )}
                </p>
              </div>

              {/* Bagian Tengah: Detail Skor Pemain */}
              {/* Layout sudah responsif (1 kolom di mobile, 2 di desktop), kita perbaiki spacing & font */}
              <section className="mt-4 mb-4 grid flex-grow grid-cols-1 gap-4 md:mt-6 md:mb-6 md:grid-cols-2">
                {/* Kartu Pemain 1 */}
                <div
                  className={`relative flex flex-col justify-between rounded-lg border bg-gradient-to-br from-red-600 to-black p-4 text-start sm:p-5 md:p-6 ${
                    winner === player1
                      ? "border-green-400 shadow-[0_0_40px_-10px_#22c55e]"
                      : "border-gray-600"
                  }`}
                >
                  <header>
                    {/* Ukuran font nama pemain dibuat responsif */}
                    <h3
                      className="w-full truncate text-2xl font-semibold sm:text-3xl lg:text-4xl xl:text-5xl"
                      title={player1}
                    >
                      {player1.toUpperCase()}
                    </h3>
                    {playerFrom1 && (
                      <h4
                        className="w-full truncate text-lg font-semibold text-gray-200 sm:text-xl lg:text-2xl xl:text-3xl"
                        title={playerFrom1.toUpperCase()}
                      >
                        {playerFrom1.toUpperCase()}
                      </h4>
                    )}
                  </header>
                  {firstScorer === 1 && (
                    <span className="absolute top-2 right-2 rounded bg-green-500 px-2 py-1 text-xs font-semibold text-white sm:text-sm">
                      SKOR AWAL
                    </span>
                  )}
                  {/* Ukuran font skor dan foul dibuat responsif */}
                  <section className="mt-4 flex w-full flex-col gap-3 text-xl sm:text-2xl md:text-3xl">
                    <div className="flex w-full items-center justify-between">
                      <p className="font-medium text-white">SKOR :</p>
                      <p className="karantina-regular text-6xl font-bold sm:text-7xl md:text-8xl">
                        {score1}
                      </p>
                    </div>
                    {maxFoul > 0 && (
                      <div className="flex w-full items-center justify-between">
                        <p className="font-medium text-white">FOUL :</p>
                        <p className="karantina-regular text-6xl font-bold text-yellow-300 sm:text-7xl md:text-8xl">
                          {foul1}
                        </p>
                      </div>
                    )}
                  </section>
                </div>

                {/* Kartu Pemain 2 */}
                <div
                  className={`relative flex flex-col justify-between rounded-lg border bg-gradient-to-bl from-blue-600 to-black p-4 text-start sm:p-5 md:p-6 ${
                    winner === player2
                      ? "border-green-400 shadow-[0_0_40px_-10px_#22c55e]"
                      : "border-gray-600"
                  }`}
                >
                  <header>
                    <h3
                      className="w-full truncate text-2xl font-semibold sm:text-3xl lg:text-4xl xl:text-5xl"
                      title={player2}
                    >
                      {player2.toUpperCase()}
                    </h3>
                    {playerFrom2 && (
                      <h4
                        className="w-full truncate text-lg font-semibold text-gray-200 sm:text-xl lg:text-2xl xl:text-3xl"
                        title={playerFrom2.toUpperCase()}
                      >
                        {playerFrom2.toUpperCase()}
                      </h4>
                    )}
                  </header>
                  {firstScorer === 2 && (
                    <span className="absolute top-2 right-2 rounded bg-green-500 px-2 py-1 text-xs font-semibold text-white sm:text-sm">
                      SKOR AWAL
                    </span>
                  )}
                  <section className="mt-4 flex w-full flex-col gap-3 text-xl sm:text-2xl md:text-3xl">
                    <div className="flex w-full items-center justify-between">
                      <p className="font-medium text-white">SKOR :</p>
                      <p className="karantina-regular text-6xl font-bold sm:text-7xl md:text-8xl">
                        {score2}
                      </p>
                    </div>
                    {maxFoul > 0 && (
                      <div className="flex w-full items-center justify-between">
                        <p className="font-medium text-white">FOUL :</p>
                        <p className="karantina-regular text-6xl font-bold text-yellow-300 sm:text-7xl md:text-8xl">
                          {foul2}
                        </p>
                      </div>
                    )}
                  </section>
                </div>
              </section>
            </div>

            {/* Bagian Bawah: Tombol Aksi */}
            {/* Layout tombol sudah cukup responsif, hanya perbaikan kecil pada spacing */}
            <div className="flex flex-shrink-0 flex-col items-center justify-center gap-3 border-t border-gray-700 pt-4 sm:flex-row">
              <button
                onClick={handleNewGameFromTimerOrButton}
                className="w-full rounded-lg border border-blue-600 px-6 py-2 text-base text-blue-300 transition hover:bg-blue-900 hover:text-white sm:w-auto md:text-lg"
              >
                Main Lagi
              </button>
            </div>
          </div>
        </div>
      )}
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

      <div className="fixed flex flex-col md:flex-row justify-around items-start w-full h-full max-h-screen gap-6 md:gap-10">
        {!gameEnded && <FloatingButton />}
        {!gameEnded && <FullscreenToggleButton />}
        <PlayerCard
          name={player1}
          from={playerFrom1}
          score={score1}
          setScore={(ns) => {
            if (canModifyGame) {
              setScore1(Math.max(0, ns));
              if (ns >= maxScore && maxScore > 0)
                endGame(player1, `Mencapai skor ${maxScore}`);
            }
          }}
          addScore={(p) => updateScore(1, p)}
          fouls={foul1}
          setFouls={(nf) => {
            if (canModifyGame && maxFoul > 0)
              setFoul1(Math.max(0, Math.min(maxFoul, nf)));
          }}
          addFoul={(c) => updateFouls(1, c)}
          maxFoul={maxFoul}
          disabled={!canModifyGame}
          gradient="from-black via-red-600 to-black border-red-800/50"
          gradient2="from-red-600 to-black"
          isFirstScorer={firstScorer === 1}
          showControls={showControls1}
          setShowControls={setShowControls1}
          playerIdentifier={1}
          onSetFirstScorerManually={handleSetFirstScorerManually}
        />

        <div className="flex flex-col items-center justify-center h-full gap-6">
          <Timer
            timeLeft={timeLeft}
            centisecondsLeft={centisecondsLeft}
            isRunning={isRunning}
            initialDuration={initialDuration}
            setTimeLeft={setTimeLeft}
            setIsRunning={setIsRunning}
            disabled={gameEnded}
            onNewGame={handleNewGameFromTimerOrButton}
            onTimerFirstStart={handleTimerFirstStart}
            onChangeTime={handleChangeTime}
            onAdjustTime={adjustTimeBySeconds}
            formatTime={formatTime}
          />
          <button
            onClick={() => setShowEndConfirmation(true)}
            className="mb-2 mt-2 px-4 py-2 rounded-full font-semibold text-white transition text-sm bg-red-600 hover:bg-red-500 disabled:bg-red-200 disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={gameEnded || !timerEverStarted}
          >
            Selesaikan Game
          </button>
          <div className="flex flex-col gap-2 rounded-2xl border border-slate-500 p-2">
            <small className="text-[10px] text-slate-400 text-center">
              Kontrol Tampilan Ekstra
            </small>
            {!gameEnded && (
              <button
                onClick={handleOpenDisplayWindow}
                // --- PERUBAHAN 1.A: Penyesuaian Style Disabled ---
                className="px-4 py-2 rounded-xl font-semibold text-white transition text-sm bg-sky-600 hover:bg-sky-500 disabled:bg-sky-900 disabled:text-sky-400/70 disabled:opacity-70 disabled:cursor-not-allowed"
                title="Buka Jendela Tampilan Terpisah (OBS)"
                // --- PERUBAHAN 1.B: Menambahkan atribut 'disabled' ---
                disabled={isRunning}
              >
                Layar Display
              </button>
            )}

            {!gameEnded && (
              <button
                onClick={handleToggleFullscreenDisplayIPC}
                // --- PERUBAHAN 2.A: Penyesuaian Style Disabled ---
                className="px-4 py-2 rounded-xl font-semibold text-white transition text-sm bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900 disabled:text-emerald-400/70 disabled:opacity-70 disabled:cursor-not-allowed"
                title="Toggle Fullscreen pada Jendela Tampilan"
                // --- PERUBAHAN 2.B: Menambahkan atribut 'disabled' ---
                disabled={isRunning}
              >
                Fullscreen Display
              </button>
            )}
          </div>
        </div>

        <PlayerCard
          name={player2}
          from={playerFrom2}
          score={score2}
          setScore={(ns) => {
            if (canModifyGame) {
              setScore2(Math.max(0, ns));
              if (ns >= maxScore && maxScore > 0)
                endGame(player2, `Mencapai skor ${maxScore}`);
            }
          }}
          addScore={(p) => updateScore(2, p)}
          fouls={foul2}
          setFouls={(nf) => {
            if (canModifyGame && maxFoul > 0)
              setFoul2(Math.max(0, Math.min(maxFoul, nf)));
          }}
          addFoul={(c) => updateFouls(2, c)}
          maxFoul={maxFoul}
          disabled={!canModifyGame}
          gradient="from-black via-blue-600 to-black border-blue-800/50"
          gradient2="from-blue-600 to-black"
          isFirstScorer={firstScorer === 2}
          showControls={showControls2}
          setShowControls={setShowControls2}
          playerIdentifier={2}
          onSetFirstScorerManually={handleSetFirstScorerManually}
        />
      </div>
    </div>
  );
}
