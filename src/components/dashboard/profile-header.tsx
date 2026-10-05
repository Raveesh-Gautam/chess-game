import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useGameStore } from '../../store/gamestore';

export const ProfileHeader: React.FC = () => {
  const { stats } = useGameStore();

  const totalGames = stats.wins + stats.losses + stats.draws;
  const winRate = totalGames > 0 ? Math.round((stats.wins / totalGames) * 100) : 0;

  return (
    <View style={styles.container}>
      {/* Profile Info */}
      <View style={styles.topRow}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>♔</Text>
        </View>

        <View style={styles.userTextCol}>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>Chess Master</Text>
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

      {/* Quick Stats Grid */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statVal}>{stats.rating}</Text>
          <Text style={styles.statLabel}>Elo Rating</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={[styles.statVal, { color: '#10B981' }]}>{winRate}%</Text>
          <Text style={styles.statLabel}>Win Rate</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={[styles.statVal, { color: '#38BDF8' }]}>{stats.wins}</Text>
          <Text style={styles.statLabel}>Victories</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={[styles.statVal, { color: '#F59E0B' }]}>{stats.puzzlesSolved}</Text>
          <Text style={styles.statLabel}>Puzzles</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 540,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#38BDF8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0284C7',
  },
  avatarText: {
    fontSize: 28,
    color: '#0F172A',
  },
  userTextCol: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
  },
  titleBadge: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  titleBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  userSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7C2D12',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EA580C',
    gap: 4,
  },
  streakIcon: {
    fontSize: 14,
  },
  streakCount: {
    color: '#FFEDD5',
    fontWeight: '800',
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  statVal: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
  },
  statLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
});
