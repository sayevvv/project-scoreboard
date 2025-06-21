// Contoh: src/renderer.d.ts

// Pastikan path ini benar relatif terhadap LOKASI FILE .d.ts INI
// Jika types.ts ada di src/types.ts dan renderer.d.ts ada di src/renderer.d.ts, maka './types' sudah benar.
import { type ScoreboardData } from './ui/types';

export {}; // WAJIB agar file ini dianggap sebagai module

declare global {
  interface Window {
    electronAPI?: { // Opsional agar tidak error jika tidak di Electron
      openDisplayWindow: () => void;
      updateScoreboardData: (data: ScoreboardData) => void;
      requestDisplayFullscreenToggle: () => void;
      onScoreboardDataUpdated: (
        callback: (data: ScoreboardData) => void
      ) => (() => void) | undefined; // Fungsi yang mengembalikan fungsi cleanup atau undefined
      onExecuteFullscreenToggle: (
        callback: () => void
      ) => (() => void) | undefined; // Fungsi yang mengembalikan fungsi cleanup atau undefined
    };
  }
}