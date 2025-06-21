
// src/electron/preload.ts

import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { ScoreboardData } from './../ui/types.js';
// Sesuaikan path ini jika lokasi 'types.ts' Anda berbeda.
// Jika types.ts ada di src/ui/types.ts dan preload.ts ada di src/electron/preload.ts:


// Opsional: Definisikan interface untuk API yang akan Anda ekspos untuk kejelasan
export interface ExposedElectronAPI {
  openDisplayWindow: () => void;
  updateScoreboardData: (data: ScoreboardData) => void;
  requestDisplayFullscreenToggle: () => void;
  onScoreboardDataUpdated: (callback: (data: ScoreboardData) => void) => () => void; // Mengembalikan fungsi untuk cleanup
  onExecuteFullscreenToggle: (callback: () => void) => () => void; // Mengembalikan fungsi untuk cleanup
}

const electronAPI: ExposedElectronAPI = {
  // Renderer -> Main
  openDisplayWindow: () => ipcRenderer.send('open-display-window'),

  updateScoreboardData: (data: ScoreboardData) => ipcRenderer.send('update-scoreboard-data', data),

  requestDisplayFullscreenToggle: () => ipcRenderer.send('request-display-fullscreen-toggle'),

  // Main -> Renderer (untuk DisplayPage)
  onScoreboardDataUpdated: (callback: (data: ScoreboardData) => void) => {
    // Beri tipe pada parameter handler untuk menghindari 'any'
    const handler = (_event: IpcRendererEvent, value: ScoreboardData) => callback(value);
    ipcRenderer.on('scoreboard-data-updated', handler);

    // Kembalikan fungsi untuk menghapus listener saat komponen di-unmount atau tidak lagi dibutuhkan
    return () => {
      ipcRenderer.removeListener('scoreboard-data-updated', handler);
      console.log('[Preload] Listener untuk "scoreboard-data-updated" dihapus.'); // Opsional: log untuk debugging
    };
  },

  onExecuteFullscreenToggle: (callback: () => void) => {
    const handler = () => callback(); // _event tidak dibutuhkan di sini
    ipcRenderer.on('execute-fullscreen-toggle', handler);

    // Kembalikan fungsi untuk menghapus listener
    return () => {
      ipcRenderer.removeListener('execute-fullscreen-toggle', handler);
      console.log('[Preload] Listener untuk "execute-fullscreen-toggle" dihapus.'); // Opsional: log untuk debugging
    };
  },
};

// Hanya ekspos API yang telah didefinisikan dengan aman
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

console.log('[Preload Script] electronAPI berhasil diekspos ke window.'); // Opsional: Konfirmasi