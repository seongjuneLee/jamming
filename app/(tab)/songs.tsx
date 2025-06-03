import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Filter } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { SongCard } from '@/components/SongCard';
import { Button } from '@/components/Button';
import { AlertInput } from '@/components/AlertInput';
import { useSongStore } from '@/store/songStore';
import { SongStatus } from '@/types';

export default function SongsScreen() {
  const router = useRouter();
  const { songs, addSong, updateSongStatus, updateSongDetails, deleteSong } = useSongStore();
  const [filter, setFilter] = useState<SongStatus | 'all'>('all');
  
  // Alert states
  const [showAddSongAlert, setShowAddSongAlert] = useState(false);
  const [showArtistAlert, setShowArtistAlert] = useState(false);
  const [showBpmAlert, setShowBpmAlert] = useState(false);
  const [showKeyAlert, setShowKeyAlert] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showStatusAlert, setShowStatusAlert] = useState(false);
  
  const [tempSongData, setTempSongData] = useState({
    title: '',
    artist: '',
    bpm: '',
    key: '',
    timeSignature: '4/4',
  });
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  
  const filteredSongs = filter === 'all' 
    ? songs 
    : songs.filter(song => song.status === filter);
  
  const handleAddSong = () => {
    setTempSongData({
      title: '',
      artist: '',
      bpm: '',
      key: '',
      timeSignature: '4/4',
    });
    setShowAddSongAlert(true);
  };
  
  const handleTitleSubmit = (title: string) => {
    if (title.trim()) {
      setTempSongData(prev => ({ ...prev, title }));
      setShowAddSongAlert(false);
      setShowArtistAlert(true);
    }
  };
  
  const handleArtistSubmit = (artist: string) => {
    if (artist.trim()) {
      setTempSongData(prev => ({ ...prev, artist }));
      setShowArtistAlert(false);
      setShowBpmAlert(true);
    }
  };
  
  const handleBpmSubmit = (bpm: string) => {
    const bpmNumber = parseInt(bpm, 10);
    if (!isNaN(bpmNumber) && bpmNumber > 0) {
      setTempSongData(prev => ({ ...prev, bpm }));
      setShowBpmAlert(false);
      setShowKeyAlert(true);
    }
  };
  
  const handleKeySubmit = (key: string) => {
    setTempSongData(prev => ({ ...prev, key }));
    setShowKeyAlert(false);
    
    // Create the song
    const { title, artist, bpm, key: songKey, timeSignature } = tempSongData;
    addSong({
      title,
      artist,
      status: 'to-practice',
      bpm: bpm ? parseInt(bpm, 10) : undefined,
      key: songKey || undefined,
      timeSignature,
    });
  };
  
  const handleSongOptions = (song: typeof songs[0]) => {
    setSelectedSongId(song.id);
    setShowStatusAlert(true);
  };
  
  const handleStatusChange = (status: SongStatus) => {
    if (selectedSongId) {
      updateSongStatus(selectedSongId, status);
      setShowStatusAlert(false);
    }
  };
  
  const handleDeleteConfirm = () => {
    if (selectedSongId) {
      deleteSong(selectedSongId);
      setShowDeleteAlert(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Songs</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddSong}
        >
          <Plus color={colors.text} size={24} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.filterContainer}>
        <View style={styles.filterLabel}>
          <Filter size={16} color={colors.textSecondary} />
          <Text style={styles.filterText}>Filter:</Text>
        </View>
        
        <View style={styles.filterButtons}>
          <Button 
            title="All" 
            variant={filter === 'all' ? 'primary' : 'outline'}
            size="small"
            style={styles.filterButton}
            onPress={() => setFilter('all')}
          />
          <Button 
            title="To Practice" 
            variant={filter === 'to-practice' ? 'primary' : 'outline'}
            size="small"
            style={styles.filterButton}
            onPress={() => setFilter('to-practice')}
          />
          <Button 
            title="In Progress" 
            variant={filter === 'in-progress' ? 'primary' : 'outline'}
            size="small"
            style={styles.filterButton}
            onPress={() => setFilter('in-progress')}
          />
          <Button 
            title="Completed" 
            variant={filter === 'completed' ? 'primary' : 'outline'}
            size="small"
            style={styles.filterButton}
            onPress={() => setFilter('completed')}
          />
        </View>
      </View>
      
      {filteredSongs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No songs found</Text>
          <Button 
            title="Add a Song" 
            onPress={handleAddSong}
            style={styles.emptyButton}
          />
        </View>
      ) : (
        <FlatList
          data={filteredSongs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SongCard 
              song={item} 
              onPress={() => router.push(`/songs/${item.id}`)}
              onOptionsPress={() => handleSongOptions(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
      
      {/* Add Song Title Alert */}
      <AlertInput
        visible={showAddSongAlert}
        title="Add New Song"
        message="Enter song title"
        placeholder="Song title"
        onCancel={() => setShowAddSongAlert(false)}
        onSubmit={handleTitleSubmit}
        submitText="Next"
      />
      
      {/* Artist Alert */}
      <AlertInput
        visible={showArtistAlert}
        title="Artist"
        message="Enter artist name"
        placeholder="Artist name"
        onCancel={() => setShowArtistAlert(false)}
        onSubmit={handleArtistSubmit}
        submitText="Next"
      />
      
      {/* BPM Alert */}
      <AlertInput
        visible={showBpmAlert}
        title="Tempo"
        message="Enter BPM (beats per minute)"
        placeholder="e.g. 120"
        onCancel={() => setShowBpmAlert(false)}
        onSubmit={handleBpmSubmit}
        submitText="Next"
      />
      
      {/* Key Alert */}
      <AlertInput
        visible={showKeyAlert}
        title="Key"
        message="Enter song key (optional)"
        placeholder="e.g. C Major"
        onCancel={() => setShowKeyAlert(false)}
        onSubmit={handleKeySubmit}
        submitText="Add Song"
      />
      
      {/* Status Alert */}
      {selectedSongId && (
        <AlertInput
          visible={showStatusAlert}
          title="Update Status"
          message="Choose a new status or delete"
          placeholder=""
          onCancel={() => setShowStatusAlert(false)}
          onSubmit={() => {}}
          submitText=""
        >
          <View style={styles.statusButtons}>
            <Button 
              title="To Practice" 
              onPress={() => handleStatusChange('to-practice')}
              style={styles.statusButton}
              size="small"
            />
            <Button 
              title="In Progress" 
              onPress={() => handleStatusChange('in-progress')}
              style={styles.statusButton}
              size="small"
            />
            <Button 
              title="Completed" 
              onPress={() => handleStatusChange('completed')}
              style={styles.statusButton}
              size="small"
            />
            <Button 
              title="Delete" 
              variant="outline"
              onPress={() => {
                setShowStatusAlert(false);
                setShowDeleteAlert(true);
              }}
              style={[styles.statusButton, styles.deleteButton]}
              size="small"
            />
          </View>
        </AlertInput>
      )}
      
      {/* Delete Confirmation Alert */}
      <AlertInput
        visible={showDeleteAlert}
        title="Confirm Delete"
        message="Are you sure you want to delete this song? This action cannot be undone."
        onCancel={() => setShowDeleteAlert(false)}
        onSubmit={handleDeleteConfirm}
        submitText="Delete"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filterLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    marginRight: 8,
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  emptyButton: {
    minWidth: 150,
  },
  statusButtons: {
    flexDirection: 'column',
    width: '100%',
    gap: 8,
    marginTop: 8,
  },
  statusButton: {
    width: '100%',
  },
  deleteButton: {
    borderColor: colors.error,
  },
  deleteButtonText: {
    color: colors.error,
  },
});