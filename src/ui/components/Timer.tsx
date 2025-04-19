import { useEffect, useState } from 'react';

type Props = {
  duration: number;
};

export default function Timer({ duration }: Props) {
  const [seconds, setSeconds] = useState(duration);

  useEffect(() => {
    setSeconds(duration);
  }, [duration]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  return (
    <div className="mb-10 px-6 py-2 border border-black rounded-full text-2xl font-mono">
      {formatTime(seconds)}
    </div>
  );
}
