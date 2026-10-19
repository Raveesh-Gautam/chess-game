import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useGameStore } from '../../store/gamestore';
import { GameMode, AIDifficulty } from '../../types/chess';
import { colors, space, radius, type } from '../chess/chess-theme';

interface QuickModesProps {
  onSelectPlayTab?: () => void;
}

type ModeCardProps = {
  icon: string;
  iconBg: string;
  title: string;
  desc: string;
  badge: string;
  badgeBg: string;
  active: boolean;
  onPress: () => void;
};

const ModeCard: React.FC<ModeCardProps> = ({
  icon,
  iconBg,
  title,
  desc,
  badge,
  badgeBg,
  active,
  onPress,
}) => (
  <Pressable onPress={onPress} style={({ pressed }) => (pressed ? styles.pressed : null)}>
    <View style={[styles.card, active && styles.cardActive]}>
      <View style={[styles.iconBg, { backgroundColor: iconBg }]}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.cardDesc} numberOfLines={2}>
          {desc}
        </Text>
      </View>

      <View style={[styles.badge, { backgroundColor: badgeBg }]}>
        <Text style={styles.badgeText}>{badge}</Text>
      </View>
    </View>
  </Pressable>
);

export const QuickModes: React.FC<QuickModesProps> = ({ onSelectPlayTab }) => {
  const { setMode, mode } = useGameStore();

  const handleStartMode = (selectedMode: GameMode, difficulty?: AIDifficulty) => {
    setMode(selectedMode, difficulty);
    if (onSelectPlayTab) onSelectPlayTab();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Select Game Mode</Text>

      <View style={styles.grid}>
        <ModeCard
          icon="👥"
          iconBg="#0284C7"
          title="Pass & Play"
          desc="Play 2 Players locally on 1 screen"
          badge="Local"
          badgeBg="#0369A1"
          active={mode === 'passAndPlay'}
          onPress={() => handleStartMode('passAndPlay')}
        />

        <ModeCard
          icon="🤖"
          iconBg={colors.purple}
          title="Play vs Bot"
          desc="Novice (800) to Grandmaster (2400)"
          badge="AI Engine"
          badgeBg="#6D28D9"
          active={mode === 'vsAI'}
          onPress={() => handleStartMode('vsAI', 'medium')}
        />

        <ModeCard
          icon="⚡"
          iconBg="#D97706"
          title="Speed Blitz (3m)"
          desc="Fast-paced timed chess battle"
          badge="3 Min"
          badgeBg="#B45309"
          active={mode === 'blitz'}
          onPress={() => handleStartMode('blitz')}
        />

        <ModeCard
          icon="🧩"
          iconBg="#059669"
          title="Tactics & Puzzles"
          desc="Solve daily mate in 1/2 puzzles"
          badge="Daily"
          badgeBg="#047857"
          active={mode === 'puzzle'}
          onPress={() => handleStartMode('puzzle')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 540,
    gap: space.md,
  },
  headerTitle: {
    color: colors.textMuted,
    fontSize: type.small,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: space.xs,
  },
  grid: {
    gap: space.md,
  },
  pressed: {
    opacity: 0.8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: space.md,
    paddingHorizontal: space.md + 2,
    borderRadius: radius.lg + 2,
    borderWidth: 1,
    borderColor: colors.border,
    gap: space.md,
  },
  cardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceAlt,
  },
  iconBg: {
    width: 46,
    height: 46,
    borderRadius: radius.lg - 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 22,
  },
  cardContent: {
    flex: 1,
    gap: 3,
  },
  cardTitle: {
    color: colors.text,
    fontSize: type.title - 1,
    fontWeight: '700',
  },
  cardDesc: {
    color: colors.textMuted,
    fontSize: type.small,
    lineHeight: 16,
  },
  badge: {
    paddingHorizontal: space.sm + 2,
    paddingVertical: space.xs + 1,
    borderRadius: radius.sm,
    flexShrink: 0,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: type.micro,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});