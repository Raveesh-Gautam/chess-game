import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Chess, Square, PieceSymbol, Color } from 'chess.js';
import { useGameStore } from '../../store/gamestore';
import { ChessPiece } from './Chesspiece';
import { BoardTheme } from '../../types/chess';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

// Color schemes for board themes
const THEME_COLORS: Record<BoardTheme, { light: string; dark: string; border: string }> = {
  emerald: {
    light: '#EEEED2',
    dark: '#769656',
    border: '#476331',
  },
  wood: {
    light: '#F0D9B5',
    dark: '#B58863',
    border: '#8B5A2B',
  },
  cyber: {
    light: '#2E3856',
    dark: '#1A2238',
    border: '#6366F1',
  },
  slate: {
    light: '#E2E8F0',
    dark: '#475569',
    border: '#1E293B',
  },
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

type Outcome = {
  winner: 'w' | 'b' | null; // null = draw / unknown
  title: string;
  subtitle: string;
};

// Works out who won (or if it was a draw) from the board position and clocks.
// Note: threefold repetition can't be detected from a FEN alone (no move history),
// so it falls through to the store's `gameResult` text.
function getOutcome(
  view: Chess,
  whiteTime: number,
  blackTime: number,
  fallback: string | null | undefined
): Outcome {
  // Timeout
  if (whiteTime <= 0) {
    return { winner: 'b', title: 'Black Wins! 🏆', subtitle: 'White ran out of time' };
  }
  if (blackTime <= 0) {
    return { winner: 'w', title: 'White Wins! 🏆', subtitle: 'Black ran out of time' };
  }

  // Checkmate: the side to move is the loser
  if (view.isCheckmate()) {
    const winner = view.turn() === 'w' ? 'b' : 'w';
    return {
      winner,
      title: winner === 'w' ? 'White Wins! 🏆' : 'Black Wins! 🏆',
      subtitle: 'Checkmate',
    };
  }

  // Draws
  if (view.isStalemate()) return { winner: null, title: 'Draw 🤝', subtitle: 'Stalemate' };
  if (view.isInsufficientMaterial())
    return { winner: null, title: 'Draw 🤝', subtitle: 'Insufficient material' };
  if (view.isDraw()) return { winner: null, title: 'Draw 🤝', subtitle: '50-move rule' };

  // Resignation, repetition, etc. (text coming from the store)
  return { winner: null, title: 'Game Over', subtitle: fallback || 'Match Ended' };
}

// ---------- Player bar (orientation-aware) ----------
type BarProps = {
  color: Color;
  width: number;
  name: string;
  time: number;
  active: boolean;
  diff: number;
  captured: PieceSymbol[];
  showTimer: boolean;
};

const PlayerBar: React.FC<BarProps> = ({
  color,
  width,
  name,
  time,
  active,
  diff,
  captured,
  showTimer,
}) => (
  <View style={[styles.playerHeader, { width }]}>
    <View style={styles.playerInfo}>
      <View
        style={[
          styles.colorIndicator,
          color === 'w'
            ? { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CCC' }
            : { backgroundColor: '#1A1D20' },
        ]}
      />
      <Text style={styles.playerName}>{name}</Text>
      {diff > 0 && (
        <View style={styles.diffBadge}>
          <Text style={styles.diffText}>+{diff}</Text>
        </View>
      )}
    </View>

    {/* Pieces captured by this player */}
    <View style={styles.capturedRow}>
      {captured.map((p, i) => (
        <ChessPiece key={`cap-${color}-${i}`} type={p} color={color === 'w' ? 'b' : 'w'} size={18} />
      ))}
    </View>

    {showTimer && (
      <View style={[styles.timerBadge, active && styles.timerActive]}>
        <Text style={styles.timerText}>{formatTime(time)}</Text>
      </View>
    )}
  </View>
);

export const ChessBoard: React.FC = () => {
  const { width } = useWindowDimensions();

  const {
    fen,
    selected,
    legalMoves,
    lastMove,
    pendingPromotion,
    boardTheme,
    playerColor,
    onSquarePress,
    confirmPromotion,
    cancelPromotion,
    whiteTime,
    blackTime,
    isTimerRunning,
    tickTimer,
    isGameOver,
    gameResult,
    capturedPieces,
    materialDiff,
    reset,
    undo,
    mode,
    aiDifficulty,
  } = useGameStore();

  // Calculate board size based on viewport width
  const maxBoardWidth = Math.min(width - 32, 540);
  const squareSize = Math.floor(maxBoardWidth / 8);
  const boardSize = squareSize * 8;

  // Clock interval (puzzle mein clock nahi chalti)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning && !isGameOver && mode !== 'puzzle') {
      interval = setInterval(() => {
        tickTimer();
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, isGameOver, mode, tickTimer]);

  const colors = THEME_COLORS[boardTheme] || THEME_COLORS.emerald;

  // Built from the FEN: it changes on every move, so the UI always updates
  const view = useMemo(() => new Chess(fen), [fen]);
  const board = view.board();
  const currentTurn = view.turn();

  // Game outcome (winner / draw)
  const outcome = useMemo(
    () => (isGameOver ? getOutcome(view, whiteTime, blackTime, gameResult) : null),
    [isGameOver, view, whiteTime, blackTime, gameResult]
  );
  const youWon = !!outcome?.winner && outcome.winner === playerColor;
  const youLost = !!outcome?.winner && outcome.winner !== playerColor;

  // Find King square if in check
  let inCheckSquare: Square | null = null;
  if (view.inCheck()) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === 'k' && piece.color === currentTurn) {
          inCheckSquare = `${FILES[c]}${RANKS[r]}` as Square;
        }
      }
    }
  }

  const ranksToDisplay = playerColor === 'b' ? [...RANKS].reverse() : RANKS;
  const filesToDisplay = playerColor === 'b' ? [...FILES].reverse() : FILES;

  // Player bars: neeche hamesha playerColor, upar opponent
  const bottomColor: Color = playerColor;
  const topColor: Color = playerColor === 'w' ? 'b' : 'w';
  const showTimer = mode !== 'puzzle';

  const barProps = (c: Color): BarProps => ({
    color: c,
    width: boardSize,
    name:
      mode === 'vsAI'
        ? c === playerColor
          ? 'You'
          : `Bot (${aiDifficulty})`
        : mode === 'puzzle'
          ? c === playerColor
            ? 'You'
            : 'Opponent'
          : c === 'w'
            ? 'White'
            : 'Black',
    time: c === 'w' ? whiteTime : blackTime,
    active: currentTurn === c,
    diff: c === 'w' ? materialDiff : -materialDiff,
    captured: capturedPieces[c],
    showTimer,
  });

  return (
    <View style={styles.container}>
      {/* Top Player Status Bar */}
      <PlayerBar {...barProps(topColor)} />

      {/* Main Board Container */}
      <View style={[styles.boardWrapper, { width: boardSize, height: boardSize, borderColor: colors.border }]}>
        {/* Layer 1: Squares (background, labels, dots) */}
        {ranksToDisplay.map((rankStr, rIdx) => {
          const r = RANKS.indexOf(rankStr);
          return (
            <View key={`rank-${rankStr}`} style={styles.row}>
              {filesToDisplay.map((fileStr, cIdx) => {
                const c = FILES.indexOf(fileStr);
                const sqName = `${fileStr}${rankStr}` as Square;
                const isDark = (r + c) % 2 === 1;
                const piece = board[r][c];

                const isSelected = selected === sqName;
                const isLastMoveFrom = lastMove?.from === sqName;
                const isLastMoveTo = lastMove?.to === sqName;
                const isInCheck = inCheckSquare === sqName;

                // Move target check
                const legalMove = legalMoves.find((m) => m.to === sqName);
                const isLegalMove = !!legalMove;
                const isCapture = isLegalMove && (piece !== null || legalMove.flags.includes('e'));

                let backgroundColor = isDark ? colors.dark : colors.light;

                if (isSelected) {
                  backgroundColor = '#F59E0B'; // Amber highlight for selected
                } else if (isLastMoveFrom || isLastMoveTo) {
                  backgroundColor = isDark ? '#B4902F' : '#E9D68A';
                }

                return (
                  <Pressable
                    key={sqName}
                    onPress={() => onSquarePress(sqName)}
                    style={[
                      styles.square,
                      {
                        width: squareSize,
                        height: squareSize,
                        backgroundColor,
                      },
                      isInCheck && styles.checkSquare,
                    ]}
                  >
                    {/* Rank file labels */}
                    {cIdx === 0 && (
                      <Text style={[styles.rankLabel, { color: isDark ? colors.light : colors.dark }]}>
                        {rankStr}
                      </Text>
                    )}
                    {rIdx === 7 && (
                      <Text style={[styles.fileLabel, { color: isDark ? colors.light : colors.dark }]}>
                        {fileStr}
                      </Text>
                    )}

                    {/* Move indicator */}
                    {isLegalMove && !isCapture && (
                      <View
                        style={[
                          styles.legalDot,
                          {
                            width: squareSize * 0.32,
                            height: squareSize * 0.32,
                            borderRadius: (squareSize * 0.32) / 2,
                          },
                        ]}
                      />
                    )}

                    {/* Capture indicator */}
                    {isCapture && (
                      <View
                        style={[
                          styles.captureRing,
                          {
                            width: squareSize * 0.88,
                            height: squareSize * 0.88,
                            borderRadius: (squareSize * 0.88) / 2,
                          },
                        ]}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          );
        })}

        {/* Layer 2: Pieces (separate layer, lets touches pass through) */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {ranksToDisplay.map((rankStr, rIdx) =>
            filesToDisplay.map((fileStr, cIdx) => {
              const r = RANKS.indexOf(rankStr);
              const c = FILES.indexOf(fileStr);
              const piece = board[r][c];
              if (!piece) return null;

              const sqName = `${fileStr}${rankStr}` as Square;

              return (
                <View
                  key={`${sqName}-${piece.type}-${piece.color}`}
                  style={{
                    position: 'absolute',
                    left: cIdx * squareSize,
                    top: rIdx * squareSize,
                    width: squareSize,
                    height: squareSize,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <ChessPiece type={piece.type} color={piece.color} size={squareSize * 0.85} />
                </View>
              );
            })
          )}
        </View>

        {/* Game Over Banner Overlay */}
        {isGameOver && outcome && (
          <View style={styles.gameOverOverlay}>
            <View
              style={[
                styles.gameOverCard,
                youWon && styles.winCard,
                youLost && mode === 'vsAI' && styles.loseCard,
              ]}
            >
              <Text style={styles.gameOverTitle}>
                {mode === 'vsAI' && outcome.winner
                  ? youWon
                    ? '🎉 You Win!'
                    : '😞 You Lost'
                  : outcome.title}
              </Text>
              <Text style={styles.gameOverResult}>{outcome.subtitle}</Text>

              <View style={styles.gameOverButtons}>
                <Pressable style={styles.actionBtnPrimary} onPress={reset}>
                  <Text style={styles.actionBtnTextPrimary}>New Match</Text>
                </Pressable>
                {/* Undo makes no sense after a timeout, so only show it when both clocks have time */}
                {whiteTime > 0 && blackTime > 0 && (
                  <Pressable style={styles.actionBtnSecondary} onPress={undo}>
                    <Text style={styles.actionBtnTextSecondary}>Undo Move</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Bottom Player Status Bar */}
      <PlayerBar {...barProps(bottomColor)} />

      {/* Pawn Promotion Modal */}
      <Modal visible={!!pendingPromotion} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.promotionCard}>
            <Text style={styles.promotionTitle}>Select Promotion</Text>
            <View style={styles.promotionOptions}>
              {(['q', 'r', 'b', 'n'] as PieceSymbol[]).map((piece) => (
                <Pressable
                  key={piece}
                  style={styles.promotionBtn}
                  onPress={() => confirmPromotion(piece as any)}
                >
                  <ChessPiece type={piece} color={currentTurn} size={44} />
                </Pressable>
              ))}
            </View>
            <Pressable style={styles.cancelBtn} onPress={cancelPromotion}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  playerName: {
    color: '#F8FAFC',
    fontWeight: '700',
    fontSize: 14,
  },
  diffBadge: {
    backgroundColor: '#334155',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  diffText: {
    color: '#10B981',
    fontWeight: '800',
    fontSize: 12,
  },
  capturedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flex: 1,
    paddingHorizontal: 8,
  },
  timerBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  timerActive: {
    borderColor: '#10B981',
    backgroundColor: '#064E3B',
  },
  timerText: {
    color: '#F8FAFC',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '700',
    fontSize: 14,
  },
  boardWrapper: {
    borderWidth: 4,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  row: {
    flexDirection: 'row',
  },
  square: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  checkSquare: {
    backgroundColor: '#EF4444',
  },
  rankLabel: {
    position: 'absolute',
    top: 2,
    left: 4,
    fontSize: 10,
    fontWeight: '700',
  },
  fileLabel: {
    position: 'absolute',
    bottom: 2,
    right: 4,
    fontSize: 10,
    fontWeight: '700',
  },
  legalDot: {
    position: 'absolute',
    backgroundColor: 'rgba(16, 185, 129, 0.65)',
  },
  captureRing: {
    position: 'absolute',
    borderWidth: 3.5,
    borderColor: 'rgba(239, 68, 68, 0.85)',
  },
  gameOverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  gameOverCard: {
    backgroundColor: '#1E293B',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    width: '80%',
  },
  winCard: {
    borderColor: '#10B981',
    borderWidth: 2,
  },
  loseCard: {
    borderColor: '#EF4444',
    borderWidth: 2,
  },
  gameOverTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  gameOverResult: {
    fontSize: 15,
    color: '#94A3B8',
    marginBottom: 20,
    textAlign: 'center',
  },
  gameOverButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtnPrimary: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  actionBtnTextPrimary: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  actionBtnSecondary: {
    backgroundColor: '#334155',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  actionBtnTextSecondary: {
    color: '#F8FAFC',
    fontWeight: '600',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  promotionCard: {
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#475569',
  },
  promotionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 16,
  },
  promotionOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  promotionBtn: {
    backgroundColor: '#334155',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#64748B',
  },
  cancelBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  cancelText: {
    color: '#94A3B8',
    fontSize: 14,
  },
});