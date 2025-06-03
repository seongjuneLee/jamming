import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Music, Clock, Hash } from 'lucide-react-native';
import { Song } from '@/types';
import { colors } from '@/constants/colors';

interface SongDetailsProps {
  song: Song;
}

export const SongDetails: React.FC<SongDetailsProps> = ({ song }) => {
  return (
    <View style={styles.container}>
      {song.bpm && (
        <View style={styles.detailItem}>
          <Clock size={16} color={colors.primary} style={styles.icon} />
          <Text style={styles.detailText}>{song.bpm} BPM</Text>
        </View>
      )}
      
      {song.timeSignature && (
        <View style={styles.detailItem}>
          <Hash size={16} color={colors.primary} style={styles.icon} />
          <Text style={styles.detailText}>{song.timeSignature}</Text>
        </View>
      )}
      
      {song.key && (
        <View style={styles.detailItem}>
          <Music size={16} color={colors.primary} style={styles.icon} />
          <Text style={styles.detailText}>Key: {song.key}</Text>
        </View>
      )}
      
      {song.instruments && song.instruments.length > 0 && (
        <View style={styles.tagsContainer}>
          <Text style={styles.tagsLabel}>Instruments:</Text>
          <View style={styles.tags}>
            {song.instruments.map((instrument, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{instrument}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      
      {song.chords && song.chords.length > 0 && (
        <View style={styles.tagsContainer}>
          <Text style={styles.tagsLabel}>Chords:</Text>
          <View style={styles.tags}>
            {song.chords.map((chord, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{chord}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 8,
  },
  detailText: {
    fontSize: 14,
    color: colors.text,
  },
  tagsContainer: {
    marginTop: 8,
  },
  tagsLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: `${colors.primary}20`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 12,
    color: colors.primary,
  },
});