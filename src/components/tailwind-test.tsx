import React, { useState } from 'react';
import { Text, View, Pressable } from 'react-native';

export function TailwindTest() {
  const [count, setCount] = useState(0);

  return (
    <View className="w-full max-w-sm p-6 bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl space-y-4">
      {/* Header Badge */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center space-x-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          <View className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <Text className="text-xs font-semibold text-emerald-400 tracking-wide uppercase">
            Tailwind CSS Active
          </Text>
        </View>
        <Text className="text-xs text-slate-400 font-mono">v4.0 (NativeWind)</Text>
      </View>

      {/* Main Content */}
      <View className="my-2">
        <Text className="text-2xl font-extrabold text-white tracking-tight">
          NativeWind Test Component
        </Text>
        <Text className="text-sm text-slate-400 mt-1 leading-relaxed">
          Tailwind CSS utility classes are working seamlessly in your Expo React Native app!
        </Text>
      </View>

      {/* Interactive Counter Box */}
      <View className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/50 flex-row items-center justify-between">
        <View>
          <Text className="text-xs text-slate-400 font-medium">Interactive Counter</Text>
          <Text className="text-2xl font-black text-indigo-400 mt-0.5">{count}</Text>
        </View>
        
        <View className="flex-row space-x-2">
          <Pressable
            onPress={() => setCount((c) => Math.max(0, c - 1))}
            className="w-10 h-10 rounded-xl bg-slate-700 items-center justify-center active:bg-slate-600 active:scale-95 transition"
          >
            <Text className="text-lg font-bold text-slate-200">-</Text>
          </Pressable>

          <Pressable
            onPress={() => setCount((c) => c + 1)}
            className="w-10 h-10 rounded-xl bg-indigo-600 items-center justify-center active:bg-indigo-500 active:scale-95 transition"
          >
            <Text className="text-lg font-bold text-white">+</Text>
          </Pressable>
        </View>
      </View>

      {/* Color Swatch Badges */}
      <View className="flex-row justify-between pt-2">
        <View className="px-3 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
          <Text className="text-xs font-medium text-indigo-300">Indigo</Text>
        </View>
        <View className="px-3 py-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30">
          <Text className="text-xs font-medium text-purple-300">Purple</Text>
        </View>
        <View className="px-3 py-1.5 rounded-lg bg-pink-500/20 border border-pink-500/30">
          <Text className="text-xs font-medium text-pink-300">Pink</Text>
        </View>
        <View className="px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
          <Text className="text-xs font-medium text-cyan-300">Cyan</Text>
        </View>
      </View>
    </View>
  );
}
