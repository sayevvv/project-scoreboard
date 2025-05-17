import { useState } from "react";
import FullscreenToggleButton from "./FullScreenToggleButton";

type Props = {
  onSubmit: (values: {
    name1: string;
    name2: string;
    from1: string;
    from2: string;
    time: number;
    fouls: number;
    score: number;
  }) => void;
};

export default function SetupModal({ onSubmit }: Props) {
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [from1, setFrom1] = useState("");
  const [from2, setFrom2] = useState("");
  const [fouls, setFouls] = useState(4);
  const [score, setScore] = useState(20);
  const [time, setTime] = useState(7);

  return (
    <>
      <div className="montserrat min-h-screen flex flex-col items-center justify-center bg-black bg-opacity-60 fixed inset-0 z-50 gap-5">
        <FullscreenToggleButton />
        <header>
          <h2 className="karantina-bold text-6xl font-bold mb-3 text-center text-white">
            Setup Pertandingan
          </h2>
          <p className="text-sm text-gray-400 text-center mb-4">
            Silakan atur pertandingan sesuai keinginan Anda.
          </p>
        </header>
        <div className="bg-gray-950 rounded-xl p-8 w-full shadow-lg max-w-2xl border-white border-1 text-white">
          <div className="flex flex-col gap-4">
            <section className="flex flex-col gap-4 justify-center items-center">
              {/* Waktu Maksimal */}
              <label className="flex flex-col items-center justify-center text-white text-center w-fit">
                Waktu Maksimal
                <div className="flex items-center justify-center gap-2 mt-2 select-none relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTime((prev) => Math.max(prev - 1, 0));
                    }}
                    className="w-8 h-8 flex items-center justify-center bg-slate-800 text-white rounded-full transition z-10"
                  >
                    –
                  </button>
                  <div className="relative">
                    <input
                      type="number"
                      value={time}
                      onChange={(e) => setTime(Number(e.target.value))}
                      className="w-24 text-center px-2 py-2 pr-10 rounded-2xl bg-slate-950 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-red-950
          [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-sm pointer-events-none">
                      menit
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTime((prev) => prev + 1);
                    }}
                    className="w-8 h-8 flex items-center justify-center bg-slate-800 text-white rounded-full transition"
                  >
                    +
                  </button>
                </div>
              </label>

              {/* Skor Maksimal */}
              <label className="flex flex-col items-center justify-center text-white text-center">
                Skor Maksimal
                <div className="flex items-center justify-center gap-2 mt-2 select-none">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setScore((prev) => Math.max(prev - 1, 0));
                    }}
                    className="w-8 h-8 flex items-center justify-center bg-slate-800 text-white rounded-full transition z-10"
                  >
                    –
                  </button>
                  <div className="relative">
                    <input
                      type="number"
                      value={score}
                      onChange={(e) => setScore(Number(e.target.value))}
                      className="w-24 text-center px-2 py-2 pr-10 rounded-2xl bg-slate-950 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-red-950
          [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-sm pointer-events-none">
                      poin
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setScore((prev) => prev + 1);
                    }}
                    className="w-8 h-8 flex items-center justify-center bg-slate-800 text-white rounded-full transition z-10"
                  >
                    +
                  </button>
                </div>
              </label>

              {/* Pelanggaran Maksimal */}
              <label className="flex flex-col items-center justify-center text-white text-center">
                Pelanggaran Maksimal{" "}
                <span className="text-sm text-gray-400">(opsional)</span>
                <div className="flex items-center justify-center gap-2 mt-2 select-none">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFouls((prev) => Math.max(prev - 1, 0));
                    }}
                    className="w-8 h-8 flex items-center justify-center bg-slate-800 text-white rounded-full transition z-10"
                  >
                    –
                  </button>
                  <div className="relative">
                    <input
                      type="number"
                      value={fouls}
                      onChange={(e) => setFouls(Number(e.target.value))}
                      className="w-24 text-center px-2 py-2 pr-10 rounded-2xl bg-slate-950 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-red-950
          [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-sm pointer-events-none">
                      x
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFouls((prev) => prev + 1);
                    }}
                    className="w-8 h-8 flex items-center justify-center bg-slate-800 text-white rounded-full transition z-10"
                  >
                    +
                  </button>
                </div>
              </label>
            </section>

            <section className="flex items-center justify-around gap-4">
              <div className="flex flex-col gap-4">
                <label className="flex flex-col text-white w-full">
                  Nama Pemain 1
                  <input
                    type="text"
                    value={name1}
                    onChange={(e) => setName1(e.target.value)}
                    className="px-4 py-2 rounded-2xl bg-gradient-to-r from-5% hover:from-30% from-slate-950 to-red-950 text-white hover:bg-gradient-to-r"
                  />
                </label>
                <label className="flex flex-col text-white w-full">
                  Asal Pemain 1
                  <input
                    type="text"
                    placeholder="opsional"
                    value={from1}
                    onChange={(e) => setFrom1(e.target.value)}
                    className="px-4 py-2 rounded-2xl bg-gradient-to-r from-5% hover:from-30% from-slate-950 to-red-950 text-white hover:bg-gradient-to-r"
                  />
                </label>
              </div>
              <div className="flex flex-col gap-4">
                <label className="flex flex-col text-white w-full">
                  Nama Pemain 2
                  <input
                    type="text"
                    value={name2}
                    onChange={(e) => setName2(e.target.value)}
                    className="px-4 py-2 rounded-2xl bg-gradient-to-r from-5% hover:from-30% from-slate-950 to-blue-950 text-white"
                  />
                </label>
                <label className="flex flex-col text-white w-full">
                  Asal Pemain 2
                  <input
                    type="text"
                    placeholder="opsional"
                    value={from2}
                    onChange={(e) => setFrom2(e.target.value)}
                    className="px-4 py-2 rounded-2xl bg-gradient-to-r from-5% hover:from-30% from-slate-950 to-blue-950 text-white hover:bg-gradient-to-r"
                  />
                </label>
              </div>
            </section>
          </div>
        </div>
        <button
          onClick={() => onSubmit({ name1, name2, from1, from2, time, fouls, score })}
          className="mb-4 px-4 py-2 rounded-lg border border-blue-600 text-blue-300 hover:bg-blue-900 hover:text-white transition"
        >
          Mulai Permainan
        </button>
      </div>
    </>
  );
}
