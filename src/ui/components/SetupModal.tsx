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
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [from1, setFrom1] = useState("");
  const [from2, setFrom2] = useState("");
  const [fouls, setFouls] = useState(5);
  const [score, setScore] = useState(1000);
  const [time, setTime] = useState(3);

  const [tatamiLabel, setTatamiLabel] = useState("TATAMI");
  const [tatamiNumber, setTatamiNumber] = useState("2");
  const [matchLabel, setMatchLabel] = useState("SEMI FINAL");

  // State untuk accordion
  const [isAdvancedSettingsOpen, setIsAdvancedSettingsOpen] = useState(false);
  // BARU: State untuk accordion tampilan
  const [isDisplaySettingsOpen, setIsDisplaySettingsOpen] = useState(false);

  const toggleAdvancedSettings = () => setIsAdvancedSettingsOpen(!isAdvancedSettingsOpen);
  const toggleDisplaySettings = () => setIsDisplaySettingsOpen(!isDisplaySettingsOpen);

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
        <div className="bg-gray-950 rounded-xl p-6 md:p-8 w-full shadow-lg max-w-2xl border-white border-1 text-white">
          <div className="flex flex-col gap-5">
            {/* Pengaturan Waktu di luar accordion */}
            <section className="flex flex-col gap-4 justify-center items-center">
              <label className="flex flex-col items-center justify-center text-white text-center w-fit">
                Waktu Maksimal
                <div className="flex items-center justify-center gap-2 mt-2 select-none relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTime((prev) => Math.max(prev - 1, 1)); // Minimal 1 menit
                    }}
                    className="w-8 h-8 flex items-center justify-center bg-slate-800 text-white rounded-full transition z-10 hover:bg-slate-700"
                  >
                    –
                  </button>
                  <div className="relative">
                    <input
                      type="number"
                      value={time}
                      onChange={(e) => setTime(Math.max(1, Number(e.target.value)))} // Minimal 1 menit
                      className="w-24 text-center px-2 py-2 pr-10 rounded-2xl bg-slate-950 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-red-700
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
                    className="w-8 h-8 flex items-center justify-center bg-slate-800 text-white rounded-full transition hover:bg-slate-700"
                  >
                    +
                  </button>
                </div>
              </label>
            </section>

             {/* BARU: Accordion untuk Pengaturan Tampilan */}
            <div className="w-full">
              <button
                type="button"
                onClick={toggleDisplaySettings}
                className="flex justify-between items-center w-full p-3 text-left text-white bg-slate-800 hover:bg-slate-700 rounded-lg focus:outline-none transition-colors"
              >
                <span className="font-medium">Pengaturan Tampilan (Opsional)</span>
                <span className={`transform transition-transform duration-200 ${isDisplaySettingsOpen ? 'rotate-180' : 'rotate-0'}`}>
                  ▼
                </span>
              </button>
              {isDisplaySettingsOpen && (
                <div className="p-4 mt-2 bg-slate-900 rounded-lg flex flex-col gap-4 animate-fadeIn">
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
                </div>
              )}
            </div>

            {/* Accordion untuk Skor dan Pelanggaran */}
            <div className="w-full">
              <button
                type="button"
                onClick={toggleAdvancedSettings}
                className="flex justify-between items-center w-full p-3 text-left text-white bg-slate-800 hover:bg-slate-700 rounded-lg focus:outline-none transition-colors"
              >
                <span className="font-medium">Pengaturan Skor & Pelanggaran (Opsional)</span>
                <span className={`transform transition-transform duration-200 ${isAdvancedSettingsOpen ? 'rotate-180' : 'rotate-0'}`}>
                  ▼
                </span>
              </button>

              {isAdvancedSettingsOpen && (
                <div className="p-4 mt-2 bg-slate-900 rounded-lg flex flex-col gap-4 items-center animate-fadeIn">
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
                        className="w-8 h-8 flex items-center justify-center bg-slate-800 text-white rounded-full transition z-10 hover:bg-slate-700"
                      >
                        –
                      </button>
                      <div className="relative">
                        <input
                          type="number"
                          value={score}
                          onChange={(e) => setScore(Number(e.target.value))}
                          className="w-24 text-center px-2 py-2 pr-10 rounded-2xl bg-slate-950 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-red-700
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
                        className="w-8 h-8 flex items-center justify-center bg-slate-800 text-white rounded-full transition z-10 hover:bg-slate-700"
                      >
                        +
                      </button>
                    </div>
                  </label>

                  {/* Pelanggaran Maksimal */}
                  <label className="flex flex-col items-center justify-center text-white text-center">
                    Pelanggaran Maksimal{" "}
                    <span className="text-sm text-gray-400">(0 untuk tanpa batas)</span>
                    <div className="flex items-center justify-center gap-2 mt-2 select-none">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFouls((prev) => Math.max(prev - 1, 0));
                        }}
                        className="w-8 h-8 flex items-center justify-center bg-slate-800 text-white rounded-full transition z-10 hover:bg-slate-700"
                      >
                        –
                      </button>
                      <div className="relative">
                        <input
                          type="number"
                          value={fouls}
                          onChange={(e) => setFouls(Number(e.target.value))}
                          className="w-24 text-center px-2 py-2 pr-10 rounded-2xl bg-slate-950 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-red-700
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
                        className="w-8 h-8 flex items-center justify-center bg-slate-800 text-white rounded-full transition z-10 hover:bg-slate-700"
                      >
                        +
                      </button>
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* Pengaturan Pemain */}
            <section className="flex flex-col md:flex-row items-center justify-around gap-4 md:gap-8">
              <div className="flex flex-col gap-4 w-full md:w-auto">
                <label className="flex flex-col text-white w-full">
                  Nama Pemain 1
                  <input
                    type="text"
                    value={name1}
                    maxLength={MAX_LENGTH_NAME}
                    onChange={(e) => setName1(e.target.value)}
                    className="px-4 py-2 mt-1 rounded-2xl bg-gradient-to-r from-5% hover:from-30% from-slate-950 to-red-950 text-white focus:outline-none focus:ring-2 focus:ring-red-700"
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
                    className="px-4 py-2 mt-1 rounded-2xl bg-gradient-to-r from-5% hover:from-30% from-slate-950 to-red-950 text-white focus:outline-none focus:ring-2 focus:ring-red-700"
                  />
                </label>
              </div>
              <div className="flex flex-col gap-4 w-full md:w-auto">
                <label className="flex flex-col text-white w-full">
                  Nama Pemain 2
                  <input
                    type="text"
                    value={name2}
                    maxLength={MAX_LENGTH_NAME}
                    onChange={(e) => setName2(e.target.value)}
                    className="px-4 py-2 mt-1 rounded-2xl bg-gradient-to-r from-5% hover:from-30% from-slate-950 to-blue-950 text-white focus:outline-none focus:ring-2 focus:ring-blue-700"
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
                    className="px-4 py-2 mt-1 rounded-2xl bg-gradient-to-r from-5% hover:from-30% from-slate-950 to-blue-950 text-white focus:outline-none focus:ring-2 focus:ring-blue-700"
                  />
                </label>
              </div>
            </section>
          </div>
        </div>
        <button
          // --- PERUBAHAN 4: Panggil fungsi handleSubmit ---
          onClick={handleSubmit}
          className="px-6 py-3 rounded-lg border border-blue-600 text-blue-300 hover:bg-blue-900 hover:text-white transition text-lg font-semibold flex-shrink-0"
        >
          Mulai Permainan
        </button>
      </div>
    </>
  );
}
