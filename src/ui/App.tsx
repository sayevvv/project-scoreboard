import { useState } from 'react';
import PlayerCard from './components/PlayerCard';
import Timer from './components/Timer';

export default function App() {
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-between py-10">
      <Timer />
      <div className="flex flex-col md:flex-row justify-center items-center gap-16">
        <PlayerCard
          name="Pemain 1"
          score={score1}
          setScore={setScore1}
          gradient="from-red-500 to-red-700"
        />
        <PlayerCard
          name="Pemain 2"
          score={score2}
          setScore={setScore2}
          gradient="from-purple-500 to-purple-700"
        />
      </div>
    </div>
  );
}