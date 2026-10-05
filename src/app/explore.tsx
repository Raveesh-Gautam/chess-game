import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { useGameStore, PUZZLES } from '@/store/gamestore';
import { ChessBoard } from '@/components/chess/chess-board';
import { Puzzle } from '@/types/chess';

export default function PuzzlesExploreScreen() {
  const { loadPuzzle, currentPuzzle } = useGameStore();
  const [activePuzzleIndex, setActivePuzzleIndex] = useState(0);

  const handleSelectPuzzle = (index: number) => {
    setActivePuzzleIndex(index);
    loadPuzzle(PUZZLES[index]);
  };

  const current = currentPuzzle || PUZZLES[activePuzzleIndex];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🧩 Tactics & Puzzles</Text>
          <Text style={styles.headerSubtitle}>
            Sharpen your tactical vision with daily checkmate challenges
          </Text>
        </View>

        {/* Puzzle Selector Chips */}
        <View style={styles.puzzleChipsRow}>
          {PUZZLES.map((puzzle, idx) => (
            <Pressable
              key={puzzle.id}
              style={[
                styles.chip,
                activePuzzleIndex === idx && styles.chipActive,
              ]}
              onPress={() => handleSelectPuzzle(idx)}
            >
              <Text
                style={[
                  styles.chipText,
                  activePuzzleIndex === idx && styles.chipTextActive,
                ]}
              >
                Puzzle #{idx + 1} ({puzzle.rating})
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Active Puzzle Card */}
        <View style={styles.puzzleCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.puzzleTitle}>{current.title}</Text>
              <Text style={styles.puzzleDesc}>{current.description}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>Elo {current.rating}</Text>
            </View>
          </View>

          {/* Puzzle Chess Board */}
          <ChessBoard />
        </View>

        {/* Opening Lessons Section */}
        <View style={styles.lessonsSection}>
          <Text style={styles.sectionTitle}>📚 Master Openings Guide</Text>

          <View style={styles.lessonCard}>
            <Text style={styles.lessonIcon}>⚔️</Text>
            <View style={styles.lessonTextCol}>
              <Text style={styles.lessonTitle}>Sicilian Defense (1. e4 c5)</Text>
              <Text style={styles.lessonDesc}>
                The most aggressive and sharp counter-attacking opening for Black against 1. e4.
              </Text>
            </View>
          </View>

          <View style={styles.lessonCard}>
            <Text style={styles.lessonIcon}>🛡️</Text>
            <View style={styles.lessonTextCol}>
              <Text style={styles.lessonTitle}>Ruy Lopez (1. e4 e5 2. Nf3 Nc6 3. Bb5)</Text>
              <Text style={styles.lessonDesc}>
                Classical opening focusing on rapid kingside development and central pressure.
              </Text>
            </View>
          </View>

          <View style={styles.lessonCard}>
            <Text style={styles.lessonIcon}>👑</Text>
            <View style={styles.lessonTextCol}>
              <Text style={styles.lessonTitle}>Queen's Gambit (1. d4 d5 2. c4)</Text>
              <Text style={styles.lessonDesc}>
                White offers a wing pawn to dominate the central squares d4 and e4.
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    alignItems: 'center',
    gap: 16,
  },
  header: {
    width: '100%',
    maxWidth: 540,
    gap: 4,
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '900',
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
  },
  puzzleChipsRow: {
    width: '100%',
    maxWidth: 540,
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  chipActive: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  chipText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  puzzleCard: {
    width: '100%',
    maxWidth: 540,
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    gap: 12,
  },
  cardHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  puzzleTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
  },
  puzzleDesc: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  ratingBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ratingText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
  },
  lessonsSection: {
    width: '100%',
    maxWidth: 540,
    gap: 10,
  },
  sectionTitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 12,
  },
  lessonIcon: {
    fontSize: 24,
  },
  lessonTextCol: {
    flex: 1,
    gap: 2,
  },
  lessonTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  lessonDesc: {
    color: '#94A3B8',
    fontSize: 11,
  },
});
