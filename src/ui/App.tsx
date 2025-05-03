import { useState, useEffect, useCallback } from 'react';
import PlayerCard from './components/PlayerCard';
import Timer from './components/Timer';
import SetupModal from './components/SetupModal';

export default function App() {
  // Player scores and info states
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [maxScore, setMaxScore] = useState(50);
  const [maxFoul, setMaxFoul] = useState(5);
  const [foul1, setFoul1] = useState(0);
  const [foul2, setFoul2] = useState(0);
  const [player1, setPlayer1] = useState("Pemain 1");
  const [player2, setPlayer2] = useState("Pemain 2");
  const [playerFrom1, setPlayerFrom1] = useState("");
  const [playerFrom2, setPlayerFrom2] = useState("");
  const [duration, setDuration] = useState(1200);
  const [showSetup, setShowSetup] = useState(true);
  const [gameEnded, setGameEnded] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [endReason, setEndReason] = useState<string>("");

  // Define endGame as a useCallback to ensure stable references
  const endGame = useCallback((winnerName: string | null, reason: string) => {
    setWinner(winnerName);
    setEndReason(reason);
    setGameEnded(true);
  }, []);

  // Handler setup submit with useCallback for stable reference
  const handleSetupSubmit = useCallback(({
    name1, name2, from1, from2, score, fouls, time
  }: {
    name1: string; name2: string; from1: string; from2: string; score: number; fouls: number; time: number;
  }) => {
    setPlayer1(name1 || "Pemain 1");
    setPlayer2(name2 || "Pemain 2");
    setPlayerFrom1(from1 || "");
    setPlayerFrom2(from2 || "");
    setMaxScore(score);
    setMaxFoul(fouls);
    setDuration(time * 60);
    setShowSetup(false);
    // Reset state game saat ini
    setScore1(0);
    setScore2(0);
    setFoul1(0);
    setFoul2(0);
    setGameEnded(false);
    setWinner(null);
    setEndReason("");
  }, []);

  // Keyboard handling with properly managed dependencies
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameEnded || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      switch (event.key) {
        case '1':
          setScore1(currentScore => {
            const newScore = currentScore + 1;
            if (newScore >= maxScore && !gameEnded) {
              endGame(player1, `Mencapai skor maksimal (${maxScore})`);
            }
            return newScore;
          });
          break;
        case '2':
          setScore1(currentScore => {
            const newScore = currentScore + 2;
            if (newScore >= maxScore && !gameEnded) {
              endGame(player1, `Mencapai skor maksimal (${maxScore})`);
            }
            return newScore;
          });
          break;
        case '3':
          setScore1(currentScore => {
            const newScore = currentScore + 3;
            if (newScore >= maxScore && !gameEnded) {
              endGame(player1, `Mencapai skor maksimal (${maxScore})`);
            }
            return newScore;
          });
          break;
        case '8':
          setScore2(currentScore => {
            const newScore = currentScore + 1;
            if (newScore >= maxScore && !gameEnded) {
              endGame(player2, `Mencapai skor maksimal (${maxScore})`);
            }
            return newScore;
          });
          break;
        case '9':
          setScore2(currentScore => {
            const newScore = currentScore + 2;
            if (newScore >= maxScore && !gameEnded) {
              endGame(player2, `Mencapai skor maksimal (${maxScore})`);
            }
            return newScore;
          });
          break;
        case '0':
          setScore2(currentScore => {
            const newScore = currentScore + 3;
            if (newScore >= maxScore && !gameEnded) {
              endGame(player2, `Mencapai skor maksimal (${maxScore})`);
            }
            return newScore;
          });
          break;
        default:
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameEnded, maxScore, player1, player2, endGame]);

  // Fungsi untuk menangani klik tombol "Game Baru" dari Timer
  const handleNewGameFromTimer = useCallback(() => {
    setShowSetup(true);
  }, []);

  if (showSetup) {
    return <SetupModal onSubmit={handleSetupSubmit} />;
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-between py-10 text-white overflow-hidden px-4 sm:px-10 md:px-20 lg:px-60">
      {/* Winner Modal */}
      {gameEnded && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 p-6 md:p-8 rounded-xl text-center max-w-lg w-full shadow-2xl border border-gray-700 flex flex-col max-h-[90vh]">
            {/* Bagian Atas: Hasil Game Saat Ini & Tombol */}
            <div>
              <h2 className="text-3xl font-bold mb-4 text-white">Pertandingan Selesai!</h2>
              <div className="bg-gradient-to-r from-blue-900 via-purple-900 to-red-900 p-4 rounded-lg mb-4 text-white">
                {winner ? (
                  <>
                    <p className="text-2xl font-semibold mb-2">{winner} Menang!</p>
                    <p className="text-lg text-gray-300">{endReason}</p>
                  </>
                ) : (
                  <p className="text-2xl font-semibold">Hasil Seri!</p>
                )}
                <p className="text-sm text-gray-400 mt-1">{!winner ? endReason : ''}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center mt-6 mb-6">
                {/* Player 1 Final Score */}
                <div className="bg-red-800 bg-opacity-40 p-3 rounded-lg border border-red-700">
                  <h3 className="font-bold text-red-300">{player1}</h3>
                  <p className="text-3xl font-bold text-white">{score1}</p>
                  {maxFoul > 0 && <p className="text-sm text-red-400">Pelanggaran: {foul1}</p>}
                </div>
                {/* Player 2 Final Score */}
                <div className="bg-blue-800 bg-opacity-40 p-3 rounded-lg border border-blue-700">
                  <h3 className="font-bold text-blue-300">{player2}</h3>
                  <p className="text-3xl font-bold text-white">{score2}</p>
                  {maxFoul > 0 && <p className="text-sm text-blue-400">Pelanggaran: {foul2}</p>}
                </div>
              </div>
            </div>

            {/* Bagian Bawah: Tombol Aksi */}
            <div className="mt-6 pt-4 border-t border-gray-700 flex flex-col sm:flex-row justify-center gap-3 flex-shrink-0">
              <button
                onClick={() => {
                  setShowSetup(true); // Kembali ke setup untuk game baru
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200 w-full sm:w-auto"
              >
                Main Lagi
              </button>
              <button
                onClick={() => {
                  setGameEnded(false); // Hanya tutup modal
                }}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition duration-200 w-full sm:w-auto"
              >
                Tutup (Lihat Skor Akhir)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timer */}
      <Timer
        duration={duration}
        disabled={gameEnded}
        onTimeEnd={() => {
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
              // Kasus Seri
              finalReason += " dengan skor seri";
              setWinner(null);
              setEndReason(finalReason);
              setGameEnded(true);
              return;
            }
            // Panggil endGame untuk kasus menang karena waktu habis
            endGame(finalWinner, finalReason);
          }
        }}
        onNewGame={handleNewGameFromTimer}
      />

      {/* Player Cards Area */}
      <div className="flex flex-col md:flex-row justify-center items-start mt-5 w-full gap-6 md:gap-12 lg:gap-20">
        {/* PlayerCard 1 */}
        <PlayerCard
          name={player1}
          from={playerFrom1}
          score={score1}
          setScore={(newScore) => {
            if (!gameEnded) {
              setScore1(newScore);
              if (newScore >= maxScore) {
                endGame(player1, `Mencapai skor maksimal (${maxScore})`);
              }
            }
          }}
          fouls={foul1}
          setFouls={(newFoul) => {
            if (!gameEnded && maxFoul > 0) {
              setFoul1(newFoul);
              if (newFoul >= maxFoul) {
                endGame(player2, `${player1} mencapai pelanggaran maksimal (${maxFoul})`);
              }
            }
          }}
          maxFoul={maxFoul}
          disabled={gameEnded}
          gradient="from-black to-red-500"
        />

        {/* VS Separator */}
        <div className="flex items-center h-full mt-20 md:mt-40">
          <p className='text-4xl md:text-5xl font-mono font-extrabold text-gray-500'>VS</p>
        </div>

        {/* PlayerCard 2 */}
        <PlayerCard
          name={player2}
          from={playerFrom2}
          score={score2}
          setScore={(newScore) => {
            if (!gameEnded) {
              setScore2(newScore);
              if (newScore >= maxScore) {
                endGame(player2, `Mencapai skor maksimal (${maxScore})`);
              }
            }
          }}
          fouls={foul2}
          setFouls={(newFoul) => {
            if (!gameEnded && maxFoul > 0) {
              setFoul2(newFoul);
              if (newFoul >= maxFoul) {
                endGame(player1, `${player2} mencapai pelanggaran maksimal (${maxFoul})`);
              }
            }
          }}
          maxFoul={maxFoul}
          disabled={gameEnded}
          gradient="from-black to-blue-500"
        />
      </div>

      {/* Bottom Controls */}
      <div className="flex flex-col items-center mt-8 w-full max-w-lg">
        <button
          onClick={() => setShowSetup(true)}
          className="mb-4 px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white transition"
        >
          Pengaturan / Game Baru
        </button>
        <header className="text-center">
          <p className="text-sm text-gray-400">
            Skor Maksimal: {maxScore} {maxFoul > 0 && `• Pelanggaran Maksimal: ${maxFoul}`}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            P1: '1' (+1), '2' (+2), '3' (+3) | P2: '8' (+1), '9' (+2), '0' (+3)
          </p>
        </header>
      </div>
    </div>
  );
}