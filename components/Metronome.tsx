import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { Play, Pause, Plus, Minus } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useSettingsStore } from '@/store/settingsStore';

// This is a simplified metronome that doesn't actually play sounds
// In a real implementation, you would use expo-av to play the metronome sounds
export const Metronome: React.FC<{
  initialTempo?: number;
  initialTimeSignature?: string;
}> = ({ 
  initialTempo,
  initialTimeSignature
}) => {
  const { metronomeSettings, updateMetronomeSettings } = useSettingsStore();
  const { tempo, timeSignature, isPlaying } = metronomeSettings;
  
  // Update metronome settings if initialTempo or initialTimeSignature are provided
  useEffect(() => {
    if (initialTempo && initialTempo !== tempo) {
      updateMetronomeSettings({ tempo: initialTempo });
    }
    if (initialTimeSignature && initialTimeSignature !== timeSignature) {
      updateMetronomeSettings({ timeSignature: initialTimeSignature });
    }
  }, [initialTempo, initialTimeSignature]);
  
  const [count, setCount] = useState(1);
  const [timeSignatureBeats, timeSignatureDivision] = timeSignature.split('/').map(Number);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const togglePlaying = () => {
    updateMetronomeSettings({ isPlaying: !isPlaying });
  };
  
  const increaseTempo = () => {
    updateMetronomeSettings({ tempo: Math.min(tempo + 1, 240) });
  };
  
  const decreaseTempo = () => {
    updateMetronomeSettings({ tempo: Math.max(tempo - 1, 40) });
  };
  
  const handleTempoLongPress = (direction: 'increase' | 'decrease') => {
    const change = direction === 'increase' ? 5 : -5;
    const newTempo = Math.max(40, Math.min(240, tempo + change));
    updateMetronomeSettings({ tempo: newTempo });
  };
  
  useEffect(() => {
    if (isPlaying) {
      // Calculate interval in milliseconds from BPM
      const interval = 60000 / tempo;
      
      intervalRef.current = setInterval(() => {
        setCount((prevCount) => {
          const nextCount = prevCount % timeSignatureBeats + 1;
          
          // Pulse animation
          pulseAnim.setValue(1.2);
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: interval * 0.5,
            useNativeDriver: Platform.OS !== 'web',
          }).start();
          
          return nextCount;
        });
      }, interval);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [isPlaying, tempo, timeSignatureBeats]);
  
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.title}>Metronome</Text>
        <Text style={styles.timeSignature}>{timeSignature}</Text>
      </View>
      
      <View style={styles.tempoContainer}>
        <TouchableOpacity 
          style={styles.tempoButton}
          onPress={decreaseTempo}
          onLongPress={() => handleTempoLongPress('decrease')}
          delayLongPress={300}
        >
          <Minus color={colors.text} size={20} />
        </TouchableOpacity>
        
        <Text style={styles.tempoText}>{tempo}</Text>
        
        <TouchableOpacity 
          style={styles.tempoButton}
          onPress={increaseTempo}
          onLongPress={() => handleTempoLongPress('increase')}
          delayLongPress={300}
        >
          <Plus color={colors.text} size={20} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.beatsContainer}>
        {Array.from({ length: timeSignatureBeats }).map((_, index) => (
          <Animated.View 
            key={index}
            style={[
              styles.beatDot,
              count === index + 1 && styles.activeBeatDot,
              count === index + 1 && { transform: [{ scale: pulseAnim }] }
            ]}
          />
        ))}
      </View>
      
      <TouchableOpacity 
        style={styles.playButton}
        onPress={togglePlaying}
      >
        {isPlaying ? (
          <Pause color={colors.text} size={24} />
        ) : (
          <Play color={colors.text} size={24} fill={colors.text} />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  timeSignature: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  tempoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  tempoButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.divider,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tempoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginHorizontal: 20,
    minWidth: 60,
    textAlign: 'center',
  },
  beatsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  beatDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.divider,
    marginHorizontal: 6,
  },
  activeBeatDot: {
    backgroundColor: colors.primary,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});