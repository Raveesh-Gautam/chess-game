import { create } from 'zustand';
import { Chess, Move, Square, PieceSymbol, Color } from 'chess.js';
import { GameMode, AIDifficulty, BoardTheme, PlayerStats, MatchHistoryItem, Puzzle, CapturedPieces } from '../types/chess';

// Sample puzzles
export const PUZZLES: Puzzle[] = [
  {
    id: 'p1',
    title: 'Back Rank Mate',
    fen: '6k1/5ppp/8/8/8/8/5PPP/1R4K1 w - - 0 1',
    moves: ['b1rb8', 'b1b8'],
    description: 'White to move and deliver checkmate in 1 move.',
    rating: 1100,
  },
  {
    id: 'p2',
    title: 'Smothered Mate Threat',
    fen: '6k1/5ppp/8/8/4N3/8/5PPP/1Q4K1 w - - 0 1',
    moves: ['b1b8'],
    description: 'Find the winning move for White.',
    rating: 1250,
  },
  {
    id: 'p3',
    title: 'Royal Fork',
    fen: 'r1bqk2r/pppp1ppp/2n2n2/4p3/1b2P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 4 5',
    moves: ['c3d5'],
    description: 'Execute a strong tactical knight maneuver in the center.',
    rating: 1400,
  }
];

// Piece values for evaluation
const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Simple position evaluation for minimax
function evaluateBoard(chess: Chess): number {
  let totalEvaluation = 0;
  const board = chess.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece) {
        const val = PIECE_VALUES[piece.type];
        // Center control bonus
        let bonus = 0;
        if ((r === 3 || r === 4) && (c === 3 || c === 4)) bonus += 20;
        
        if (piece.color === 'w') {
          totalEvaluation += (val + bonus);
        } else {
          totalEvaluation -= (val + bonus);
        }
      }
    }
  }
  return totalEvaluation;
}

// Minimax with Alpha-Beta pruning for AI
function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number {
  if (depth === 0 || chess.isGameOver()) {
    return evaluateBoard(chess);
  }

  const moves = chess.moves({ verbose: true });
  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      chess.move(move);
      const evaluation = minimax(chess, depth - 1, alpha, beta, false);
      chess.undo();
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      chess.move(move);
      const evaluation = minimax(chess, depth - 1, alpha, beta, true);
      chess.undo();
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

// Get best move for AI
function getBestMove(chess: Chess, difficulty: AIDifficulty): Move | null {
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return null;

  if (difficulty === 'easy') {
    // 70% random, 30% capture
    const captures = moves.filter(m => m.captured);
    if (captures.length > 0 && Math.random() > 0.5) {
      return captures[Math.floor(Math.random() * captures.length)];
    }
    return moves[Math.floor(Math.random() * moves.length)];
  }

  if (difficulty === 'medium') {
    // 1-ply search (best capture / position)
    let bestMove = moves[0];
    let bestValue = chess.turn() === 'w' ? -Infinity : Infinity;

    for (const move of moves) {
      chess.move(move);
      const boardVal = evaluateBoard(chess);
      chess.undo();

      if (chess.turn() === 'w') {
        if (boardVal > bestValue) {
          bestValue = boardVal;
          bestMove = move;
        }
      } else {
        if (boardVal < bestValue) {
          bestValue = boardVal;
          bestMove = move;
        }
      }
    }
    return bestMove;
  }

  // Hard & Grandmaster: 2 or 3 ply Minimax
  const depth = difficulty === 'grandmaster' ? 3 : 2;
  let bestMove = moves[0];
  const isMaximizing = chess.turn() === 'w';
  let bestValue = isMaximizing ? -Infinity : Infinity;

  for (const move of moves) {
    chess.move(move);
    const value = minimax(chess, depth - 1, -Infinity, Infinity, !isMaximizing);
    chess.undo();

    if (isMaximizing) {
      if (value > bestValue) {
        bestValue = value;
        bestMove = move;
      }
    } else {
      if (value < bestValue) {
        bestValue = value;
        bestMove = move;
      }
    }
  }

  return bestMove;
}

// Calculate captured pieces & point difference
function calculateCaptured(chess: Chess): { captured: CapturedPieces; scoreDiff: number } {
  const initialPieces: Record<PieceSymbol, number> = { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 };
  const currentW: Record<PieceSymbol, number> = { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 };
  const currentB: Record<PieceSymbol, number> = { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 };

  const board = chess.board();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece) {
        if (piece.color === 'w') currentW[piece.type]++;
        else currentB[piece.type]++;
      }
    }
  }

  const capturedW: PieceSymbol[] = []; // Black pieces captured by White
  const capturedB: PieceSymbol[] = []; // White pieces captured by Black

  let scoreW = 0;
  let scoreB = 0;

  (['q', 'r', 'b', 'n', 'p'] as PieceSymbol[]).forEach((type) => {
    const missingB = initialPieces[type] - currentB[type];
    for (let i = 0; i < missingB; i++) {
      capturedW.push(type);
      scoreW += PIECE_VALUES[type] / 100;
    }

    const missingW = initialPieces[type] - currentW[type];
    for (let i = 0; i < missingW; i++) {
      capturedB.push(type);
      scoreB += PIECE_VALUES[type] / 100;
    }
  });

  return {
    captured: { w: capturedW, b: capturedB },
    scoreDiff: scoreW - scoreB,
  };
}

