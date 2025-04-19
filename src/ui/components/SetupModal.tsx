import { useState } from 'react';

type Props = {
  onSubmit: (values: { name1: string; name2: string; time: number }) => void;
};

export default function SetupModal({ onSubmit }: Props) {
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [time, setTime] = useState(20);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black bg-opacity-60 fixed inset-0 z-50">
      <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Setup Permainan</h2>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Nama Pemain 1"
            value={name1}
            onChange={(e) => setName1(e.target.value)}
            className="border px-4 py-2 rounded"
          />
          <input
            type="text"
            placeholder="Nama Pemain 2"
            value={name2}
            onChange={(e) => setName2(e.target.value)}
            className="border px-4 py-2 rounded"
          />
          <input
            type="number"
            placeholder="Durasi (menit)"
            value={time}
            onChange={(e) => setTime(Number(e.target.value))}
            className="border px-4 py-2 rounded"
          />
          <button
            onClick={() => onSubmit({ name1, name2, time })}
            className="bg-black text-white py-2 rounded hover:bg-gray-800"
          >
            Mulai Permainan
          </button>
        </div>
      </div>
    </div>
  );
}