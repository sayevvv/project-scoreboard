import { useState, useEffect, useCallback } from "react";
import { type ScoreboardData, LOCAL_STORAGE_KEY } from "../types";

const formatDisplayTime = (seconds: number, centiseconds?: number): string => {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const csString =
    typeof centiseconds === "number" && centiseconds >= 0 && centiseconds <= 99
      ? centiseconds.toString().padStart(2, "0")
      : "00";
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}:${csString}`;
};

const initialDisplayData: ScoreboardData = {
  player1Name: "PEMAIN 1",
  player1From: "",
  score1: 0,
  foul1: 0,
  isFirstScorer1: false,
  player2Name: "PEMAIN 2",
  player2From: "",
  score2: 0,
  foul2: 0,
  isFirstScorer2: false,
  timeLeft: 0,
  isRunning: false,
  timerEverStarted: false,
  initialDuration: 1,
  centisecondsLeft: 0, // Menggunakan centisecondsLeft
  gameEnded: false,
  winner: null,
  endReason: "",
  maxScore: 0,
  maxFoul: 0,
  elapsedTime: 0,
};

const FOUL_LABELS: string[] = ["C1", "C2", "C3", "HC", "H"];
const EXTRA_FOUL_LABEL: string = "X";

// Ambil API dari window jika tersedia (diekspos oleh preload.ts)
// @ts-ignore (Jika Anda belum membuat deklarasi tipe global untuk window.electronAPI di file .d.ts yang tercakup oleh DisplayPage)
const electronAPI = window.electronAPI;

export default function DisplayPage() {
  const [data, setData] = useState<ScoreboardData>(initialDisplayData);
  const [isLoading, setIsLoading] = useState(true);
  // State isFullscreenActive sudah tidak terlalu dibutuhkan jika kita hanya merespons perintah toggle,
  // tapi bisa berguna untuk UI di DisplayPage jika ada.
  // const [isFullscreenActive, setIsFullscreenActive] = useState(!!document.fullscreenElement);

  // Callback untuk menangani event 'fullscreenchange' dari DOM
  const handleDOMFullscreenChange = useCallback(() => {
    // setIsFullscreenActive(!!document.fullscreenElement); // Update state jika perlu
    console.log(
      document.fullscreenElement
        ? "[DisplayPage] Entered fullscreen (DOM event)."
        : "[DisplayPage] Exited fullscreen (DOM event)."
    );
  }, []);

  // Fungsi untuk melakukan toggle fullscreen
  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
        console.log(
          "[DisplayPage] Entered fullscreen (via toggleFullscreen function)."
        );
      } catch (err) {
        console.error("[DisplayPage] Gagal masuk mode fullscreen:", err);
      }
    } else {
      try {
        await document.exitFullscreen();
        console.log(
          "[DisplayPage] Exited fullscreen (via toggleFullscreen function)."
        );
      } catch (err) {
        console.error("[DisplayPage] Gagal keluar dari mode fullscreen:", err);
      }
    }
  }, []);

  useEffect(() => {
    const loadData = () => {
      try {
        const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedData) {
          const parsedData = JSON.parse(storedData); // PERUBAHAN: Memastikan centisecondsLeft ada, jika tidak, default ke 0
          setData({
            ...initialDisplayData,
            ...parsedData,
            centisecondsLeft: parsedData.centisecondsLeft ?? 0,
          });
        } else {
          setData(initialDisplayData);
        }
      } catch (error) {
        console.error("Gagal memuat data:", error);
        setData(initialDisplayData);
      }
      setIsLoading(false);
    };

    loadData();

    // 2. Setup listener untuk perubahan status fullscreen DOM
    document.addEventListener("fullscreenchange", handleDOMFullscreenChange);

    // 3. Setup dasar untuk tampilan halaman
    document.title = "Live Scoreboard - Tampilan";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    // 4. Setup Listener IPC
    let removeDataUpdateListener: (() => void) | undefined;
    let removeExecuteFullscreenListener: (() => void) | undefined;

    if (electronAPI) {
      // Listener untuk update data scoreboard dari proses utama
      if (typeof electronAPI.onScoreboardDataUpdated === "function") {
        removeDataUpdateListener = electronAPI.onScoreboardDataUpdated(
          (updatedData: ScoreboardData) => {
            console.log(
              "[DisplayPage] Data scoreboard diterima via IPC:",
              updatedData
            );
            setData(updatedData);
          }
        );
      }

      // Listener untuk perintah toggle fullscreen dari proses utama
      if (typeof electronAPI.onExecuteFullscreenToggle === "function") {
        removeExecuteFullscreenListener = electronAPI.onExecuteFullscreenToggle(
          () => {
            console.log(
              "[DisplayPage] Perintah toggle fullscreen diterima via IPC. Memanggil toggleFullscreen()."
            );
            toggleFullscreen(); // Panggil fungsi lokal untuk melakukan aksi fullscreen
          }
        );
      }
    } else {
      // Fallback jika tidak dalam Electron: Gunakan localStorage untuk update data
      // (Tidak ada fallback localStorage untuk fullscreen di sini, karena itu dikontrol via IPC)
      console.warn(
        "[DisplayPage] electronAPI tidak ditemukan. Listener IPC tidak akan aktif."
      );
      const handleStorageChangeFallback = (event: StorageEvent) => {
        if (event.key === LOCAL_STORAGE_KEY && event.newValue) {
          try {
            const parsedData = JSON.parse(event.newValue);
            // MODIFIKASI: Gunakan millisecondsLeft
            setData({
              ...initialDisplayData,
              ...parsedData,
              centisecondsLeft: parsedData.centisecondsLeft ?? 0,
            });
          } catch (error) {
            console.error(
              "[DisplayPage] Gagal parse data dari localStorage (fallback):",
              error
            );
          }
        } else if (event.key === LOCAL_STORAGE_KEY && !event.newValue) {
          setData(initialDisplayData);
        }
      };
      window.addEventListener("storage", handleStorageChangeFallback);
      // Cleanup untuk fallback
      return () => {
        window.removeEventListener("storage", handleStorageChangeFallback);
        document.removeEventListener(
          "fullscreenchange",
          handleDOMFullscreenChange
        );
        document.body.style.margin = "";
        document.body.style.overflow = "";
      };
    }

    // Fungsi cleanup saat komponen di-unmount
    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleDOMFullscreenChange
      );
      document.body.style.margin = "";
      document.body.style.overflow = "";

      if (removeDataUpdateListener) {
        removeDataUpdateListener();
      }
      if (removeExecuteFullscreenListener) {
        removeExecuteFullscreenListener();
      }
    };
  }, [toggleFullscreen, handleDOMFullscreenChange]); // Sertakan dependensi yang digunakan di dalam effect

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white text-4xl montserrat-regular">
        Memuat Data Papan Skor...
      </div>
    );
  }

  const getFoulIndicatorLabel = (index: number): string => {
    if (index < FOUL_LABELS.length) {
      return FOUL_LABELS[index];
    }
    return EXTRA_FOUL_LABEL;
  };

  const renderFoulIndicators = (
    foulCount: number,
    maxFouls: number,
    playerKey: string
  ) => {
    if (maxFouls <= 0) return null;

    return (
      <div className="w-full px-1 sm:px-2 md:px-3">
        <div className="flex flex-row justify-around items-end gap-x-1 sm:gap-x-1.5 md:gap-x-2 w-full py-1">
          {[...Array(maxFouls)].map((_, index) => {
            const isActive = index < foulCount;
            const label = getFoulIndicatorLabel(index);
            return (
              <div
                key={`${playerKey}-foul-${index}`}
                className="flex flex-col items-center gap-y-1 flex-grow min-w-0 px-0.5"
              >
                <div
                  className={`
                    w-full h-3 sm:h-3.5 md:h-4 lg:h-5
                    rounded-sm border transition-colors duration-150 ease-in-out
                    ${
                      isActive
                        ? "bg-yellow-400 border-yellow-500 shadow-md shadow-yellow-500/25"
                        : "bg-gray-600/50 border-gray-500/50"
                    }
                  `}
                />
                <span
                  className={`
                    text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold
                    transition-colors duration-150 ease-in-out mt-1 leading-none
                    ${isActive ? "text-yellow-300" : "text-gray-500"}
                  `}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const fullTimeString = formatDisplayTime(
    data.timeLeft,
    data.centisecondsLeft
  );
  const timeParts = fullTimeString.split(":");
  const mainTimeDisplay = `${timeParts[0]}:${timeParts[1]}`;
  const centisecondsDisplay = timeParts[2];

  return (
    <div className="h-screen bg-black text-white flex flex-col montserrat-regular select-none p-1 md:p-2">
      <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-1 md:gap-2 flex-grow min-h-0">
        {/* Kolom Kiri: Pemain 1 */}
        <div
          className={`flex flex-col justify-between w-full h-full transition-all duration-500 ease-in-out min-w-0 ${
            data.gameEnded && data.winner && data.winner === data.player1Name
              ? "bg-green-700/20 rounded-lg"
              : ""
          } ${
            data.gameEnded && data.winner && data.winner !== data.player1Name
              ? "opacity-50"
              : ""
          }`}
        >
          <div className="flex-grow flex flex-col min-h-0">
            <div
              className={`montserrat flex flex-col items-center justify-center w-full p-3 bg-gradient-to-r from-red-600 to-red-800 rounded-t-lg shadow-lg flex-shrink-0 border-b-2 border-red-400`}
            >
              <h2
                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl montserrat-bold font-bold text-center w-full truncate"
                title={data.player1Name}
              >
                {data.player1Name.toUpperCase()}
              </h2>
              {data.player1From && (
                <p className="montserrat-medium font-semibold text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 w-full truncate text-center mt-1">
                  {data.player1From.toUpperCase()}
                </p>
              )}
            </div>

            <div
              className={`relative flex flex-col items-center justify-center border-x-2 border-b-2 border-red-800/50 rounded-b-lg shadow-lg bg-gradient-to-tr from-black/50 via-red-500/60 to-black/50 text-white w-full flex-grow min-h-0`}
            >
              {data.isFirstScorer1 && !data.gameEnded && (
                <div
                  className="absolute top-2 right-2 w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-green-500/90 rounded-lg shadow-xl border-2 border-green-300/90 z-10 text-white flex items-center justify-center p-1"
                  title="Pencetak Skor Pertama"
                >
                  <span className="text-2xl sm:text-4xl md:text-5xl font-black">
                    S
                  </span>
                </div>
              )}
              <div
                className="karantina-regular text-white leading-none my-auto select-none"
                style={{
                  fontSize: "clamp(5rem, 22vw, 28rem)",
                  textShadow:
                    "0 0 10px rgba(255,255,255,0.3), 0 0 20px rgba(255,80,80,0.5)",
                }}
              >
                {data.score1}
              </div>
            </div>
          </div>
          <div className="w-full flex-shrink-0 pt-2">
            {renderFoulIndicators(data.foul1, data.maxFoul, "p1")}
          </div>
        </div>

        {/* Kolom Tengah: Timer & Tatami */}
        {/* --- PERUBAHAN 1: Container diubah menjadi grid dengan 3 baris sama tinggi --- */}
        <div
          className={`grid grid-rows-3 h-full p-4 px-10 bg-gray-900/70 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-xl transition-opacity duration-500 mx-2 ${
            data.gameEnded ? "opacity-0" : "opacity-100"
          }`}
        >
          {/* --- PERUBAHAN 2: Info Tatami ditempatkan di baris 1, rata atas-tengah --- */}
          <div className="text-center self-start justify-self-center">
            <div className="text-4xl lg:text-6xl font-bold text-gray-300 tracking-widest montserrat-bold">
              {data.tatamiLabel || "TATAMI"}
            </div>
            <div className="karantina-regular text-8xl lg:text-[9rem] text-white -mt-2">
              {data.tatamiNumber || "1"}
            </div>
          </div>

          {/* --- PERUBAHAN 3: Timer ditempatkan di baris 2, pas di tengah selnya --- */}
          <div className="flex flex-col items-center place-self-center">
            <div className="flex flex-col items-center bg-black/60 border-2 border-white/20 rounded-3xl shadow-2xl shadow-black/50 px-5 py-3 md:px-8 md:py-5">
              <h2 className="font-mono font-bold tabular-nums leading-none text-5xl sm:text-6xl md:text-7xl lg:text-[6.5rem] flex items-baseline justify-center">
                <span>{mainTimeDisplay}</span>
                <span
                  className="text-[3rem] sm:text-[3.5rem] md:text-[4rem] lg:text-[4.5rem] tracking-tight"
                  style={{ marginLeft: "0.1em" }}
                >
                  :{centisecondsDisplay}
                </span>
              </h2>
            </div>
            {data.matchLabel && (
              <p className="montserrat font-bold text-xl md:text-2xl lg:text-3xl text-yellow-400 tracking-widest mt-3 uppercase text-center">
                {data.matchLabel}
              </p>
            )}
          </div>

          {/* Baris ke-3 sengaja dibiarkan kosong */}
        </div>

        {/* Kolom Kanan: Pemain 2 */}
        <div
          className={`flex flex-col justify-between w-full h-full transition-all duration-500 ease-in-out min-w-0 ${
            data.gameEnded && data.winner && data.winner === data.player2Name
              ? "bg-green-700/20 rounded-lg"
              : ""
          } ${
            data.gameEnded && data.winner && data.winner !== data.player2Name
              ? "opacity-50"
              : ""
          }`}
        >
          <div className="flex-grow flex flex-col min-h-0">
            <div className={`montserrat flex flex-col items-center justify-center w-full p-3 bg-gradient-to-l from-blue-600 to-blue-800 rounded-t-lg shadow-lg flex-shrink-0 border-b-2 border-blue-400`}>
                            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl montserrat-bold font-bold text-center w-full truncate" title={data.player2Name}>
                                {data.player2Name.toUpperCase()}
                            </h2>
                            {data.player2From && (
                                <p className="montserrat-medium font-semibold text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 w-full truncate text-center mt-1">
                                    {data.player2From.toUpperCase()}
                                </p>
                            )}
                        </div>

            <div
              className={`relative flex flex-col items-center justify-center border-x-2 border-b-2 border-blue-800/50 rounded-b-lg shadow-lg bg-gradient-to-tr from-black/50 via-blue-500/60 to-black/50 text-white w-full flex-grow min-h-0`}
            >
              {data.isFirstScorer2 && !data.gameEnded && (
                <div
                  className="absolute top-2 right-2 w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-green-500/90 rounded-lg shadow-xl border-2 border-green-300/90 z-10 text-white flex items-center justify-center p-1"
                  title="Pencetak Skor Pertama"
                >
                  <span className="text-2xl sm:text-4xl md:text-5xl font-black">
                    S
                  </span>
                </div>
              )}
              <div
                className="karantina-regular text-white leading-none my-auto select-none"
                style={{
                  fontSize: "clamp(5rem, 22vw, 28rem)",
                  textShadow:
                    "0 0 10px rgba(255,255,255,0.3), 0 0 20px rgba(80,80,255,0.5)",
                }}
              >
                {data.score2}
              </div>
            </div>
          </div>
          <div className="w-full flex-shrink-0 pt-2">
            {renderFoulIndicators(data.foul2, data.maxFoul, "p2")}
          </div>
        </div>
      </div>

      {/* Overlay Hasil Game (Logika tidak berubah) */}
      {data.gameEnded && (
        <div className="montserrat fixed inset-0 bg-black/90 backdrop-blur-sm flex z-50 p-4 sm:p-6 md:p-8 items-center justify-center">
          <div className="bg-gray-900/95 w-full h-full max-w-none max-h-none p-4 sm:p-5 rounded-xl border-2 border-gray-700/80 flex flex-col shadow-2xl shadow-black/50 overflow-y-auto">
            <div className="flex-grow flex flex-col">
              <div className="bg-gray-800/90 border border-gray-700 text-center px-3 py-4 sm:px-4 sm:py-5 rounded-lg text-white flex flex-col gap-y-1.5 sm:gap-y-2 mb-4 sm:mb-5">
                {data.winner ? (
                  <>
                    <p className="text-2xl sm:text-3xl md:text-4xl lg:text-7xl montserrat-extrabold font-extrabold mb-0.5 sm:mb-1 tracking-wide">
                      {data.winner.toUpperCase()} WIN
                    </p>
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300/90 montserrat-medium">
                      {data.endReason}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl montserrat-extrabold font-extrabold mb-0.5 sm:mb-1 tracking-wide">
                      HASIL SERI!
                    </p>
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300/90 montserrat-medium">
                      {data.endReason}
                    </p>
                  </>
                )}
                <p className="text-base sm:text-lg md:text-xl mt-2 sm:mt-3 text-gray-300 montserrat-semibold font-semibold">
                  Durasi Permainan:{" "}
                  {formatDisplayTime(
                    Math.floor(data.elapsedTime),
                    Math.round(
                      ((data.elapsedTime - Math.floor(data.elapsedTime)) *
                        1000) /
                        10
                    )
                  )}
                </p>
              </div>
              <section className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 text-start flex-grow">
                <div
                  className={`bg-gradient-to-br from-red-500 to-black/85 p-3 sm:p-4 rounded-lg border-2 ${
                    data.winner === data.player1Name
                      ? "border-green-400 shadow-[0_0_30px_-10px_#22c55e]"
                      : "border-gray-600/70"
                  } relative flex flex-col justify-between items-start py-4 sm:py-5 px-4 sm:px-6`}
                >
                  <header>
                    <h3
                      className="text-xl sm:text-2xl md:text-3xl lg:text-4xl montserrat-bold font-bold w-full text-start mb-1 sm:mb-1.5"
                      title={data.player1Name}
                    >
                      {data.player1Name.toUpperCase()}
                    </h3>
                    {data.player1From && (
                      <h4
                        className="text-lg sm:text-xl md:text-2xl montserrat-bold font-bold w-full text-start mb-1.5 sm:mb-2 text-gray-100/95"
                        title={data.player1From.toUpperCase()}
                      >
                        {data.player1From.toUpperCase()}
                      </h4>
                    )}
                  </header>
                  {data.isFirstScorer1 && (
                    <div
                      className="absolute top-1.5 right-1.5 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-green-500/90 rounded-md shadow-lg border-2 border-green-300/90 z-10 text-white flex items-center justify-center p-1"
                      title="Pencetak Skor Pertama"
                    >
                      <span className="text-2xl sm:text-3xl md:text-4xl font-black">
                        S
                      </span>
                    </div>
                  )}
                  <section className="flex flex-col gap-1.5 sm:gap-2 w-full text-2xl sm:text-3xl md:text-4xl mt-2 sm:mt-3">
                    <div className="flex w-full justify-between items-center">
                      <p className="text-gray-100/90 montserrat-medium">
                        SKOR :
                      </p>
                      <p className="karantina-bold text-4xl sm:text-5xl md:text-6xl text-white">
                        {data.score1}
                      </p>
                    </div>
                    {data.maxFoul > 0 && (
                      <div className="flex w-full justify-between items-center">
                        <p className="text-gray-100/90 montserrat-medium">
                          FOUL :
                        </p>
                        <p className="karantina-bold text-4xl sm:text-5xl md:text-6xl text-yellow-300">
                          {data.foul1}
                        </p>
                      </div>
                    )}
                  </section>
                </div>
                <div
                  className={`bg-gradient-to-bl from-blue-500 to-black/85 p-3 sm:p-4 rounded-lg border-2 ${
                    data.winner === data.player2Name
                      ? "border-green-400 shadow-[0_0_30px_-10px_#22c55e]"
                      : "border-gray-600/70"
                  } relative flex flex-col justify-between items-start py-4 sm:py-5 px-4 sm:px-6`}
                >
                  <header>
                    <h3
                      className="text-xl sm:text-2xl md:text-3xl lg:text-4xl montserrat-bold font-bold w-full text-start mb-1 sm:mb-1.5"
                      title={data.player2Name}
                    >
                      {data.player2Name.toUpperCase()}
                    </h3>
                    {data.player2From && (
                      <h4
                        className="text-lg sm:text-xl md:text-2xl montserrat-bold font-bold w-full text-start mb-1.5 sm:mb-2 text-gray-100/95"
                        title={data.player2From.toUpperCase()}
                      >
                        {data.player2From.toUpperCase()}
                      </h4>
                    )}
                  </header>
                  {data.isFirstScorer2 && (
                    <div
                      className="absolute top-1.5 right-1.5 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-green-500/90 rounded-md shadow-lg border-2 border-green-300/90 z-10 text-white flex items-center justify-center p-1"
                      title="Pencetak Skor Pertama"
                    >
                      <span className="text-2xl sm:text-3xl md:text-4xl font-black">
                        S
                      </span>
                    </div>
                  )}
                  <section className="flex flex-col gap-1.5 sm:gap-2 w-full text-2xl sm:text-3xl md:text-4xl mt-2 sm:mt-3">
                    <div className="flex w-full justify-between items-center">
                      <p className="text-gray-100/90 montserrat-medium">
                        SKOR :
                      </p>
                      <p className="karantina-bold text-4xl sm:text-5xl md:text-6xl text-white">
                        {data.score2}
                      </p>
                    </div>
                    {data.maxFoul > 0 && (
                      <div className="flex w-full justify-between items-center">
                        <p className="text-gray-100/90 montserrat-medium">
                          FOUL :
                        </p>
                        <p className="karantina-bold text-4xl sm:text-5xl md:text-6xl text-yellow-300">
                          {data.foul2}
                        </p>
                      </div>
                    )}
                  </section>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
