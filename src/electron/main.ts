// src/electron/main.ts
import path from 'path';
// Tambahkan IpcMainEvent untuk memberi tipe pada event di handler IPC
import { app, BrowserWindow, ipcMain, IpcMainEvent } from 'electron';
// Impor tipe ScoreboardData
// Path ini mengasumsikan types.ts ada di src/ui/types.ts dan main.ts ada di src/electron/main.ts
// Jika module: "CommonJS", Anda tidak perlu ekstensi .js di sini untuk impor tipe
import type { ScoreboardData } from '../ui/types';

// Aktifkan log ini untuk debugging awal jika diperlukan
console.log('--- Electron Main Process Start ---');
// VITE_DEV_SERVER_URL akan undefined jika dev server Vite tidak berjalan atau tidak di-set
console.log('VITE_DEV_SERVER_URL:', process.env['VITE_DEV_SERVER_URL']);
// __dirname tersedia jika module adalah CommonJS
console.log('__dirname (dari main.ts):', __dirname);
console.log('app.getAppPath():', app.getAppPath());
console.log('--- End Initial Debug Info ---');

let mainWindow: BrowserWindow | null = null;
let displayWindow: BrowserWindow | null = null;

const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];

function createMainWindow() {
  mainWindow = new BrowserWindow({
    fullscreen: true, 
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // __dirname dari CommonJS
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), 'dist-react/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (displayWindow && !displayWindow.isDestroyed()) {
      displayWindow.close();
    }
    displayWindow = null;
  });
}

function createOrFocusDisplayWindow() {
  console.log('!!! [Main Process DEBUG] Fungsi createOrFocusDisplayWindow() DIPANGGIL !!!');
  if (displayWindow && !displayWindow.isDestroyed()) {
    console.log('[Main Process DEBUG] Display window sudah ada, memfokuskan.');
    displayWindow.focus();
    return;
  }
  console.log('[Main Process DEBUG] Membuat display window baru...');
  displayWindow = new BrowserWindow({
    fullscreen: true, 
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // __dirname dari CommonJS
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  displayWindow.webContents.openDevTools();

  const prodRendererBasePath = app.getAppPath();
  const prodRendererIndexPath = path.join(prodRendererBasePath, 'dist-react', 'index.html');

  console.log('[DisplayWindow] VITE_DEV_SERVER_URL (dalam fungsi):', VITE_DEV_SERVER_URL);
  console.log('[DisplayWindow] Dihitung sebagai path produksi index.html:', prodRendererIndexPath);

  const displayPageUrl = VITE_DEV_SERVER_URL
    ? `${VITE_DEV_SERVER_URL}#display`
    : `file://${prodRendererIndexPath}#display`;

  console.log('[DisplayWindow] URL FINAL yang akan dimuat:', displayPageUrl);

  if (!displayPageUrl ||
      (displayPageUrl.startsWith('file://') && !displayPageUrl.includes('.')) ||
      displayPageUrl.includes('undefined') ||
      displayPageUrl.endsWith('/#display')
     ) {
    console.error('KESALAHAN KRITIS: displayPageUrl untuk DisplayWindow tidak valid sebelum loadURL!', displayPageUrl);
    if (displayWindow && !displayWindow.isDestroyed()) {
        displayWindow.destroy();
        displayWindow = null;
    }
    return;
  }

  displayWindow.loadURL(displayPageUrl)
    .then(() => {
      console.log(`[DisplayWindow] Berhasil dimuat: ${displayPageUrl}`);
    })
    .catch(err => {
      console.error(`[DisplayWindow] GAGAL memuat URL: ${displayPageUrl}`, err);
    });

  displayWindow.once('ready-to-show', () => {
    displayWindow?.show();
  });

  displayWindow.on('closed', () => {
    displayWindow = null;
  });
}

app.whenReady().then(() => {
  console.log('App is ready, creating MainWindow...');
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers:
ipcMain.on('open-display-window', () => {
  console.log('IPC "open-display-window" diterima. Memanggil createOrFocusDisplayWindow...');
  createOrFocusDisplayWindow();
});

// Parameter _event dan data sekarang memiliki tipe
ipcMain.on('update-scoreboard-data', (_event: IpcMainEvent, data: ScoreboardData) => {
  console.log('[Main Process] IPC "update-scoreboard-data" diterima, data:', data); // Tambahkan log untuk data
  if (displayWindow && !displayWindow.isDestroyed()) {
    displayWindow.webContents.send('scoreboard-data-updated', data);
  }
});

// Handler ini tidak memiliki parameter yang perlu di-type secara spesifik selain dari defaultnya
ipcMain.on('request-display-fullscreen-toggle', () => {
  console.log('IPC "request-display-fullscreen-toggle" diterima.');
  if (displayWindow && !displayWindow.isDestroyed()) {
    displayWindow.webContents.send('execute-fullscreen-toggle');
  }
});