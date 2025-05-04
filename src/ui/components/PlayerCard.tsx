import { useState } from 'react';

// Define the Props type to include addScore and addFoul
type Props = {
    name: string;
    from?: string;
    score: number;
    fouls: number;
    maxFoul: number;
    setFouls: (val: number) => void; // Still needed for decrement/direct set
    setScore: (val: number) => void; // Still needed for decrement/direct set
    addScore: (points: number) => void; // NEW: Prop for adding score via App logic
    addFoul: (change: number) => void;  // NEW: Prop for adding foul via App logic
    gradient: string;
    disabled?: boolean;
};

export default function PlayerCard({
    name,
    from,
    score,
    fouls,
    maxFoul,
    setFouls, // Keep for decrement
    setScore, // Keep for decrement
    addScore, // Destructure the new prop
    addFoul,  // Destructure the new prop
    gradient,
    disabled = false,
}: Props) {
    const [showControls, setShowControls] = useState(true);

    return (
        <div className="flex flex-col items-center justify-center w-full md:w-auto">
            {/* Player Name and Origin */}
            <div className="flex flex-row items-center justify-between w-full px-4 md:px-0 mb-1">
                <h2 className="text-[18px] sm:text-[24px] md:text-[30px] font-mono text-start mr-2 truncate">
                    {name}
                </h2>
                {from && <p className="text-xs sm:text-sm md:text-lg text-gray-400 whitespace-nowrap">{from}</p>}
            </div>

            {/* Score and Foul Display Card */}
            <div
                className={`flex flex-col items-center border-2 px-12 sm:px-16 md:px-24 py-4 md:py-8 rounded-lg shadow-lg bg-gradient-to-b ${gradient} text-white transition-all duration-300 hover:shadow-xl w-full`}
            >
                {/* Score */}
                <div className="karantina-regular text-[100px] sm:text-[140px] md:text-[350px] font-bold bg-white bg-clip-text text-transparent leading-none mb-3">
                    {score}
                </div>

                {/* Fouls Display */}
                {maxFoul > 0 && (
                    <div className="flex flex-col border rounded-md px-2 py-1 bg-[rgba(55,65,81,0.6)] gap-1 my-2 md:my-4">
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
                                                    className={`w-5 h-3 sm:w-6 sm:h-3.5 md:w-7 md:h-4 rounded-full border ${
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

            {/* --- Collapsible Control Panel --- */}
            <button
                onClick={() => setShowControls(!showControls)}
                className="mt-2 text-gray-400 hover:text-white transition text-sm flex items-center gap-1"
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
                className={`w-full overflow-hidden transition-[max-height,padding,margin] duration-500 ease-in-out ${
                    showControls ? 'max-h-[300px] mt-2' : 'max-h-0 mt-0'
                }`}
            >
                {showControls && (
                    <div className="flex flex-col items-center bg-gray-800 rounded-lg p-3 shadow-lg">
                        <div className="flex gap-2 mb-2 justify-around w-full">
                            {/* --- USE addScore FOR INCREMENTS --- */}
                            {[1, 2, 3].map((val) => (
                                <button
                                    key={val}
                                    onClick={() => addScore(val)} // Use addScore here
                                    className="bg-gray-700 text-white px-3 py-1 rounded text-sm md:text-lg hover:bg-gray-600 transition disabled:opacity-50 w-full"
                                    disabled={disabled}
                                >
                                    +{val}
                                </button>
                            ))}
                            {/* --- USE addFoul FOR FOUL INCREMENT --- */}
                            {maxFoul > 0 && (
                                <button
                                    onClick={() => addFoul(1)} // Use addFoul here (passing 1 as the change)
                                    className="text-lg px-3 bg-red-600 text-white hover:bg-red-700 border border-red-800 rounded transition disabled:opacity-50 w-full"
                                    disabled={disabled || fouls >= maxFoul}
                                >
                                    X
                                </button>
                            )}
                        </div>
                        <div className="flex flex-col items-center gap-2 w-full">
                            {/* --- Keep setScore for decrement --- */}
                            <button
                                onClick={() => setScore(Math.max(0, score - 1))}
                                className="text-xs md:text-sm px-3 py-1 bg-gray-700 text-white hover:bg-gray-600 border border-gray-900 rounded transition disabled:opacity-50 w-full"
                                disabled={disabled || score <= 0}
                            >
                                Kurangi Skor (-1)
                            </button>

                            {/* --- Keep setFouls for decrement --- */}
                            {maxFoul > 0 && (
                                <button
                                    onClick={() => setFouls(Math.max(0, fouls - 1))}
                                    className="text-xs md:text-sm px-3 py-1 bg-gray-700 text-white hover:bg-gray-600 border border-gray-900 rounded transition disabled:opacity-50 w-full"
                                    disabled={disabled || fouls <= 0}
                                >
                                    Kurangi Pelanggaran
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
            {/* --- End Collapsible Control Panel --- */}
        </div>
    );
}