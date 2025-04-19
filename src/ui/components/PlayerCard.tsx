type Props = {
  name: string;
  score: number;
  setScore: (val: number) => void;
  gradient: string;
};

export default function PlayerCard({ name, score, setScore, gradient }: Props) {
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-mono mb-2">{name}</h2>
      <div
        className={`text-8xl font-bold bg-gradient-to-b ${gradient} text-transparent bg-clip-text`}
      >
        {score}
      </div>
      <div className="flex gap-1 my-4">
        {[...Array(6)].map((_, idx) => (
          <div
            key={idx}
            className="w-4 h-2 rounded-full border border-gray-400"
          ></div>
        ))}
      </div>
      <div className="flex gap-2">
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
    </div>
  );
}