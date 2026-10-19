import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useGameStore } from '../../store/gamestore';
import { AIDifficulty, BoardTheme } from '../../types/chess';
import { colors, space, radius, type, mono } from './chess-theme';

type ActionBtnProps = {
  icon: string;
  label: string;
  active?: boolean;
  onPress: () => void;
};

const ActionBtn: React.FC<ActionBtnProps> = ({ icon, label, active, onPress }) => (
  <Pressable onPress={onPress} style={styles.actionWrap}>
    {({ pressed }) => (
      <View
        style={[
          styles.actionBtn,
          active && styles.actionBtnActive,
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.actionIcon}>{icon}</Text>
        <Text style={styles.actionLabel} numberOfLines={1}>
          {label}
        </Text>
      </View>
    )}
  </Pressable>
);

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
    playerColor,
    setPlayerColor,
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

  const colorOptions = [
    { id: 'w', name: '⚪ White' },
    { id: 'b', name: '⚫ Black' },
  ] as const;

  return (
    <View style={styles.container}>
      {/* Quick actions */}
      <View style={styles.actionRow}>
        <ActionBtn icon="🔄" label="New Game" onPress={reset} />
        <ActionBtn icon="↩️" label="Undo" onPress={undo} />
        <ActionBtn
          icon="👥"
          label="2 Players"
          active={mode === 'passAndPlay'}
          onPress={() => setMode('passAndPlay')}
        />
        <ActionBtn
          icon="🤖"
          label="vs Bot"
          active={mode === 'vsAI'}
          onPress={() => setMode('vsAI', aiDifficulty)}
        />
      </View>

      {/* Bot settings */}
      {mode === 'vsAI' && (
        <View style={styles.card}>
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

          <View style={styles.divider} />

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Play As</Text>
            <View style={styles.optionsRow}>
              {colorOptions.map((c) => (
                <Pressable
                  key={c.id}
                  style={[
                    styles.optionChip,
                    playerColor === c.id && styles.optionChipSelected,
                  ]}
                  onPress={() => setPlayerColor(c.id)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      playerColor === c.id && styles.chipTextSelected,
                    ]}
                  >
                    {c.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Board theme */}
      <View style={styles.card}>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Board Style</Text>
          <View style={styles.optionsRow}>
            {themes.map((t) => (
              <Pressable
                key={t.id}
                style={[styles.themeChip, boardTheme === t.id && styles.themeChipSelected]}
                onPress={() => setBoardTheme(t.id)}
              >
                <View style={[styles.themeDot, { backgroundColor: t.color }]} />
                <Text
                  style={[styles.chipText, boardTheme === t.id && styles.chipTextSelected]}
                >
                  {t.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      {/* Move history */}
      {historySAN.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Move History</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.historyContent}
          >
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
    gap: space.md,
    paddingVertical: space.sm,
  },
  pressed: {
    opacity: 0.75,
  },
  actionRow: {
    flexDirection: 'row',
    gap: space.sm,
  },
  actionWrap: {
    flex: 1,
  },
  actionBtn: {
    backgroundColor: colors.surface,
    paddingVertical: space.md,
    paddingHorizontal: space.xs,
    borderRadius: radius.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  actionBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryBg,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionLabel: {
    color: colors.text,
    fontSize: type.caption,
    fontWeight: '700',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.lg - 2,
    gap: space.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  sectionContainer: {
    gap: space.sm + 2,
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: type.small,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  optionChip: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: space.md + 2,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  themeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm - 2,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: space.md + 2,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  themeChipSelected: {
    borderColor: colors.info,
    backgroundColor: colors.bg,
  },
  themeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  chipText: {
    color: colors.textSoft,
    fontSize: type.small,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  historyContent: {
    paddingVertical: 2,
    paddingRight: space.sm,
  },
  notationPair: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: space.md,
    paddingVertical: space.sm - 2,
    borderRadius: radius.sm + 2,
    marginRight: space.sm,
    gap: space.sm - 2,
  },
  moveNum: {
    color: colors.textDim,
    fontSize: type.small,
    fontWeight: '700',
  },
  moveText: {
    color: colors.text,
    fontSize: type.body - 1,
    fontWeight: '700',
    fontFamily: mono,
  },
});