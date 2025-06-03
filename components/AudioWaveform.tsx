import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

interface AudioWaveformProps {
  waveformData?: number[];
  progress?: number;
  height?: number;
  barWidth?: number;
  barGap?: number;
  activeColor?: string;
  inactiveColor?: string;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  waveformData = [],
  progress = 0,
  height = 60,
  barWidth = 3,
  barGap = 2,
  activeColor = colors.primary,
  inactiveColor = colors.divider,
}) => {
  // If no waveform data is provided, generate random data
  const data = waveformData.length > 0 
    ? waveformData 
    : Array.from({ length: 50 }, () => Math.random());
  
  const progressIndex = Math.floor(data.length * (progress / 100));
  
  return (
    <View style={[styles.container, { height }]}>
      {data.map((value, index) => {
        const barHeight = Math.max(4, value * height);
        const isActive = index <= progressIndex;
        
        return (
          <View
            key={index}
            style={[
              styles.bar,
              {
                height: barHeight,
                width: barWidth,
                marginHorizontal: barGap / 2,
                backgroundColor: isActive ? activeColor : inactiveColor,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bar: {
    borderRadius: 1,
  },
});