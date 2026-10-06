import React, { useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Square, PieceSymbol, Color } from 'chess.js';
import { useGameStore, PendingPromotion } from '../../store/gamestore';
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

export const ChessBoard: React.FC = () => {
  const { width } = useWindowDimensions();

  const {
    game,
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

  // Clock interval
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning && !isGameOver) {
      interval = setInterval(() => {
        tickTimer();
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, isGameOver, tickTimer]);

  const colors = THEME_COLORS[boardTheme] || THEME_COLORS.emerald;
  const board = game.board();

  // Find King square if in check
  let inCheckSquare: Square | null = null;
  if (game.inCheck()) {
    const turn = game.turn();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === 'k' && piece.color === turn) {
          inCheckSquare = `${FILES[c]}${RANKS[r]}` as Square;
          break;
        }
      }
    }
  }

  const ranksToDisplay = playerColor === 'b' ? [...RANKS].reverse() : RANKS;
  const filesToDisplay = playerColor === 'b' ? [...FILES].reverse() : FILES;

  return (
    <View style={styles.container}>
      {/* Top Player Status Bar */}
      <View style={[styles.playerHeader, { width: boardSize }]}>
        <View style={styles.playerInfo}>
          <View style={[styles.colorIndicator, { backgroundColor: '#1A1D20' }]} />
          <Text style={styles.playerName}>
            {mode === 'vsAI' ? `Bot AI (${aiDifficulty})` : 'Black'}
          </Text>
          {materialDiff < 0 && (
            <View style={styles.diffBadge}>
              <Text style={styles.diffText}>+{Math.abs(materialDiff)}</Text>
            </View>
          )}
        </View>

        {/* Captured by Black */}
        <View style={styles.capturedRow}>
          {capturedPieces.b.map((p, idx) => (
            <ChessPiece key={`cap-b-${idx}`} type={p} color="w" size={18} />
          ))}
        </View>

        <View style={[styles.timerBadge, game.turn() === 'b' && styles.timerActive]}>
          <Text style={styles.timerText}>{formatTime(blackTime)}</Text>
        </View>
      </View>

      {/* Main Board Container */}
      <View style={[styles.boardWrapper, { width: boardSize, height: boardSize, borderColor: colors.border }]}>
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

                    {/* Piece */}
                    {piece && (
                      <ChessPiece type={piece.type} color={piece.color} size={squareSize * 0.85} />
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

        {/* Game Over Banner Overlay */}
        {isGameOver && (
          <View style={styles.gameOverOverlay}>
            <View style={styles.gameOverCard}>
              <Text style={styles.gameOverTitle}>🏆 Game Over</Text>
              <Text style={styles.gameOverResult}>{gameResult || 'Match Ended'}</Text>
              <View style={styles.gameOverButtons}>
                <Pressable style={styles.actionBtnPrimary} onPress={reset}>
                  <Text style={styles.actionBtnTextPrimary}>New Match</Text>
                </Pressable>
                <Pressable style={styles.actionBtnSecondary} onPress={undo}>
                  <Text style={styles.actionBtnTextSecondary}>Undo Move</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Bottom Player Status Bar */}
      <View style={[styles.playerHeader, { width: boardSize }]}>
        <View style={styles.playerInfo}>
          <View style={[styles.colorIndicator, { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CCC' }]} />
          <Text style={styles.playerName}>White (You)</Text>
          {materialDiff > 0 && (
            <View style={styles.diffBadge}>
              <Text style={styles.diffText}>+{materialDiff}</Text>
            </View>
          )}
        </View>

        {/* Captured by White */}
        <View style={styles.capturedRow}>
          {capturedPieces.w.map((p, idx) => (
            <ChessPiece key={`cap-w-${idx}`} type={p} color="b" size={18} />
          ))}
        </View>

        <View style={[styles.timerBadge, game.turn() === 'w' && styles.timerActive]}>
          <Text style={styles.timerText}>{formatTime(whiteTime)}</Text>
        </View>
      </View>

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
                  <ChessPiece type={piece} color={game.turn()} size={44} />
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
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
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
