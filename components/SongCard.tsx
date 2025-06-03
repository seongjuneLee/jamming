import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Music, MoreVertical } from 'lucide-react-native';
import { Song } from '@/types';
import { colors } from '@/constants/colors';

interface SongCardProps {
  song: Song;
  onPress?: () => void;
  onOptionsPress?: () => void;
}

export const SongCard: React.FC<SongCardProps> = ({ 
  song, 
  onPress,
  onOptionsPress
}) => {
  const router = useRouter();
  
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/songs/${song.id}`);
    }
  };
  
  const getStatusColor = () => {
    switch (song.status) {
      case 'to-practice':
        return colors.warning;
      case 'in-progress':
        return colors.primary;
      case 'completed':
        return colors.success;
      default:
        return colors.textSecondary;
    }
  };
  
  const getStatusText = () => {
    switch (song.status) {
      case 'to-practice':
        return 'To Practice';
      case 'in-progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Music color={colors.primary} size={24} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{song.title}</Text>
        <Text style={styles.artist} numberOfLines={1}>{song.artist}</Text>
        
        <View style={styles.footer}>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${song.progress}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{song.progress}%</Text>
          </View>
        </View>
        
        {(song.bpm || song.key || song.timeSignature || (song.instruments && song.instruments.length > 0) || (song.chords && song.chords.length > 0)) && (
          <View style={styles.detailsContainer}>
            {song.bpm && (
              <Text style={styles.detailText}>
                {song.bpm} BPM
              </Text>
            )}
            {song.key && (
              <Text style={styles.detailText}>
                Key: {song.key}
              </Text>
            )}
            {song.timeSignature && (
              <Text style={styles.detailText}>
                {song.timeSignature}
              </Text>
            )}
            {song.instruments && song.instruments.length > 0 && (
              <Text style={styles.detailText}>
                {song.instruments.length > 2 
                  ? `${song.instruments.slice(0, 2).join(', ')}...` 
                  : song.instruments.join(', ')}
              </Text>
            )}
            {song.chords && song.chords.length > 0 && (
              <Text style={styles.detailText}>
                {song.chords.length > 2 
                  ? `${song.chords.slice(0, 2).join(', ')}...` 
                  : song.chords.join(', ')}
              </Text>
            )}
          </View>
        )}
      </View>
      
      <TouchableOpacity 
        style={styles.optionsButton}
        onPress={onOptionsPress}
        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
      >
        <MoreVertical color={colors.textSecondary} size={20} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: `${colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  artist: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    width: 50,
    height: 4,
    backgroundColor: colors.divider,
    borderRadius: 2,
    marginRight: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  detailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailText: {
    fontSize: 12,
    color: colors.primary,
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  optionsButton: {
    padding: 4,
  },
});