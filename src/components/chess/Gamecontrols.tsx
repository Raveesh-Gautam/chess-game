import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useGameStore } from '../../store/gamestore';
import { GameMode, AIDifficulty, BoardTheme } from '../../types/chess';

export const GameControls: React.FC = () => {
  const {
    mode,
    setMode,
    aiDifficulty,
    boardTheme,
    setBoardTheme,
    undo,
    reset,
    historySAN,
  } = useGameStore();

  const themes: { id: BoardTheme; name: string; color: string }[] = [
    { id: 'emerald', name: 'Emerald', color: '#769656' },
    { id: 'wood', name: 'Walnut', color: '#B58863' },
    { id: 'cyber', name: 'Cyberpunk', color: '#6366F1' },
    { id: 'slate', name: 'Midnight', color: '#475569' },
  ];

  const difficulties: { id: AIDifficulty; name: string; rating: string }[] = [
    { id: 'easy', name: 'Novice', rating: '800' },
    { id: 'medium', name: 'Intermediate', rating: '1400' },
    { id: 'hard', name: 'Master', rating: '1900' },
    { id: 'grandmaster', name: 'Grandmaster', rating: '2400' },
  ];

  return (
    <View style={styles.container}>
      {/* Quick Action Buttons Row */}
      <View style={styles.actionRow}>
        <Pressable style={styles.actionBtn} onPress={reset}>
          <Text style={styles.actionIcon}>🔄</Text>
          <Text style={styles.actionLabel}>New Game</Text>
        </Pressable>

        <Pressable style={styles.actionBtn} onPress={undo}>
          <Text style={styles.actionIcon}>↩️</Text>
          <Text style={styles.actionLabel}>Undo</Text>
        </Pressable>

        <Pressable
          style={[styles.actionBtn, mode === 'passAndPlay' && styles.actionBtnActive]}
          onPress={() => setMode('passAndPlay')}
        >
          <Text style={styles.actionIcon}>👥</Text>
          <Text style={styles.actionLabel}>2 Players</Text>
        </Pressable>

        <Pressable
          style={[styles.actionBtn, mode === 'vsAI' && styles.actionBtnActive]}
          onPress={() => setMode('vsAI', aiDifficulty)}
        >
          <Text style={styles.actionIcon}>🤖</Text>
          <Text style={styles.actionLabel}>vs Bot</Text>
        </Pressable>
      </View>

      {/* Bot Difficulty Selector (If vsAI) */}
      {mode === 'vsAI' && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Bot Difficulty</Text>
          <View style={styles.optionsRow}>
            {difficulties.map((diff) => (
              <Pressable
                key={diff.id}
                style={[
                  styles.optionChip,
                  aiDifficulty === diff.id && styles.optionChipSelected,
                ]}
                onPress={() => setMode('vsAI', diff.id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    aiDifficulty === diff.id && styles.chipTextSelected,
                  ]}
                >
                  {diff.name} ({diff.rating})
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Board Theme Picker */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Board Style</Text>
        <View style={styles.optionsRow}>
          {themes.map((t) => (
            <Pressable
              key={t.id}
              style={[
                styles.themeChip,
                boardTheme === t.id && styles.themeChipSelected,
              ]}
              onPress={() => setBoardTheme(t.id)}
            >
              <View style={[styles.themeDot, { backgroundColor: t.color }]} />
              <Text
                style={[
                  styles.chipText,
                  boardTheme === t.id && styles.chipTextSelected,
                ]}
              >
                {t.name}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Move Notation Stream */}
      {historySAN.length > 0 && (
        <View style={styles.notationContainer}>
          <Text style={styles.sectionTitle}>Move History</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.historyScroll}>
            {historySAN.map((move, index) => {
              if (index % 2 === 0) {
                const moveNum = Math.floor(index / 2) + 1;
                const blackMove = historySAN[index + 1] || '';
                return (
                  <View key={`move-${index}`} style={styles.notationPair}>
                    <Text style={styles.moveNum}>{moveNum}.</Text>
                    <Text style={styles.moveText}>{move}</Text>
                    {blackMove !== '' && <Text style={styles.moveText}>{blackMove}</Text>}
                  </View>
                );
              }
              return null;
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 540,
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#1E293B',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  actionBtnActive: {
    borderColor: '#10B981',
    backgroundColor: '#064E3B',
  },
  actionIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  actionLabel: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '700',
  },
  sectionContainer: {
    gap: 6,
  },
  sectionTitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  optionChipSelected: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  themeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  themeChipSelected: {
    borderColor: '#38BDF8',
    backgroundColor: '#0F172A',
  },
  themeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  chipText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  notationContainer: {
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 6,
  },
  historyScroll: {
    flexDirection: 'row',
  },
  notationPair: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    gap: 6,
  },
  moveNum: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
  moveText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
});
