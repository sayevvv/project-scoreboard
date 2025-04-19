import { useState } from "react";

type Props = {
  name: string;
  score: number;
  setScore: (val: number) => void;
  gradient: string;
};

export default function PlayerCard({ name, score, setScore, gradient }: Props) {
  const [fouls, setFouls] = useState(0);

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-[60px] font-mono mb-2">{name}</h2>
      <div
        className={`text-[230px] font-bold bg-gradient-to-b ${gradient} text-transparent bg-clip-text`}
      >
        {score}
      </div>
      <div className="flex gap-1 my-4">
        {[...Array(6)].map((_, idx) => (
          <div
            key={idx}
            className={`w-7 h-4 rounded-full ${
              idx < fouls ? "bg-red-500" : "border-gray-400"
            }`}
          ></div>
        ))}
      </div>
      <div className="flex gap-2 mb-2">
        {[1, 2, 3].map((val) => (
          <button
            key={val}
            onClick={() => setScore(score + val)}
            className="bg-black text-white px-3 py-1 rounded text-lg"
          >
            +{val}
          </button>
        ))}
      </div>
      <button
        onClick={() => setFouls(fouls < 6 ? fouls + 1 : 6)}
        className="text-xl px-3 py-1 bg-red-100 hover:bg-red-200 border border-red-300 rounded-full"
      >
        Tambah Pelanggaran
      </button>
    </div>
  );
}
