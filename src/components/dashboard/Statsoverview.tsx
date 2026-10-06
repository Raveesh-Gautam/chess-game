import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useGameStore } from '../../store/gamestore';

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
              <Text style={styles.opponentName}>{match.opponent}</Text>
              <Text style={styles.openingText}>
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
    gap: 10,
  },
  headerTitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  list: {
    gap: 8,
  },
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 12,
  },
  resultTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 68,
    alignItems: 'center',
  },
  winTag: {
    backgroundColor: '#065F46',
  },
  drawTag: {
    backgroundColor: '#92400E',
  },
  lossTag: {
    backgroundColor: '#991B1B',
  },
  resultText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  matchDetails: {
    flex: 1,
    gap: 2,
  },
  opponentName: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  openingText: {
    color: '#94A3B8',
    fontSize: 11,
  },
  dateText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
});
