import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Music, Calendar, Mic, MessageSquare } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Metronome } from '@/components/Metronome';
import { SongCard } from '@/components/SongCard';
import { EventCard } from '@/components/EventCard';
import { useSongStore } from '@/store/songStore';
import { useScheduleStore } from '@/store/scheduleStore';
import { useUserStore } from '@/store/userStore';

export default function HomeScreen() {
  const router = useRouter();
  const { songs } = useSongStore();
  const { events } = useScheduleStore();
  const { currentUser, setCurrentUser } = useUserStore();
  const [selectedSong, setSelectedSong] = useState(songs[0] || null);
  
  // Set a default user if none exists
  useEffect(() => {
    if (!currentUser) {
      setCurrentUser({
        id: 'user-1',
        name: 'Band Member',
      });
    }
  }, [currentUser, setCurrentUser]);
  
  // Get recent songs (last 3)
  const recentSongs = [...songs]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 3);
  
  // Get upcoming events (next 2)
  const now = Date.now();
  const upcomingEvents = [...events]
    .filter(event => event.startTime > now)
    .sort((a, b) => a.startTime - b.startTime)
    .slice(0, 2);
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>
        Hello, {currentUser?.name || 'Band Member'}
      </Text>
      
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.quickActionItem}
          onPress={() => router.push('/songs')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: `${colors.primary}20` }]}>
            <Music color={colors.primary} size={24} />
          </View>
          <Text style={styles.quickActionText}>Songs</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionItem}
          onPress={() => router.push('/record')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: `${colors.secondary}20` }]}>
            <Mic color={colors.secondary} size={24} />
          </View>
          <Text style={styles.quickActionText}>Record</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionItem}
          onPress={() => router.push('/schedule')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: `${colors.accent}20` }]}>
            <Calendar color={colors.accent} size={24} />
          </View>
          <Text style={styles.quickActionText}>Schedule</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionItem}
          onPress={() => router.push('/chat')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: `${colors.primary}20` }]}>
            <MessageSquare color={colors.primary} size={24} />
          </View>
          <Text style={styles.quickActionText}>Chat</Text>
        </TouchableOpacity>
      </View>
      
      {recentSongs.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Songs</Text>
            <TouchableOpacity onPress={() => router.push('/songs')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {recentSongs.map(song => (
            <TouchableOpacity 
              key={song.id}
              onPress={() => setSelectedSong(song)}
              style={[
                styles.songSelectButton,
                selectedSong?.id === song.id && styles.selectedSongButton
              ]}
            >
              <Text 
                style={[
                  styles.songSelectText,
                  selectedSong?.id === song.id && styles.selectedSongText
                ]}
                numberOfLines={1}
              >
                {song.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Metronome</Text>
        <Metronome 
          initialTempo={selectedSong?.bpm}
          initialTimeSignature={selectedSong?.timeSignature}
        />
      </View>
      
      {selectedSong && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selected Song</Text>
          <SongCard 
            song={selectedSong} 
            onPress={() => router.push(`/songs/${selectedSong.id}`)}
          />
        </View>
      )}
      
      {upcomingEvents.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            <TouchableOpacity onPress={() => router.push('/schedule')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {upcomingEvents.map(event => (
            <EventCard 
              key={event.id} 
              event={event} 
              onPress={() => router.push(`/schedule/${event.id}`)}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 24,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quickActionItem: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: colors.text,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
  },
  songSelectButton: {
    backgroundColor: colors.surface,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedSongButton: {
    backgroundColor: colors.primary,
  },
  songSelectText: {
    color: colors.text,
    fontSize: 14,
  },
  selectedSongText: {
    fontWeight: 'bold',
  },
});