export type PendingPromotion = {
  from: Square;
  to: Square;
} | null;

export interface GameState {
  game: Chess;
  fen: string;
  selected: Square | null;
  legalMoves: Move[];
  lastMove: { from: Square; to: Square } | null;
  pendingPromotion: PendingPromotion;
  
  // Game parameters
  mode: GameMode;
  aiDifficulty: AIDifficulty;
  playerColor: Color; // 'w' or 'b'
  boardTheme: BoardTheme;
  
  // Clocks
  whiteTime: number; // in seconds
  blackTime: number;
  isTimerRunning: boolean;
  
  // Status
  isGameOver: boolean;
  gameResult: string | null;
  historySAN: string[];
  capturedPieces: CapturedPieces;
  materialDiff: number;
  
  // Puzzle mode
  currentPuzzle: Puzzle | null;
  puzzleSolved: boolean;
  puzzleError: boolean;
  
  // User Stats
  stats: PlayerStats;
  recentMatches: MatchHistoryItem[];

  // Actions
  onSquarePress: (sq: Square) => void;
  confirmPromotion: (piece: 'q' | 'r' | 'b' | 'n') => void;
  cancelPromotion: () => void;
  setMode: (mode: GameMode, difficulty?: AIDifficulty) => void;
  setBoardTheme: (theme: BoardTheme) => void;
  setPlayerColor: (color: Color) => void;
  makeAIMove: () => void;
  undo: () => void;
  reset: () => void;
  loadPuzzle: (puzzle: Puzzle) => void;
  tickTimer: () => void;
}

const initialChess = new Chess();

