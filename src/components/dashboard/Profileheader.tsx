import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useGameStore } from '../../store/gamestore';
import { colors, space, radius, type, shadow } from '../chess/chess-theme';

export const ProfileHeader: React.FC = () => {
  const { stats } = useGameStore();

  const totalGames = stats.wins + stats.losses + stats.draws;
  const winRate = totalGames > 0 ? Math.round((stats.wins / totalGames) * 100) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>♔</Text>
        </View>

        <View style={styles.userTextCol}>
          <View style={styles.nameRow}>
            <Text style={styles.userName} numberOfLines={1}>
              Chess Master
            </Text>
            <View style={styles.titleBadge}>
              <Text style={styles.titleBadgeText}>TACTICIAN</Text>
            </View>
          </View>
          <Text style={styles.userSubtitle}>Rapid Rating: {stats.rating} Elo</Text>
        </View>

        <View style={styles.streakBadge}>
          <Text style={styles.streakIcon}>🔥</Text>
          <Text style={styles.streakCount}>{stats.streak}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statVal}>{stats.rating}</Text>
          <Text style={styles.statLabel}>ELO RATING</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={[styles.statVal, { color: colors.primary }]}>{winRate}%</Text>
          <Text style={styles.statLabel}>WIN RATE</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={[styles.statVal, { color: colors.info }]}>{stats.wins}</Text>
          <Text style={styles.statLabel}>VICTORIES</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={[styles.statVal, { color: colors.warning }]}>{stats.puzzlesSolved}</Text>
          <Text style={styles.statLabel}>PUZZLES</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 540,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: space.lg,
    ...shadow(4),
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.info,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0284C7',
  },
  avatarText: {
    fontSize: 30,
    color: colors.surfaceAlt,
    includeFontPadding: false,
  },
  userTextCol: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  userName: {
    color: colors.text,
    fontSize: type.title + 2,
    fontWeight: '800',
    flexShrink: 1,
  },
  titleBadge: {
    backgroundColor: colors.purple,
    paddingHorizontal: space.sm - 1,
    paddingVertical: 3,
    borderRadius: radius.sm - 2,
  },
  titleBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  userSubtitle: {
    color: colors.textMuted,
    fontSize: type.small + 1,
    fontWeight: '600',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7C2D12',
    paddingHorizontal: space.md - 2,
    paddingVertical: space.sm - 1,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#EA580C',
    gap: space.xs,
  },
  streakIcon: {
    fontSize: type.body,
  },
  streakCount: {
    color: '#FFEDD5',
    fontWeight: '800',
    fontSize: type.body - 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  statsRow: {
    flexDirection: 'row',
    gap: space.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    paddingVertical: space.md,
    paddingHorizontal: space.xs,
    borderRadius: radius.md + 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderSoft,
    gap: 4,
  },
  statVal: {
    color: colors.text,
    fontSize: type.title + 2,
    fontWeight: '800',
  },
  statLabel: {
    color: colors.textDim,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});