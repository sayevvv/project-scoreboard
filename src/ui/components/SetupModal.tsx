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
    tatamiLabel: string;
    tatamiNumber: string;
    matchLabel: string;
  }) => void;
};

const MAX_LENGTH_NAME = 15;
const MAX_LENGTH_FROM = 15;
const MAX_LENGTH_LABEL = 15;
const MAX_LENGTH_NUMBER = 5;

export default function SetupModal({ onSubmit }: Props) {
  const [name1, setName1] = useState("AO");
  const [name2, setName2] = useState("AKA");
  const [from1, setFrom1] = useState("");
  const [from2, setFrom2] = useState("");
  const [fouls, setFouls] = useState(5);
  const [score, setScore] = useState(1000);
  const [time, setTime] = useState(1);

  const [tatamiLabel, setTatamiLabel] = useState("TATAMI");
  const [tatamiNumber, setTatamiNumber] = useState("2");
  const [matchLabel, setMatchLabel] = useState("SEMI FINAL");
  const [isMatchSettingsOpen, setIsMatchSettingsOpen] = useState(false);

  const handleSubmit = () => {
    onSubmit({
      name1: name1.slice(0, MAX_LENGTH_NAME),
      name2: name2.slice(0, MAX_LENGTH_NAME),
      from1: from1.slice(0, MAX_LENGTH_FROM),
      from2: from2.slice(0, MAX_LENGTH_FROM),
      time,
      fouls,
      score,
      tatamiLabel: tatamiLabel.slice(0, MAX_LENGTH_LABEL),
      tatamiNumber: tatamiNumber.slice(0, MAX_LENGTH_NUMBER),
      matchLabel: matchLabel.slice(0, MAX_LENGTH_LABEL),
    });
  };

  return (
    <>
      <div className="montserrat fixed inset-0 z-50 bg-black/60 p-4 overflow-y-auto flex flex-col items-center gap-5 pt-10 pb-20">
        <FullscreenToggleButton />
        <header>
          <h2 className="karantina-bold text-5xl md:text-6xl font-bold mb-3 text-center text-white">
            Setup Pertandingan
          </h2>
          <p className="text-sm text-gray-400 text-center mb-4">
            Silakan atur pertandingan sesuai keinginan Anda.
          </p>
        </header>

        <div className="bg-gray-950 rounded-xl p-6 md:p-8 w-full shadow-lg max-w-5xl border-white border-1 text-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LEFT COLUMN */}
            <div className="flex flex-col gap-6">
              {/* Waktu */}
              <section className="flex flex-col gap-3 p-4 rounded-lg bg-slate-900">
                <h3 className="font-semibold text-white">Waktu Maksimal</h3>
                <label className="flex flex-col items-center justify-center text-white text-center w-full">
                  <div className="flex items-center justify-center gap-2 select-none relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTime((prev) => Math.max(prev - 1, 1));
                      }}
                      className="w-8 h-8 flex items-center justify-center bg-slate-800 text-white rounded-full transition z-10 hover:bg-slate-700"
                    >
                      –
                    </button>
                    <div className="relative">
                      <input
                        type="number"
                        min={1}
                        value={time}
                        onChange={(e) => setTime(Math.max(1, Number(e.target.value)))}
                        className="w-24 text-center px-2 py-2 pr-10 rounded-2xl bg-slate-950 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-700 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-sm pointer-events-none">menit</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTime((prev) => prev + 1);
                      }}
                      className="w-8 h-8 flex items-center justify-center bg-slate-800 text-white rounded-full transition hover:bg-slate-700"
                    >
                      +
                    </button>
                  </div>
                </label>
              </section>

              {/* Pengaturan Tampilan */}
              <section className="flex flex-col gap-3 p-4 rounded-lg bg-slate-900">
                <h3 className="font-semibold text-white">Pengaturan Tampilan</h3>
                <label className="flex flex-col text-white w-full">
                  Judul Tatami
                  <input
                    type="text"
                    value={tatamiLabel}
                    maxLength={MAX_LENGTH_LABEL}
                    onChange={(e) => setTatamiLabel(e.target.value)}
                    className="px-4 py-2 mt-1 rounded-lg bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </label>
                <label className="flex flex-col text-white w-full">
                  Nomor Tatami
                  <input
                    type="text"
                    value={tatamiNumber}
                    maxLength={MAX_LENGTH_NUMBER}
                    onChange={(e) => setTatamiNumber(e.target.value)}
                    className="px-4 py-2 mt-1 rounded-lg bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </label>
                <label className="flex flex-col text-white w-full">
                  Babak / Keterangan
                  <input
                    type="text"
                    value={matchLabel}
                    maxLength={MAX_LENGTH_LABEL}
                    onChange={(e) => setMatchLabel(e.target.value)}
                    placeholder="Contoh: FINAL, PENYISIHAN, etc."
                    className="px-4 py-2 mt-1 rounded-lg bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </label>
              </section>

              {/* (Dipindah ke bawah dan dibuat span 2 kolom) */}
            </div>

            {/* RIGHT COLUMN */}
            <div className="flex flex-col gap-6">
              <section className="flex flex-col gap-4 p-4 rounded-lg bg-slate-900">
                <h3 className="font-semibold text-white">Data Pemain</h3>
                <label className="flex flex-col text-white w-full">
                  Nama Pemain 1
                  <input
                    type="text"
                    value={name1}
                    maxLength={MAX_LENGTH_NAME}
                    onChange={(e) => setName1(e.target.value)}
                    className="px-4 py-2 mt-1 rounded-2xl bg-gradient-to-r from-5% hover:from-30% from-slate-950 to-blue-950 text-white focus:outline-none focus:ring-2 focus:ring-blue-700"
                  />
                </label>
                <label className="flex flex-col text-white w-full">
                  Asal Pemain 1
                  <input
                    type="text"
                    placeholder="opsional"
                    value={from1}
                    maxLength={MAX_LENGTH_FROM}
                    onChange={(e) => setFrom1(e.target.value)}
                    className="px-4 py-2 mt-1 rounded-2xl bg-gradient-to-r from-5% hover:from-30% from-slate-950 to-blue-950 text-white focus:outline-none focus:ring-2 focus:ring-blue-700"
                  />
                </label>
                <div className="h-px bg-slate-700/60 my-2"></div>
                <label className="flex flex-col text-white w-full">
                  Nama Pemain 2
                  <input
                    type="text"
                    value={name2}
                    maxLength={MAX_LENGTH_NAME}
                    onChange={(e) => setName2(e.target.value)}
                    className="px-4 py-2 mt-1 rounded-2xl bg-gradient-to-r from-5% hover:from-30% from-slate-950 to-red-950 text-white focus:outline-none focus:ring-2 focus:ring-red-700"
                  />
                </label>
                <label className="flex flex-col text-white w-full">
                  Asal Pemain 2
                  <input
                    type="text"
                    placeholder="opsional"
                    value={from2}
                    maxLength={MAX_LENGTH_FROM}
                    onChange={(e) => setFrom2(e.target.value)}
                    className="px-4 py-2 mt-1 rounded-2xl bg-gradient-to-r from-5% hover:from-30% from-slate-950 to-red-950 text-white focus:outline-none focus:ring-2 focus:ring-red-700"
                  />
                </label>
              </section>
            </div>
            {/* Pengaturan Pertandingan (Opsional) - span 2 kolom, dropdown/accordion */}
            <div className="md:col-span-2">
              <section className="flex flex-col gap-3 p-4 rounded-lg bg-slate-900">
                <button
                  type="button"
                  onClick={() => setIsMatchSettingsOpen((v) => !v)}
                  className="flex items-center justify-between w-full px-3 py-2 rounded-md bg-slate-800 hover:bg-slate-700 transition-colors text-white"
                >
                  <span className="font-semibold">
                    Pengaturan Pertandingan <span className="text-xs text-gray-400">(Opsional)</span>
                  </span>
                  <span
                    className={`transition-transform duration-200 ${isMatchSettingsOpen ? "rotate-180" : "rotate-0"}`}
                  >
                    ▼
                  </span>
                </button>

                {isMatchSettingsOpen && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                    {/* Skor Maksimal (angka) */}
                    <div className="flex flex-col gap-2">
                      <label className="text-white">Skor Maksimal</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          value={score}
                          onChange={(e) => setScore(Number(e.target.value))}
                          className="w-28 text-center px-2 py-2 rounded-2xl bg-slate-950 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                        <span className="text-white/80 text-sm">poin</span>
                      </div>
                    </div>
                    {/* Pelanggaran Maksimal (angka) */}
                    <div className="flex flex-col gap-2">
                      <label className="text-white">Pelanggaran Maksimal</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          value={fouls}
                          onChange={(e) => setFouls(Number(e.target.value))}
                          className="w-28 text-center px-2 py-2 rounded-2xl bg-slate-950 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                        <span className="text-white/80 text-sm">0 = tanpa batas</span>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="px-6 py-3 rounded-lg border border-blue-600 text-blue-300 hover:bg-blue-900 hover:text-white transition text-lg font-semibold flex-shrink-0"
        >
          Mulai Permainan
        </button>
      </div>
    </>
  );
}
