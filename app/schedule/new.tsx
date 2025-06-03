import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { colors } from '@/constants/colors';

export default function NewScheduleScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'New Event' }} />
      <View style={styles.container}>
        <Text style={styles.text}>New event creation will be implemented here</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
}); 