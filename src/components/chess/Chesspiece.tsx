import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { PieceSymbol, Color } from 'chess.js';

interface ChessPieceProps {
  type: PieceSymbol;
  color: Color;
  size?: number;
}

const PIECE_UNICODE: Record<Color, Record<PieceSymbol, string>> = {
  w: {
    k: '♔',
    q: '♕',
    r: '♖',
    b: '♗',
    n: '♘',
    p: '♙',
  },
  b: {
    k: '♚',
    q: '♛',
    r: '♜',
    b: '♝',
    n: '♞',
    p: '♟',
  },
};

export const ChessPiece: React.FC<ChessPieceProps> = ({ type, color, size = 32 }) => {
  const symbol = PIECE_UNICODE[color][type];
  const isWhite = color === 'w';

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Text
        style={[
          styles.pieceText,
          {
            fontSize: size * 0.82,
            lineHeight: size,
            color: isWhite ? '#FFFFFF' : '#1A1D20',
            textShadowColor: isWhite ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.4)',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 2,
          },
        ]}
      >
        {symbol}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieceText: {
    textAlign: 'center',
    fontWeight: '700',
    includeFontPadding: false,
  },
});
