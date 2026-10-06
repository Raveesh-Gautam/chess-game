import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useGameStore } from '../../store/gamestore';
import { GameMode, AIDifficulty } from '../../types/chess';

interface QuickModesProps {
  onSelectPlayTab?: () => void;
}

export const QuickModes: React.FC<QuickModesProps> = ({ onSelectPlayTab }) => {
  const { setMode, mode, aiDifficulty } = useGameStore();

  const handleStartMode = (selectedMode: GameMode, difficulty?: AIDifficulty) => {
    setMode(selectedMode, difficulty);
    if (onSelectPlayTab) onSelectPlayTab();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Select Game Mode</Text>

      <View style={styles.grid}>
        {/* Pass & Play */}
        <Pressable
          style={[styles.card, mode === 'passAndPlay' && styles.cardActive]}
          onPress={() => handleStartMode('passAndPlay')}
        >
          <View style={[styles.iconBg, { backgroundColor: '#0284C7' }]}>
            <Text style={styles.iconText}>👥</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Pass & Play</Text>
            <Text style={styles.cardDesc}>Play 2 Players locally on 1 screen</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Local</Text>
          </View>
        </Pressable>

        {/* Vs AI Bot */}
        <Pressable
          style={[styles.card, mode === 'vsAI' && styles.cardActive]}
          onPress={() => handleStartMode('vsAI', 'medium')}
        >
          <View style={[styles.iconBg, { backgroundColor: '#7C3AED' }]}>
            <Text style={styles.iconText}>🤖</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Play vs Bot</Text>
            <Text style={styles.cardDesc}>Novice (800) to Grandmaster (2400)</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: '#6D28D9' }]}>
            <Text style={styles.badgeText}>AI Engine</Text>
          </View>
        </Pressable>

        {/* Blitz Match */}
        <Pressable
          style={[styles.card, mode === 'blitz' && styles.cardActive]}
          onPress={() => handleStartMode('blitz')}
        >
          <View style={[styles.iconBg, { backgroundColor: '#D97706' }]}>
            <Text style={styles.iconText}>⚡</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Speed Blitz (3m)</Text>
            <Text style={styles.cardDesc}>Fast-paced timed chess battle</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: '#B45309' }]}>
            <Text style={styles.badgeText}>3 Min</Text>
          </View>
        </Pressable>

        {/* Tactical Puzzles */}
        <Pressable
          style={styles.card}
          onPress={() => handleStartMode('puzzle')}
        >
          <View style={[styles.iconBg, { backgroundColor: '#059669' }]}>
            <Text style={styles.iconText}>🧩</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Tactics & Puzzles</Text>
            <Text style={styles.cardDesc}>Solve daily mate in 1/2 puzzles</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: '#047857' }]}>
            <Text style={styles.badgeText}>Daily</Text>
          </View>
        </Pressable>
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
  grid: {
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 12,
  },
  cardActive: {
    borderColor: '#10B981',
    backgroundColor: '#0F172A',
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 22,
  },
  cardContent: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  cardDesc: {
    color: '#94A3B8',
    fontSize: 12,
  },
  badge: {
    backgroundColor: '#0369A1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
});
