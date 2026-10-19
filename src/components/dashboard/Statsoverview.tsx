import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useGameStore } from '../../store/gamestore';
import { colors, space, radius, type } from '../chess/chess-theme';

export const StatsOverview: React.FC = () => {
  const { recentMatches, stats } = useGameStore();

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Match History & Activity</Text>

      <View style={styles.list}>
        {recentMatches.map((match) => (
          <View key={match.id} style={styles.matchCard}>
            <View
              style={[
                styles.resultTag,
                match.result === 'win'
                  ? styles.winTag
                  : match.result === 'draw'
                    ? styles.drawTag
                    : styles.lossTag,
              ]}
            >
              <Text style={styles.resultText}>
                {match.result === 'win' ? 'VICTORY' : match.result === 'draw' ? 'DRAW' : 'DEFEAT'}
              </Text>
            </View>

            <View style={styles.matchDetails}>
              <Text style={styles.opponentName} numberOfLines={1}>
                {match.opponent}
              </Text>
              <Text style={styles.openingText} numberOfLines={1}>
                {match.opening} • {match.movesCount} moves
              </Text>
            </View>

            <Text style={styles.dateText}>{match.date}</Text>
          </View>
        ))}
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
  list: {
    gap: space.sm + 2,
  },
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: space.md,
    paddingHorizontal: space.md + 2,
    borderRadius: radius.md + 2,
    borderWidth: 1,
    borderColor: colors.border,
    gap: space.md,
  },
  resultTag: {
    paddingHorizontal: space.sm,
    paddingVertical: space.xs + 1,
    borderRadius: radius.sm,
    minWidth: 72,
    alignItems: 'center',
  },
  winTag: { backgroundColor: '#065F46' },
  drawTag: { backgroundColor: '#92400E' },
  lossTag: { backgroundColor: '#991B1B' },
  resultText: {
    color: '#FFFFFF',
    fontSize: type.micro,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  matchDetails: {
    flex: 1,
    gap: 3,
  },
  opponentName: {
    color: colors.text,
    fontSize: type.body,
    fontWeight: '700',
  },
  openingText: {
    color: colors.textMuted,
    fontSize: type.caption,
  },
  dateText: {
    color: colors.textDim,
    fontSize: type.caption,
    fontWeight: '600',
  },
});