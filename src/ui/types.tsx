// Anda bisa meletakkan ini di file terpisah (misal: src/types.ts) dan import di kedua file
// atau deklarasikan di App.tsx dan DisplayPage.tsx jika tidak ingin membuat file baru.
export interface ScoreboardData {
  centisecondsLeft?: number;
  player1Name: string;
  player1From: string;
  score1: number;
  foul1: number;
  isFirstScorer1: boolean;
  // Riwayat perubahan skor untuk pemain 1 (mis. [+1, +2, -1])
  scoreHistory1?: number[];

  player2Name: string;
  player2From: string;
  score2: number;
  foul2: number;
  isFirstScorer2: boolean;
  // Riwayat perubahan skor untuk pemain 2 (mis. [+1, +2, -1])
  scoreHistory2?: number[];

  timeLeft: number;
  isRunning: boolean;
  timerEverStarted: boolean;
  initialDuration: number;

  gameEnded: boolean;
  winner: string | null;
  endReason: string;

  maxScore: number; 
  maxFoul: number;  

  elapsedTime: number;

  tatamiLabel?: string;
  tatamiNumber?: string;
  matchLabel?: string;
}

export const LOCAL_STORAGE_KEY = "liveScoreboardData";

export const FULLSCREEN_DISPLAY_REQUEST_KEY = "fullscreenDisplayRequestTrigger";