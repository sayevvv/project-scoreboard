// PlayerCard.tsx

type Props = {
  name: string;
  from?: string;
  score: number;
  fouls: number;
  maxFoul: number;
  setFouls: (val: number) => void;
  setScore: (val: number) => void;
  addScore: (points: number) => void;
  addFoul: (change: number) => void;
  gradient: string;
  gradient2?: string;
  disabled?: boolean;
  isFirstScorer?: boolean;
  showControls: boolean;
  setShowControls: (value: boolean | ((prevState: boolean) => boolean)) => void;
  playerIdentifier: 1 | 2; // BARU: Untuk mengidentifikasi pemain
  onSetFirstScorerManually: (player: 1 | 2 | null) => void; // BARU: Fungsi callback
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
  playerIdentifier, // BARU
  onSetFirstScorerManually, // BARU
}: Props) {
  const scoreAreaPadding = showControls ? "py-10" : "py-30"; // Sesuaikan padding ini jika perlu

  return (
    <div className="flex flex-col items-center w-full max-h-[90vh]">
      <div
                // 1. Diubah menjadi flex-col dan rata tengah
                className={`flex flex-col items-center justify-center text-center w-full p-3 bg-gradient-to-r ${gradient2} mb-2.5 flex-shrink-0 rounded-t-lg`}
            >
                {/* 2. Ukuran font dikecilkan dan w-full ditambahkan */}
                <h2
                    className="text-2xl lg:text-3xl montserrat font-bold w-full truncate"
                    title={name}
                >
                    {name.toUpperCase()}
                </h2>
                {from && (
                    // 3. Ukuran font disesuaikan, truncate dan w-full ditambahkan
                    <p className="text-lg lg:text-xl text-gray-200 w-full truncate mt-1">
                        {from.toUpperCase()}
                    </p>
                )}
            </div>

      <div
        className={`relative flex flex-col items-center justify-center border-2  px-6 sm:px-12 ${scoreAreaPadding} rounded-lg shadow-lg bg-gradient-to-br ${gradient} text-white transition-all duration-300 hover:shadow-xl w-full flex-grow min-h-0`}
      >
        {isFirstScorer && (
          <div
            className="absolute top-2 right-2 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-green-500 rounded-md shadow-md border-2 border-green-300 z-10 text-white flex items-center justify-center text-[10px] sm:text-[12px] md:text-[14px] font-bold p-3 sm:p-4" // Ukuran font dan padding disesuaikan
            title="Pencetak Skor Pertama"
          >
            S
          </div>
        )}
        <div className="karantina-regular text-[80px] xs:text-[100px] sm:text-[140px] md:text-[180px] lg:text-[220px] xl:text-[280px] 2xl:text-[380px] font-bold bg-white bg-clip-text text-transparent leading-none my-auto">
          {score}
        </div>
      </div>

      {maxFoul > 0 && (
        <div className="flex flex-col border rounded-md px-2 py-1 bg-[rgba(55,65,81,0.6)] gap-1 my-4 flex-shrink-0">
          {Array.from({ length: Math.ceil(maxFoul / 7) }).map((_, rowIndex) => {
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
          })}
        </div>
      )}

      <button
        onClick={() => setShowControls((prev) => !prev)}
        className="mt-auto mb-1 text-gray-400 hover:text-white transition text-sm flex items-center gap-1 flex-shrink-0"
        aria-expanded={showControls}
        aria-controls={`controls-${name.replace(/\s+/g, "-")}`}
      >
        Kontrol
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 transition-transform duration-300 ${
            showControls ? "rotate-180" : "rotate-0"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <div
        id={`controls-${name.replace(/\s+/g, "-")}`}
        className={`w-full overflow-hidden transition-[max-height,padding,margin] duration-500 ease-in-out flex-shrink-0 ${
          showControls ? "max-h-screen mb-2" : "max-h-0 mb-0"
        }`}
      >
        {showControls && (
          <div className="flex flex-col items-center bg-gray-800 rounded-lg p-3 shadow-lg">
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
            <div className="flex items-center gap-2 w-full mb-2">
              {" "}
              {/* Tambah mb-2 */}
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
                  Kurangi Foul (-1)
                </button>
              )}
            </div>

            {/* BARU: Tombol untuk First Scorer Manual */}
            <div className="w-full mt-1">
              {isFirstScorer ? (
                <button
                  onClick={() => onSetFirstScorerManually(null)}
                  className="w-full bg-yellow-600 text-white px-3 py-1.5 rounded text-xs md:text-sm hover:bg-yellow-700 transition disabled:opacity-50"
                  disabled={disabled}
                  title="Hapus Status Skor Pertama Pemain Ini"
                >
                  BATALKAN SENSHU
                </button>
              ) : (
                <button
                  onClick={() => onSetFirstScorerManually(playerIdentifier)}
                  className="w-full bg-green-600 text-white px-3 py-1.5 rounded text-xs md:text-sm hover:bg-green-700 transition disabled:opacity-50"
                  disabled={disabled}
                  title="Tandai Pemain Ini Sebagai Pencetak Skor Pertama"
                >
                  SET SENSHU
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
