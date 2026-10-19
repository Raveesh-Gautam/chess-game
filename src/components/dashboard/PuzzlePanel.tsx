import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useGameStore } from '../../store/gamestore';
import { colors, space, radius, type, shadow } from '../chess/chess-theme';

export const PuzzlePanel: React.FC = () => {
  const { currentPuzzle, puzzleSolved, puzzleError, nextPuzzle, reset } = useGameStore();

  if (!currentPuzzle) return null;

  return (
    <View
      style={[
        styles.container,
        puzzleSolved && styles.solved,
        puzzleError && styles.error,
      ]}
    >
      <View style={styles.row}>
        <Text style={styles.title} numberOfLines={1}>
          🧩 {currentPuzzle.title}
        </Text>
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>{currentPuzzle.rating}</Text>
        </View>
      </View>

      <Text style={styles.desc}>{currentPuzzle.description}</Text>

      {puzzleSolved && (
        <View style={[styles.msgBox, styles.msgBoxGood]}>
          <Text style={styles.msgGood}>✅ Correct! Puzzle solved.</Text>
        </View>
      )}
      {puzzleError && (
        <View style={[styles.msgBox, styles.msgBoxBad]}>
          <Text style={styles.msgBad}>❌ Wrong move, try again...</Text>
        </View>
      )}

      <View style={styles.btnRow}>
        <Pressable
          style={({ pressed }) => [styles.btnSecondary, pressed && styles.pressed]}
          onPress={reset}
        >
          <Text style={styles.btnTextSecondary}>Retry</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.btnPrimary, pressed && styles.pressed]}
          onPress={nextPuzzle}
        >
          <Text style={styles.btnTextPrimary}>Next Puzzle ➜</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 540,
    backgroundColor: colors.surface,
    borderRadius: radius.lg + 2,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.lg,
    gap: space.md,
    ...shadow(3),
  },
  solved: { borderColor: colors.primary, backgroundColor: colors.primaryBg },
  error: { borderColor: colors.danger, backgroundColor: colors.dangerBg },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: space.sm,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: type.title + 1,
    fontWeight: '800',
  },
  ratingBadge: {
    backgroundColor: colors.border,
    paddingHorizontal: space.sm + 2,
    paddingVertical: space.xs,
    borderRadius: radius.sm,
  },
  ratingText: {
    color: colors.warning,
    fontSize: type.small,
    fontWeight: '800',
  },
  desc: {
    color: colors.textMuted,
    fontSize: type.body - 1,
    lineHeight: 20,
  },
  msgBox: {
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
  },
  msgBoxGood: { backgroundColor: 'rgba(16, 185, 129, 0.15)' },
  msgBoxBad: { backgroundColor: 'rgba(239, 68, 68, 0.15)' },
  msgGood: { color: '#34D399', fontWeight: '800', fontSize: type.body },
  msgBad: { color: '#FCA5A5', fontWeight: '800', fontSize: type.body },
  btnRow: {
    flexDirection: 'row',
    gap: space.md,
    marginTop: space.xs,
  },
  pressed: { opacity: 0.8 },
  btnPrimary: {
    flex: 1.4,
    backgroundColor: colors.primary,
    paddingVertical: space.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  btnTextPrimary: { color: '#FFFFFF', fontWeight: '800', fontSize: type.body - 1 },
  btnSecondary: {
    flex: 1,
    backgroundColor: colors.border,
    paddingVertical: space.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  btnTextSecondary: { color: colors.text, fontWeight: '700', fontSize: type.body - 1 },
});