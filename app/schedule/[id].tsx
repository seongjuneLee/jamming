import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { colors } from '@/constants/colors';
import { useScheduleStore } from '@/store/scheduleStore';

export default function ScheduleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { events } = useScheduleStore();
  const event = events.find(e => e.id === id);

  if (!event) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Event not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: event.title }} />
      <View style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.label}>Date & Time</Text>
          <Text style={styles.value}>
            {new Date(event.startTime).toLocaleDateString()}
          </Text>
          <Text style={styles.value}>
            {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
            {new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        {event.location && (
          <View style={styles.section}>
            <Text style={styles.label}>Location</Text>
            <Text style={styles.value}>{event.location}</Text>
          </View>
        )}

        {event.description && (
          <View style={styles.section}>
            <Text style={styles.label}>Description</Text>
            <Text style={styles.value}>{event.description}</Text>
          </View>
        )}
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
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  text: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
}); 