import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { colors } from '@/constants/colors';
import { useSongStore } from '@/store/songStore';

export default function RecordScreen() {
  const { songId } = useLocalSearchParams<{ songId: string }>();
  const { songs } = useSongStore();
  const song = songs.find(s => s.id === songId);

  if (!song) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Song not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: `Record: ${song.title}` }} />
      <View style={styles.container}>
        <Text style={styles.title}>{song.title}</Text>
        <Text style={styles.artist}>{song.artist}</Text>
        {/* 녹음 기능은 추후 구현 */}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  artist: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  text: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
}); 