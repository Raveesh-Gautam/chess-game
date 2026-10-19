import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { Chess, Square, PieceSymbol, Color } from 'chess.js';
import { useGameStore } from '../../store/gamestore';
import { ChessPiece } from './Chesspiece';
import { BoardTheme } from '../../types/chess';
import { colors, space, radius, type, mono, shadow } from './chess-theme';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];
const BORDER = 4;

const THEME_COLORS: Record<BoardTheme, { light: string; dark: string; border: string }> = {
  emerald: { light: '#EEEED2', dark: '#769656', border: '#476331' },
  wood: { light: '#F0D9B5', dark: '#B58863', border: '#8B5A2B' },
  cyber: { light: '#2E3856', dark: '#1A2238', border: '#6366F1' },
  slate: { light: '#E2E8F0', dark: '#475569', border: '#1E293B' },
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

type Outcome = {
  winner: 'w' | 'b' | null;
  title: string;
  subtitle: string;
};

function getOutcome(
  view: Chess,
  whiteTime: number,
  blackTime: number,
  fallback: string | null | undefined
): Outcome {
  if (whiteTime <= 0) {
    return { winner: 'b', title: 'Black Wins! 🏆', subtitle: 'White ran out of time' };
  }
  if (blackTime <= 0) {
    return { winner: 'w', title: 'White Wins! 🏆', subtitle: 'Black ran out of time' };
  }
  if (view.isCheckmate()) {
    const winner = view.turn() === 'w' ? 'b' : 'w';
    return {
      winner,
      title: winner === 'w' ? 'White Wins! 🏆' : 'Black Wins! 🏆',
      subtitle: 'Checkmate',
    };
  }
  if (view.isStalemate()) return { winner: null, title: 'Draw 🤝', subtitle: 'Stalemate' };
  if (view.isInsufficientMaterial())
    return { winner: null, title: 'Draw 🤝', subtitle: 'Insufficient material' };
  if (view.isDraw()) return { winner: null, title: 'Draw 🤝', subtitle: '50-move rule' };

  return { winner: null, title: 'Game Over', subtitle: fallback || 'Match Ended' };
}

// ---------- Player bar ----------
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
  <View style={[styles.playerHeader, { width }, active && styles.playerHeaderActive]}>
    <View style={styles.playerInfo}>
      <View
        style={[
          styles.colorIndicator,
          color === 'w'
            ? { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CCC' }
            : { backgroundColor: '#1A1D20', borderWidth: 1, borderColor: colors.border },
        ]}
      />
      <Text style={styles.playerName} numberOfLines={1}>
        {name}
      </Text>
      {diff > 0 && (
        <View style={styles.diffBadge}>
          <Text style={styles.diffText}>+{diff}</Text>
        </View>
      )}
    </View>

    <View style={styles.capturedRow}>
      {captured.map((p, i) => (
        <View key={`cap-${color}-${i}`} style={i > 0 ? styles.capturedOverlap : undefined}>
          <ChessPiece type={p} color={color === 'w' ? 'b' : 'w'} size={18} />
        </View>
      ))}
    </View>

    {showTimer && (
      <View style={[styles.timerBadge, active && styles.timerActive]}>
        <Text style={[styles.timerText, active && styles.timerTextActive]}>
          {formatTime(time)}
        </Text>
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

  // Board size (outer wrapper = squares + border on both sides)
  const maxBoardWidth = Math.min(width - space.lg * 2 - BORDER * 2, 540);
  const squareSize = Math.floor(maxBoardWidth / 8);
  const boardSize = squareSize * 8;
  const outerSize = boardSize + BORDER * 2;

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

  const palette = THEME_COLORS[boardTheme] || THEME_COLORS.emerald;

  const view = useMemo(() => new Chess(fen), [fen]);
  const board = view.board();
  const currentTurn = view.turn();

  const outcome = useMemo(
    () => (isGameOver ? getOutcome(view, whiteTime, blackTime, gameResult) : null),
    [isGameOver, view, whiteTime, blackTime, gameResult]
  );
  const youWon = !!outcome?.winner && outcome.winner === playerColor;
  const youLost = !!outcome?.winner && outcome.winner !== playerColor;

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

  const bottomColor: Color = playerColor;
  const topColor: Color = playerColor === 'w' ? 'b' : 'w';
  const showTimer = mode !== 'puzzle';

  const barProps = (c: Color): BarProps => ({
    color: c,
    width: outerSize,
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
      <PlayerBar {...barProps(topColor)} />

      <View
        style={[
          styles.boardWrapper,
          { width: outerSize, height: outerSize, borderColor: palette.border },
        ]}
      >
        {/* Layer 1: Squares */}
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

                const legalMove = legalMoves.find((m) => m.to === sqName);
                const isLegalMove = !!legalMove;
                const isCapture = isLegalMove && (piece !== null || legalMove.flags.includes('e'));

                let backgroundColor = isDark ? palette.dark : palette.light;

                if (isSelected) {
                  backgroundColor = '#F59E0B';
                } else if (isLastMoveFrom || isLastMoveTo) {
                  backgroundColor = isDark ? '#B4902F' : '#E9D68A';
                }

                return (
                  <Pressable
                    key={sqName}
                    onPress={() => onSquarePress(sqName)}
                    style={[
                      styles.square,
                      { width: squareSize, height: squareSize, backgroundColor },
                      isInCheck && styles.checkSquare,
                    ]}
                  >
                    {cIdx === 0 && (
                      <Text
                        style={[
                          styles.rankLabel,
                          { color: isDark ? palette.light : palette.dark },
                        ]}
                      >
                        {rankStr}
                      </Text>
                    )}
                    {rIdx === 7 && (
                      <Text
                        style={[
                          styles.fileLabel,
                          { color: isDark ? palette.light : palette.dark },
                        ]}
                      >
                        {fileStr}
                      </Text>
                    )}

                    {isLegalMove && !isCapture && (
                      <View
                        style={[
                          styles.legalDot,
                          {
                            width: squareSize * 0.3,
                            height: squareSize * 0.3,
                            borderRadius: (squareSize * 0.3) / 2,
                          },
                        ]}
                      />
                    )}

                    {isCapture && (
                      <View
                        style={[
                          styles.captureRing,
                          {
                            width: squareSize * 0.9,
                            height: squareSize * 0.9,
                            borderRadius: (squareSize * 0.9) / 2,
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

        {/* Layer 2: Pieces */}
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

        {/* Game over overlay */}
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

      <PlayerBar {...barProps(bottomColor)} />

      {/* Promotion modal */}
      <Modal visible={!!pendingPromotion} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.promotionCard}>
            <Text style={styles.promotionTitle}>Select Promotion</Text>
            <View style={styles.promotionOptions}>
              {(['q', 'r', 'b', 'n'] as PieceSymbol[]).map((piece) => (
                <Pressable
                  key={piece}
                  style={({ pressed }) => [styles.promotionBtn, pressed && styles.pressed]}
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
    paddingVertical: space.sm,
    gap: space.sm,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: space.sm,
  },
  playerHeaderActive: {
    borderColor: colors.primary,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    maxWidth: '45%',
  },
  colorIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  playerName: {
    color: colors.text,
    fontWeight: '700',
    fontSize: type.body,
    flexShrink: 1,
  },
  diffBadge: {
    backgroundColor: colors.border,
    paddingHorizontal: space.sm - 2,
    paddingVertical: 2,
    borderRadius: radius.sm - 2,
  },
  diffText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: type.small,
  },
  capturedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    overflow: 'hidden',
    paddingHorizontal: space.xs,
  },
  capturedOverlap: {
    marginLeft: -6,
  },
  timerBadge: {
    minWidth: 64,
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: space.md - 2,
    paddingVertical: space.xs + 1,
    borderRadius: radius.sm + 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timerActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryBg,
  },
  timerText: {
    color: colors.textMuted,
    fontFamily: mono,
    fontWeight: '700',
    fontSize: type.title,
  },
  timerTextActive: {
    color: colors.text,
  },
  boardWrapper: {
    borderWidth: BORDER,
    borderRadius: radius.md - 2,
    overflow: 'hidden',
    ...shadow(8),
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
    backgroundColor: colors.danger,
  },
  rankLabel: {
    position: 'absolute',
    top: 2,
    left: 3,
    fontSize: type.micro,
    fontWeight: '700',
  },
  fileLabel: {
    position: 'absolute',
    bottom: 1,
    right: 3,
    fontSize: type.micro,
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
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: space.lg,
    zIndex: 100,
  },
  gameOverCard: {
    backgroundColor: colors.surface,
    paddingVertical: space.xl,
    paddingHorizontal: space.lg,
    borderRadius: radius.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    width: '88%',
    maxWidth: 320,
    ...shadow(6),
  },
  winCard: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  loseCard: {
    borderColor: colors.danger,
    borderWidth: 2,
  },
  gameOverTitle: {
    fontSize: type.h2 + 2,
    fontWeight: '800',
    color: colors.text,
    marginBottom: space.sm,
    textAlign: 'center',
  },
  gameOverResult: {
    fontSize: type.body + 1,
    color: colors.textMuted,
    marginBottom: space.lg + 4,
    textAlign: 'center',
  },
  gameOverButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: space.md,
  },
  actionBtnPrimary: {
    backgroundColor: colors.primary,
    paddingHorizontal: space.lg + 2,
    paddingVertical: space.md - 1,
    borderRadius: radius.md,
  },
  actionBtnTextPrimary: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: type.body,
  },
  actionBtnSecondary: {
    backgroundColor: colors.border,
    paddingHorizontal: space.lg + 2,
    paddingVertical: space.md - 1,
    borderRadius: radius.md,
  },
  actionBtnTextSecondary: {
    color: colors.text,
    fontWeight: '700',
    fontSize: type.body,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: space.lg,
  },
  promotionCard: {
    backgroundColor: colors.surface,
    paddingVertical: space.xl - 4,
    paddingHorizontal: space.xl - 4,
    borderRadius: radius.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow(10),
  },
  promotionTitle: {
    fontSize: type.title + 2,
    fontWeight: '800',
    color: colors.text,
    marginBottom: space.lg,
  },
  promotionOptions: {
    flexDirection: 'row',
    gap: space.md,
    marginBottom: space.md,
  },
  promotionBtn: {
    backgroundColor: colors.border,
    padding: space.md,
    borderRadius: radius.lg - 2,
    borderWidth: 1,
    borderColor: colors.textDim,
  },
  pressed: {
    opacity: 0.7,
  },
  cancelBtn: {
    paddingVertical: space.sm,
    paddingHorizontal: space.xl - 8,
  },
  cancelText: {
    color: colors.textMuted,
    fontSize: type.body,
    fontWeight: '600',
  },
});