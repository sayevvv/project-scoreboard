import { useState } from 'react';
import PlayerCard from './components/PlayerCard';
import Timer from './components/Timer';
import SetupModal from './components/SetupModal';

export default function App() {
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
  const [duration, setDuration] = useState(1200); // default 20 mins
  const [showSetup, setShowSetup] = useState(true);
  const [gameEnded, setGameEnded] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [endReason, setEndReason] = useState<string>("");

  // End the game with appropriate messages
  const endGame = (winnerName: string, reason: string) => {
    setWinner(winnerName);
    setEndReason(reason);
    setGameEnded(true);
  };

  // Handle setup submission
  // Handle setup submission
  const handleSetupSubmit = ({ 
    name1, 
    name2, 
    from1, 
    from2, 
    score, 
    fouls, 
    time 
  }: { 
    name1: string; 
    name2: string; 
    from1: string; 
    from2: string; 
    score: number; 
    fouls: number; 
    time: number; 
  }) => {
    setPlayer1(name1 || "Pemain 1");
    setPlayer2(name2 || "Pemain 2");
    setPlayerFrom1(from1 || "");
    setPlayerFrom2(from2 || "");
    setMaxScore(score);
    setMaxFoul(fouls);
    setDuration(time * 60);
    setShowSetup(false);
    setScore1(0);
    setScore2(0);
    setFoul1(0);
    setFoul2(0);
    setGameEnded(false);
    setWinner(null);
    setEndReason("");
  };

  if (showSetup) {
    return <SetupModal onSubmit={handleSetupSubmit} />;
  }
 
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-between py-10 text-white overflow-hidden px-60">
      {gameEnded && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl text-center max-w-md">
            <h2 className="text-3xl font-bold mb-4">Pertandingan Selesai!</h2>
            <div className="bg-gradient-to-r from-blue-100 to-red-100 p-4 rounded-xl mb-4">
              {winner ? (
                <>
                  <p className="text-2xl font-bold mb-2">{winner} Menang!</p>
                  <p className="text-lg text-gray-700">{endReason}</p>
                </>
              ) : (
                <p className="text-2xl font-bold">Hasil Seri!</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center mt-6 mb-6">
              <div className="bg-red-50 p-3 rounded-lg">
                <h3 className="font-bold">{player1}</h3>
                <p className="text-3xl font-bold">{score1}</p>
                {maxFoul > 0 && <p className="text-sm">Pelanggaran: {foul1}</p>}
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <h3 className="font-bold">{player2}</h3>
                <p className="text-3xl font-bold">{score2}</p>
                {maxFoul > 0 && <p className="text-sm">Pelanggaran: {foul2}</p>}
              </div>
            </div>
            
            <button 
              onClick={() => {
                setScore1(0);
                setScore2(0);
                setFoul1(0);
                setFoul2(0);
                setWinner(null);
                setEndReason("");
                setGameEnded(false);
                setShowSetup(true);
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg mr-3"
            >
              Main Lagi
            </button>
            <button 
              onClick={() => {
                setScore1(0);
                setScore2(0);
                setFoul1(0);
                setFoul2(0);
                setWinner(null);
                setEndReason("");
                setGameEnded(false);
              }}
              className="bg-gray-200 px-6 py-2 rounded-lg"
            >
              Lanjutkan
            </button>
          </div>
        </div>
      )}
      
      <Timer 
        duration={duration} 
        disabled={gameEnded}
        onTimeEnd={() => {
          if (!gameEnded) {
            // Determine winner based on highest score when time ends
            if (score1 > score2) {
              endGame(player1, "Waktu habis dengan skor lebih tinggi");
            } else if (score2 > score1) {
              endGame(player2, "Waktu habis dengan skor lebih tinggi");
            } else {
              setWinner(null);
              setEndReason("Waktu habis dengan skor seri");
              setGameEnded(true);
            }
          }
        }} 
      />
      
      <div className="flex flex-col md:flex-row justify-center items-center mt-3.5 w-full gap-30">
        <PlayerCard
          name={player1}
          from={playerFrom1}
          score={score1}
          setScore={(newScore) => {
            setScore1(newScore);
            if (newScore >= maxScore && !gameEnded) {
              endGame(player1, `Mencapai skor maksimal (${maxScore})`);
            }
          }}
          fouls={foul1}
          setFouls={(newFoul) => {
            setFoul1(newFoul);
            if (maxFoul > 0 && newFoul >= maxFoul && !gameEnded) {
              endGame(player2, `${player1} mencapai pelanggaran maksimal (${maxFoul})`);
            }
          }}
          maxFoul={maxFoul}
          disabled={gameEnded}
          gradient="from-black to-red-500"
        />
        <p className='text-5xl font-mono font-extrabold'>VS</p>
        <PlayerCard
          name={player2}
          from={playerFrom2}
          score={score2}
          setScore={(newScore) => {
            setScore2(newScore);
            if (newScore >= maxScore && !gameEnded) {
              endGame(player2, `Mencapai skor maksimal (${maxScore})`);
            }
          }}
          fouls={foul2}
          setFouls={(newFoul) => {
            setFoul2(newFoul);
            if (maxFoul > 0 && newFoul >= maxFoul && !gameEnded) {
              endGame(player1, `${player2} mencapai pelanggaran maksimal (${maxFoul})`);
            }
          }}
          maxFoul={maxFoul}
          disabled={gameEnded}
          gradient="from-black to-blue-500"
        />
      </div>
      
      <button
        onClick={() => setShowSetup(true)}
        className="mt-8 px-4 py-2 rounded-lg border text-white transition"
      >
        Selesaikan Permainan
      </button>
      <header className="text-center">
        <p className="text-sm text-gray-300">
          Skor Maksimal: {maxScore} {maxFoul > 0 && `• Pelanggaran Maksimal: ${maxFoul}`}
        </p>
      </header>
    </div>
  );
}