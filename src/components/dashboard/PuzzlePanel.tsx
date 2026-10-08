import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useGameStore } from '../../store/gamestore';

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
        <Text style={styles.title}>🧩 {currentPuzzle.title}</Text>
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>{currentPuzzle.rating}</Text>
        </View>
      </View>

      <Text style={styles.desc}>{currentPuzzle.description}</Text>

      {puzzleSolved && <Text style={styles.msgGood}>✅ Sahi! Puzzle solve ho gaya.</Text>}
      {puzzleError && <Text style={styles.msgBad}>❌ Galat chaal, dobara try karo...</Text>}

      <View style={styles.btnRow}>
        <Pressable style={styles.btnSecondary} onPress={reset}>
          <Text style={styles.btnTextSecondary}>Retry</Text>
        </Pressable>
        <Pressable style={styles.btnPrimary} onPress={nextPuzzle}>
          <Text style={styles.btnTextPrimary}>Next Puzzle ➜</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 14,
    gap: 8,
  },
  solved: { borderColor: '#10B981', backgroundColor: '#064E3B' },
  error: { borderColor: '#EF4444', backgroundColor: '#450A0A' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: '#F8FAFC', fontSize: 16, fontWeight: '800' },
  ratingBadge: { backgroundColor: '#334155', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  ratingText: { color: '#F59E0B', fontSize: 12, fontWeight: '800' },
  desc: { color: '#94A3B8', fontSize: 13 },
  msgGood: { color: '#34D399', fontWeight: '800', fontSize: 14 },
  msgBad: { color: '#FCA5A5', fontWeight: '800', fontSize: 14 },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  btnPrimary: { flex: 1, backgroundColor: '#10B981', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  btnTextPrimary: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  btnSecondary: { flex: 1, backgroundColor: '#334155', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  btnTextSecondary: { color: '#F8FAFC', fontWeight: '700', fontSize: 13 },
});