export const useGameStore = create<GameState>((set, get) => ({
  game: initialChess,
  fen: initialChess.fen(),
  selected: null,
  legalMoves: [],
  lastMove: null,
  pendingPromotion: null,

  mode: 'passAndPlay',
  aiDifficulty: 'medium',
  playerColor: 'w',
  boardTheme: 'emerald',

  whiteTime: 600,
  blackTime: 600,
  isTimerRunning: false,

  isGameOver: false,
  gameResult: null,
  historySAN: [],
  capturedPieces: { w: [], b: [] },
  materialDiff: 0,

  currentPuzzle: null,
  puzzleSolved: false,
  puzzleError: false,

  stats: {
    rating: 1450,
    wins: 28,
    losses: 12,
    draws: 5,
    puzzlesSolved: 142,
    streak: 4,
  },

  recentMatches: [
    {
      id: 'm1',
      opponent: 'Grandmaster Bot',
      result: 'win',
      mode: 'vsAI',
      movesCount: 34,
      date: 'Today',
      opening: 'Sicilian Defense',
    },
    {
      id: 'm2',
      opponent: 'Alex_Master',
      result: 'draw',
      mode: 'passAndPlay',
      movesCount: 52,
      date: 'Yesterday',
      opening: 'Ruy Lopez',
    },
    {
      id: 'm3',
      opponent: 'Medium Bot',
      result: 'win',
      mode: 'vsAI',
      movesCount: 22,
      date: '2 days ago',
      opening: 'Queen\'s Gambit Accepted',
    },
  ],

  onSquarePress: (sq: Square) => {
    const { game, selected, legalMoves, mode, playerColor, isGameOver, pendingPromotion } = get();

    if (isGameOver || pendingPromotion) return;

    // If vsAI mode and it's AI's turn, ignore user clicks
    if (mode === 'vsAI' && game.turn() !== playerColor) {
      return;
    }

    // Case 1: If a piece is already selected and target is a legal move
    const targetMove = legalMoves.find((m) => m.to === sq);
    if (selected && targetMove) {
      // Check if pawn promotion
      if (
        targetMove.piece === 'p' &&
        ((targetMove.color === 'w' && sq.endsWith('8')) ||
          (targetMove.color === 'b' && sq.endsWith('1')))
      ) {
        set({ pendingPromotion: { from: selected, to: sq } });
        return;
      }

      // Execute normal move
      try {
        const moveResult = game.move({ from: selected, to: sq });
        if (moveResult) {
          const newFen = game.fen();
          const { captured, scoreDiff } = calculateCaptured(game);
          const history = game.history();

          let gameOver = game.isGameOver();
          let res: string | null = null;
          if (game.isCheckmate()) {
            res = `Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins!`;
          } else if (game.isDraw()) {
            res = 'Game Draw!';
          }

          set({
            fen: newFen,
            selected: null,
            legalMoves: [],
            lastMove: { from: selected, to: sq },
            historySAN: history,
            capturedPieces: captured,
            materialDiff: scoreDiff,
            isGameOver: gameOver,
            gameResult: res,
            isTimerRunning: !gameOver,
          });

          // Trigger AI move if vsAI
          if (!gameOver && mode === 'vsAI' && game.turn() !== playerColor) {
            setTimeout(() => {
              get().makeAIMove();
            }, 400);
          }
        }
      } catch (err) {
        console.warn('Invalid move:', err);
      }
      return;
    }

    // Case 2: Select a piece of current turn's color
    const piece = game.get(sq);
    if (piece && piece.color === game.turn()) {
      const moves = game.moves({ square: sq, verbose: true });
      set({ selected: sq, legalMoves: moves });
      return;
    }

    // Case 3: Clear selection
    set({ selected: null, legalMoves: [] });
  },

  confirmPromotion: (promotionPiece) => {
    const { game, pendingPromotion, mode, playerColor } = get();
    if (!pendingPromotion) return;

    try {
      const moveResult = game.move({
        from: pendingPromotion.from,
        to: pendingPromotion.to,
        promotion: promotionPiece,
      });

      if (moveResult) {
        const { captured, scoreDiff } = calculateCaptured(game);
        let gameOver = game.isGameOver();
        let res: string | null = null;
        if (game.isCheckmate()) {
          res = `Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins!`;
        } else if (game.isDraw()) {
          res = 'Game Draw!';
        }

        set({
          fen: game.fen(),
          selected: null,
          legalMoves: [],
          pendingPromotion: null,
          lastMove: { from: pendingPromotion.from, to: pendingPromotion.to },
          historySAN: game.history(),
          capturedPieces: captured,
          materialDiff: scoreDiff,
          isGameOver: gameOver,
          gameResult: res,
        });

        if (!gameOver && mode === 'vsAI' && game.turn() !== playerColor) {
          setTimeout(() => {
            get().makeAIMove();
          }, 400);
        }
      }
    } catch (e) {
      set({ pendingPromotion: null });
    }
  },

  cancelPromotion: () => {
    set({ pendingPromotion: null, selected: null, legalMoves: [] });
  },

  makeAIMove: () => {
    const { game, aiDifficulty, isGameOver } = get();
    if (isGameOver || game.isGameOver()) return;

    const bestMove = getBestMove(game, aiDifficulty);
    if (bestMove) {
      game.move(bestMove);
      const { captured, scoreDiff } = calculateCaptured(game);
      let gameOver = game.isGameOver();
      let res: string | null = null;
      if (game.isCheckmate()) {
        res = `Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins!`;
      } else if (game.isDraw()) {
        res = 'Game Draw!';
      }

      set({
        fen: game.fen(),
        selected: null,
        legalMoves: [],
        lastMove: { from: bestMove.from, to: bestMove.to },
        historySAN: game.history(),
        capturedPieces: captured,
        materialDiff: scoreDiff,
        isGameOver: gameOver,
        gameResult: res,
      });
    }
  },

  setMode: (mode, difficulty = 'medium') => {
    const newGame = new Chess();
    set({
      mode,
      aiDifficulty: difficulty,
      game: newGame,
      fen: newGame.fen(),
      selected: null,
      legalMoves: [],
      lastMove: null,
      pendingPromotion: null,
      historySAN: [],
      capturedPieces: { w: [], b: [] },
      materialDiff: 0,
      isGameOver: false,
      gameResult: null,
      whiteTime: 600,
      blackTime: 600,
      isTimerRunning: true,
    });
  },

  setBoardTheme: (theme) => {
    set({ boardTheme: theme });
  },

  setPlayerColor: (color) => {
    set({ playerColor: color });
    const { mode, game } = get();
    if (mode === 'vsAI' && color === 'b' && game.turn() === 'w') {
      setTimeout(() => {
        get().makeAIMove();
      }, 400);
    }
  },

  undo: () => {
    const { game, mode } = get();
    // If vsAI, undo twice (AI move + player move)
    game.undo();
    if (mode === 'vsAI') {
      game.undo();
    }
    const { captured, scoreDiff } = calculateCaptured(game);
    const history = game.history();
    set({
      fen: game.fen(),
      selected: null,
      legalMoves: [],
      lastMove: null,
      historySAN: history,
      capturedPieces: captured,
      materialDiff: scoreDiff,
      isGameOver: false,
      gameResult: null,
    });
  },

  reset: () => {
    const newGame = new Chess();
    set({
      game: newGame,
      fen: newGame.fen(),
      selected: null,
      legalMoves: [],
      lastMove: null,
      pendingPromotion: null,
      historySAN: [],
      capturedPieces: { w: [], b: [] },
      materialDiff: 0,
      isGameOver: false,
      gameResult: null,
      whiteTime: 600,
      blackTime: 600,
      isTimerRunning: false,
    });
  },

  loadPuzzle: (puzzle) => {
    const puzzleGame = new Chess(puzzle.fen);
    set({
      mode: 'puzzle',
      currentPuzzle: puzzle,
      game: puzzleGame,
      fen: puzzleGame.fen(),
      selected: null,
      legalMoves: [],
      lastMove: null,
      pendingPromotion: null,
      puzzleSolved: false,
      puzzleError: false,
      isGameOver: false,
      gameResult: null,
    });
  },

  tickTimer: () => {
    const { isTimerRunning, game, whiteTime, blackTime, isGameOver } = get();
    if (!isTimerRunning || isGameOver) return;

    if (game.turn() === 'w') {
      if (whiteTime <= 1) {
        set({ whiteTime: 0, isGameOver: true, gameResult: 'Black wins on time!', isTimerRunning: false });
      } else {
        set({ whiteTime: whiteTime - 1 });
      }
    } else {
      if (blackTime <= 1) {
        set({ blackTime: 0, isGameOver: true, gameResult: 'White wins on time!', isTimerRunning: false });
      } else {
        set({ blackTime: blackTime - 1 });
      }
    }
  },
}));