// PlayerCard.tsx
type Props = {
  name: string;
  from?: string;
  score: number;
  fouls: number;
  maxFoul: number;
  setFouls: (val: number) => void; // Used for direct setting, e.g., undo
  setScore: (val: number) => void; // Used for direct setting, e.g., undo
  addScore: (points: number) => void; // Used for incrementing
  addFoul: (change: number) => void; // Used for incrementing/decrementing fouls via buttons
  gradient: string;
  gradient2?: string;
  disabled?: boolean;
  isFirstScorer?: boolean;
  showControls: boolean; // Receive visibility state from parent
  setShowControls: (value: boolean | ((prevState: boolean) => boolean)) => void; // Receive setter from parent
};

export default function PlayerCard({
  name,
  from,
  score,
  fouls,
  maxFoul,
  setFouls,
  setScore,
  addScore,
  addFoul,
  gradient,
  gradient2,
  disabled = false,
  isFirstScorer = false,
  showControls,
  setShowControls,
}: Props) {
  const scoreAreaPadding = showControls ? 'py-10' : 'py-30';

  return (
    <div className="flex flex-col items-center w-full max-h-[90vh]"> {/* Ensure card takes full allocated height but not more than screen */}
      {/* Nama Pemain dan Asal */}
      <div className={`flex flex-row items-center justify-between w-full px-4 bg-gradient-to-r ${gradient2} mb-2.5 flex-shrink-0`}>
        <h2 className="text-[40px] montserrat text-start mr-2 truncate" title={name}>
          {name.toUpperCase()}
        </h2>
        {from && <p className="text-[35px] text-white whitespace-nowrap flex-shrink-0">{from.toUpperCase()}</p>}
      </div>

      {/* Kartu Tampilan Skor dan Pelanggaran */}
      <div
        className={`relative flex flex-col items-center justify-center border-2 px-6 sm:px-12 ${scoreAreaPadding} rounded-lg shadow-lg bg-gradient-to-br ${gradient} text-white transition-all duration-300 hover:shadow-xl w-full flex-grow min-h-0`}
      >
        {isFirstScorer && (
          <div
            className="absolute top-2 right-2 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-green-500 rounded-md shadow-md border-2 border-green-300 z-10"
            title="Pencetak Skor Pertama"
          ></div>
        )}

        {/* Skor */}
        <div className="karantina-regular text-[80px] xs:text-[100px] sm:text-[140px] md:text-[180px] lg:text-[220px] xl:text-[280px] 2xl:text-[500px] font-bold bg-white bg-clip-text text-transparent leading-none my-auto">
          {score}
        </div>
      </div>

      {/* Tampilan Pelanggaran */}
      {maxFoul > 0 && (
        <div className="flex flex-col border rounded-md px-2 py-1 bg-[rgba(55,65,81,0.6)] gap-1 my-4 flex-shrink-0">
          {Array.from({ length: Math.ceil(maxFoul / 7) }).map(
            (_, rowIndex) => {
              const start = rowIndex * 7;
              const end = start + 7;
              return (
                <div key={rowIndex} className="flex gap-1 justify-center w-full">
                  {[...Array(maxFoul)].slice(start, end).map((_, idx) => {
                    const globalIdx = start + idx;
                    return (
                      <div
                        key={globalIdx}
                        className={`w-8 sm:w-12 md:w-16 lg:w-20 h-3 sm:h-4 rounded-full border ${
                          globalIdx < fouls
                            ? "bg-yellow-400 border-yellow-600"
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

      {/* --- Panel Kontrol yang Dapat Dilipat --- */}
      <button
        onClick={() => setShowControls(prev => !prev)}
        className="mt-auto mb-1 text-gray-400 hover:text-white transition text-sm flex items-center gap-1 flex-shrink-0" // mt-auto pushes this (and panel below) to bottom
        aria-expanded={showControls}
        aria-controls={`controls-${name.replace(/\s+/g, '-')}`}
      >
        Kontrol
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 transition-transform duration-300 ${
            showControls ? 'rotate-180' : 'rotate-0'
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        id={`controls-${name.replace(/\s+/g, '-')}`}
        className={`w-full overflow-hidden transition-[max-height,padding,margin] duration-500 ease-in-out flex-shrink-0 ${
          showControls ? 'max-h-screen mb-2' : 'max-h-0 mb-0' // Target screen height for expansion
        }`}
      >
        {showControls && (
          <div className="flex flex-col items-center bg-gray-800 rounded-lg p-3 shadow-lg">
            {/* Content of controls panel */}
            <div className="flex gap-2 mb-2 justify-around w-full">
              {[1, 2, 3].map((val) => (
                <button
                  key={val}
                  onClick={() => addScore(val)}
                  className="bg-gray-700 text-white px-3 py-1 rounded text-sm md:text-lg hover:bg-gray-600 transition disabled:opacity-50 w-full"
                  disabled={disabled}
                >
                  +{val}
                </button>
              ))}
              {maxFoul > 0 && (
                <button
                  onClick={() => addFoul(1)}
                  className="text-lg px-3 bg-red-600 text-white hover:bg-red-700 border border-red-800 rounded transition disabled:opacity-50 w-full"
                  disabled={disabled || fouls >= maxFoul}
                  title="Tambah Pelanggaran (+1)"
                >
                  X
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 w-full">
              <button
                onClick={() => setScore(Math.max(0, score - 1))}
                className="text-xs md:text-sm px-3 py-1 bg-gray-700 text-white hover:bg-gray-600 border border-gray-900 rounded transition disabled:opacity-50 w-full"
                disabled={disabled || score <= 0}
              >
                Kurangi Skor (-1)
              </button>
              {maxFoul > 0 && (
                <button
                  onClick={() => setFouls(Math.max(0, fouls - 1))}
                  className="text-xs md:text-sm px-3 py-1 bg-gray-700 text-white hover:bg-gray-600 border border-gray-900 rounded transition disabled:opacity-50 w-full"
                  disabled={disabled || fouls <= 0}
                >
                  Kurangi Pelanggaran (-1)
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      {/* --- End Control Panel --- */}
    </div>
  );
}