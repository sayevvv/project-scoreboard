type Props = {
  name: string;
  from?: string;
  score: number;
  fouls: number;
  maxFoul: number;
  setFouls: (val: number) => void;
  setScore: (val: number) => void;
  gradient: string;
  disabled?: boolean;
};

export default function PlayerCard({
  name,
  from,
  score,
  fouls,
  maxFoul,
  setFouls,
  setScore,
  gradient,
  disabled = false,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex flex-row items-center justify-between w-full">
        <h2 className="text-[8px] md:text-[30px] font-mono mb-1 text-start">
          {name}
        </h2>
        {from && <p className="text-lg text-white-600 mb-2">{from}</p>}
      </div>
      <div
        className={`flex flex-col items-center border-2 px-24 py-8 rounded-lg shadow-lg bg-gradient-to-b ${gradient} text-white transition-all duration-300 hover:shadow-xl`}
      >
        <div className="text-[150px] md:text-[180px] font-bold bg-white bg-clip-text">
          {score}
        </div>

        {maxFoul > 0 && (
          <div className="flex flex-col gap-1 my-4">
            {Array.from({ length: Math.ceil(maxFoul / 7) }).map(
              (_, rowIndex) => {
                const start = rowIndex * 7;
                const end = start + 7;
                return (
                  <div key={rowIndex} className="flex gap-1 justify-center">
                    {[...Array(maxFoul).slice(start, end)].map((_, idx) => {
                      const globalIdx = start + idx;
                      return (
                        <div
                          key={globalIdx}
                          className={`w-7 h-4 rounded-full border ${
                            globalIdx < fouls
                              ? "bg-red-500 border-red-500"
                              : "border-gray-400"
                          }`}
                        ></div>
                      );
                    })}
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>

      {/* Controls OUTSIDE of card */}
      <div className="flex flex-col items-center mt-4 bg-gray-600 rounded-lg p-4 shadow-lg w-full">
        <div className="flex gap-2 mb-2 justify-around w-full">
          {[1, 2, 3].map((val) => (
            <button
              key={val}
              onClick={() => setScore(score + val)}
              className="bg-black text-white px-3 py-1 rounded text-lg hover:bg-gray-800 transition disabled:opacity-50 w-full"
              disabled={disabled}
            >
              +{val}
            </button>
          ))}
          <button
            onClick={() => setFouls(fouls < maxFoul ? fouls + 1 : maxFoul)}
            className="text-xl px-3 not-first:bg-red-600 text-white hover:bg-gray-800 border border-red-900 rounded-lg transition disabled:opacity-50 w-full"
            disabled={disabled}
          >
            X
          </button>
        </div>
        <div className="flex flex-col items-center gap-2 w-full">
          <button
            onClick={() => setScore(Math.max(0, score - 1))}
            className="text-sm px-3 py-1 bg-black text-white hover:bg-gray-800 border border-black rounded-lg transition disabled:opacity-50 w-full"
            disabled={disabled}
          >
            Kurangi Skor (-1)
          </button>

          <button
            onClick={() => setFouls(Math.max(0, fouls - 1))}
            className="text-sm px-3 py-1 bg-black text-white hover:bg-gray-800 border border-black rounded-lg transition disabled:opacity-50 w-full"
            disabled={disabled}
          >
            Kurangi Pelanggaran
          </button>
        </div>
      </div>
    </div>
  );
}
