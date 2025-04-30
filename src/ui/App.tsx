import { useState } from 'react';
import PlayerCard from './components/PlayerCard';
import Timer from './components/Timer';
import SetupModal from './components/SetupModal';

export default function App() {
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [maxScore, setMaxScore] = useState(50);
  const [maxFoul, setMaxFoul] = useState(0);
  const [player1, setPlayer1] = useState("Pemain 1");
  const [player2, setPlayer2] = useState("Pemain 2");
  const [playerFrom1, setFrom1] = useState("Tim 1");
  const [playerFrom2, setFrom2] = useState("Tim 2");
  const [duration, setDuration] = useState(1200); // default 20 mins
  const [showSetup, setShowSetup] = useState(true);

  if (showSetup) {
    return (
      <SetupModal
        onSubmit={({ name1, name2, from1, from2, score, fouls, time }) => {
          setPlayer1(name1);
          setPlayer2(name2);
          setMaxScore(score);
          setMaxFoul(fouls);
          setFrom1(from1);
          setFrom2(from2);
          setDuration(time * 60);
          setShowSetup(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-between py-10">
      <Timer duration={duration} />
      <div className="flex flex-col md:flex-row justify-center items-center gap-96">
        <PlayerCard
          name={player1}
          score={score1}
          setScore={setScore1}
          gradient="from-black to-red-500"
        />
        <PlayerCard
          name={player2}
          score={score2}
          setScore={setScore2}
          gradient="from-black to-blue-500"
        />
      </div>
    </div>
  );
}
