import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Mic, Play, Trash2 } from 'lucide-react-native';
import { Recording } from '@/types';
import { colors } from '@/constants/colors';
import { formatDuration } from '@/utils/formatters';

interface RecordingItemProps {
  recording: Recording;
  onPlay: () => void;
  onDelete: () => void;
  isPlaying?: boolean;
}

export const RecordingItem: React.FC<RecordingItemProps> = ({
  recording,
  onPlay,
  onDelete,
  isPlaying = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Mic color={colors.primary} size={20} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{recording.name}</Text>
        <Text style={styles.info}>
          {formatDuration(recording.duration)} • {new Date(recording.createdAt).toLocaleDateString()}
        </Text>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.actionButton, isPlaying && styles.playingButton]} 
          onPress={onPlay}
        >
          <Play 
            color={isPlaying ? colors.text : colors.primary} 
            size={16} 
            fill={isPlaying ? colors.text : 'none'}
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={onDelete}
        >
          <Trash2 color={colors.error} size={16} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  info: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.divider,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  playingButton: {
    backgroundColor: colors.primary,
  },
});