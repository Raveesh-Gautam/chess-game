import { Square, PieceSymbol, Color, Move } from 'chess.js';

export type GameMode = 'passAndPlay' | 'vsAI' | 'puzzle' | 'blitz';

export type AIDifficulty = 'easy' | 'medium' | 'hard' | 'grandmaster';

export type BoardTheme = 'emerald' | 'wood' | 'cyber' | 'slate';

export interface PlayerStats {
  rating: number;
  wins: number;
  losses: number;
  draws: number;
  puzzlesSolved: number;
  streak: number;
}

export interface MatchHistoryItem {
  id: string;
  opponent: string;
  result: 'win' | 'loss' | 'draw';
  mode: string;
  movesCount: number;
  date: string;
  opening: string;
}

export interface CapturedPieces {
  w: PieceSymbol[];
  b: PieceSymbol[];
}

export interface Puzzle {
  id: string;
  title: string;
  fen: string;
  moves: string[]; // SAN or from-to
  description: string;
  rating: number;
}
