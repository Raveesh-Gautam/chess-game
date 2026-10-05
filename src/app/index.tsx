import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  Pressable,
  SafeAreaView,
  Platform,
} from 'react-native';
import { ProfileHeader } from '@/components/dashboard/profile-header';
import { QuickModes } from '@/components/dashboard/quick-modes';
import { StatsOverview } from '@/components/dashboard/stats-overview';
import { ChessBoard } from '@/components/chess/chess-board';
import { GameControls } from '@/components/chess/game-controls';
import { useGameStore } from '@/store/gamestore';

export default function DashboardScreen() {
  const [activeTab, setActiveTab] = useState<'board' | 'modes' | 'stats'>('board');
  const { mode } = useGameStore();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
        <View style={styles.topHeader}>
          <View style={styles.brandRow}>
            <Text style={styles.brandLogo}>♟️</Text>
            <View>
              <Text style={styles.brandName}>CHESS MASTER</Text>
              <Text style={styles.brandTagline}>Grandmaster Arena</Text>
            </View>
          </View>

          <View style={styles.onlinePill}>
            <View style={styles.liveDot} />
            <Text style={styles.onlineText}>1,420 Players</Text>
          </View>
        </View>

        {/* Profile Card Banner */}
        <ProfileHeader />

        {/* Navigation Switcher Tabs */}
        <View style={styles.tabNavContainer}>
          <Pressable
            style={[styles.tabNavBtn, activeTab === 'board' && styles.tabNavBtnActive]}
            onPress={() => setActiveTab('board')}
          >
            <Text style={styles.tabNavIcon}>♟️</Text>
            <Text
              style={[styles.tabNavText, activeTab === 'board' && styles.tabNavTextActive]}
            >
              Play Board
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tabNavBtn, activeTab === 'modes' && styles.tabNavBtnActive]}
            onPress={() => setActiveTab('modes')}
          >
            <Text style={styles.tabNavIcon}>⚡</Text>
            <Text
              style={[styles.tabNavText, activeTab === 'modes' && styles.tabNavTextActive]}
            >
              Game Modes
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tabNavBtn, activeTab === 'stats' && styles.tabNavBtnActive]}
            onPress={() => setActiveTab('stats')}
          >
            <Text style={styles.tabNavIcon}>📊</Text>
            <Text
              style={[styles.tabNavText, activeTab === 'stats' && styles.tabNavTextActive]}
            >
              History
            </Text>
          </Pressable>
        </View>

        {/* Tab Content 1: Live Play Board */}
        {activeTab === 'board' && (
          <View style={styles.boardSection}>
            <View style={styles.modeBadgeContainer}>
              <Text style={styles.modeBadgeText}>
                CURRENT MODE:{' '}
                {mode === 'vsAI'
                  ? '🤖 VS BOT AI'
                  : mode === 'passAndPlay'
                  ? '👥 PASS & PLAY (2 PLAYERS)'
                  : mode === 'blitz'
                  ? '⚡ SPEED BLITZ'
                  : '🧩 PUZZLE SOLVER'}
              </Text>
            </View>

            <ChessBoard />
            <GameControls />
          </View>
        )}

        {/* Tab Content 2: Quick Modes */}
        {activeTab === 'modes' && (
          <QuickModes onSelectPlayTab={() => setActiveTab('board')} />
        )}

        {/* Tab Content 3: Stats & History */}
        {activeTab === 'stats' && <StatsOverview />}

        {/* Bottom Spacing */}
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
    paddingTop: Platform.OS === 'android' ? 36 : 12,
    alignItems: 'center',
    gap: 16,
  },
  topHeader: {
    width: '100%',
    maxWidth: 540,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandLogo: {
    fontSize: 32,
  },
  brandName: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  brandTagline: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
  },
  onlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  onlineText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  tabNavContainer: {
    width: '100%',
    maxWidth: 540,
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tabNavBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  tabNavBtnActive: {
    backgroundColor: '#10B981',
  },
  tabNavIcon: {
    fontSize: 14,
  },
  tabNavText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  tabNavTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  boardSection: {
    width: '100%',
    maxWidth: 540,
    alignItems: 'center',
  },
  modeBadgeContainer: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 4,
  },
  modeBadgeText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
