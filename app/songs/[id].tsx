import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Play, Pause, Trash2, Edit2, PlusCircle, Music, Hash, Clock } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Button } from '@/components/Button';
import { RecordingItem } from '@/components/RecordingItem';
import { AudioWaveform } from '@/components/AudioWaveform';
import { Metronome } from '@/components/Metronome';
import { SongDetails } from '@/components/SongDetails';
import { AlertInput } from '@/components/AlertInput';
import { useSongStore } from '@/store/songStore';
import { useRecordingStore } from '@/store/recordingStore';

export default function SongDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { songs, updateSongProgress, updateSongAiEvaluation, updateSongDetails } = useSongStore();
  const { recordings, deleteRecording } = useRecordingStore();
  
  const [playingRecording, setPlayingRecording] = useState<string | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  
  // Alert states
  const [showProgressAlert, setShowProgressAlert] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showBpmAlert, setShowBpmAlert] = useState(false);
  const [showKeyAlert, setShowKeyAlert] = useState(false);
  const [showTimeSignatureAlert, setShowTimeSignatureAlert] = useState(false);
  const [showInstrumentsAlert, setShowInstrumentsAlert] = useState(false);
  const [showChordsAlert, setShowChordsAlert] = useState(false);
  
  const [selectedRecordingId, setSelectedRecordingId] = useState<string | null>(null);
  
  const song = songs.find(s => s.id === id);
  const songRecordings = recordings.filter(r => r.songId === id);
  
  if (!song) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Song not found</Text>
        <Button 
          title="Go Back" 
          onPress={() => router.back()}
          style={styles.errorButton}
        />
      </View>
    );
  }
  
  const handlePlayRecording = (recordingId: string) => {
    // In a real app, this would play the actual audio file
    if (playingRecording === recordingId) {
      setPlayingRecording(null);
      setPlaybackProgress(0);
    } else {
      setPlayingRecording(recordingId);
      setPlaybackProgress(0);
      
      // Simulate playback progress
      const interval = setInterval(() => {
        setPlaybackProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setPlayingRecording(null);
            return 0;
          }
          return prev + 1;
        });
      }, 100);
    }
  };
  
  const handleDeleteRecording = (recordingId: string) => {
    setSelectedRecordingId(recordingId);
    setShowDeleteAlert(true);
  };
  
  const handleDeleteConfirm = () => {
    if (selectedRecordingId) {
      deleteRecording(selectedRecordingId);
      setShowDeleteAlert(false);
    }
  };
  
  const handleUpdateProgress = () => {
    setShowProgressAlert(true);
  };
  
  const handleProgressSubmit = (value: string) => {
    const progress = parseInt(value, 10);
    if (!isNaN(progress) && progress >= 0 && progress <= 100) {
      updateSongProgress(song.id, progress);
      setShowProgressAlert(false);
    }
  };
  
  const handleUpdateBpm = () => {
    setShowBpmAlert(true);
  };
  
  const handleBpmSubmit = (value: string) => {
    const bpm = parseInt(value, 10);
    if (!isNaN(bpm) && bpm > 0) {
      updateSongDetails(song.id, { bpm });
      setShowBpmAlert(false);
    }
  };
  
  const handleUpdateKey = () => {
    setShowKeyAlert(true);
  };
  
  const handleKeySubmit = (value: string) => {
    updateSongDetails(song.id, { key: value });
    setShowKeyAlert(false);
  };
  
  const handleUpdateTimeSignature = () => {
    setShowTimeSignatureAlert(true);
  };
  
  const handleTimeSignatureSubmit = (value: string) => {
    // Simple validation for time signature format
    if (/^\d+\/\d+$/.test(value)) {
      updateSongDetails(song.id, { timeSignature: value });
    }
    setShowTimeSignatureAlert(false);
  };
  
  const handleUpdateInstruments = () => {
    setShowInstrumentsAlert(true);
  };
  
  const handleInstrumentsSubmit = (value: string) => {
    const instruments = value.split(',').map(i => i.trim()).filter(Boolean);
    updateSongDetails(song.id, { instruments });
    setShowInstrumentsAlert(false);
  };
  
  const handleUpdateChords = () => {
    setShowChordsAlert(true);
  };
  
  const handleChordsSubmit = (value: string) => {
    const chords = value.split(',').map(c => c.trim()).filter(Boolean);
    updateSongDetails(song.id, { chords });
    setShowChordsAlert(false);
  };
  
  const handleAiEvaluation = () => {
    // In a real app, this would call an AI service
    // For this MVP, we'll simulate an AI response
    const evaluations = [
      "The band is showing good progress. Work on tightening the rhythm section during the chorus.",
      "Great improvement! The vocals and guitar are well synchronized. Consider adding more dynamic contrast.",
      "The song is coming along nicely. Focus on the transitions between verse and chorus for a smoother flow.",
      "Solid performance overall. The bass and drums could be more in sync during the bridge section.",
    ];
    
    const randomEvaluation = evaluations[Math.floor(Math.random() * evaluations.length)];
    updateSongAiEvaluation(song.id, randomEvaluation);
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{song.title}</Text>
        <Text style={styles.artist}>{song.artist}</Text>
        
        <View style={styles.statusContainer}>
          <View 
            style={[
              styles.statusDot, 
              { 
                backgroundColor: 
                  song.status === 'to-practice' 
                    ? colors.warning 
                    : song.status === 'in-progress' 
                      ? colors.primary 
                      : colors.success 
              }
            ]} 
          />
          <Text style={styles.statusText}>
            {song.status === 'to-practice' 
              ? 'To Practice' 
              : song.status === 'in-progress' 
                ? 'In Progress' 
                : 'Completed'}
          </Text>
        </View>
      </View>
      
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.sectionTitle}>Progress</Text>
          <TouchableOpacity onPress={handleUpdateProgress}>
            <Edit2 color={colors.primary} size={18} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.progressBarContainer}>
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
      
      <View style={styles.detailsSection}>
        <View style={styles.detailsHeader}>
          <Text style={styles.sectionTitle}>Song Details</Text>
          <View style={styles.detailsActions}>
            <TouchableOpacity 
              style={styles.detailActionButton}
              onPress={handleUpdateBpm}
            >
              <Clock color={colors.primary} size={18} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.detailActionButton}
              onPress={handleUpdateKey}
            >
              <Music color={colors.primary} size={18} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.detailActionButton}
              onPress={handleUpdateTimeSignature}
            >
              <Hash color={colors.primary} size={18} />
            </TouchableOpacity>
          </View>
        </View>
        
        <SongDetails song={song} />
        
        <View style={styles.instrumentsContainer}>
          <Button 
            title="Edit Instruments" 
            size="small"
            onPress={handleUpdateInstruments}
            style={styles.detailButton}
          />
          <Button 
            title="Edit Chords" 
            size="small"
            onPress={handleUpdateChords}
            style={styles.detailButton}
          />
        </View>
      </View>
      
      {song.aiEvaluation && (
        <View style={styles.evaluationSection}>
          <Text style={styles.sectionTitle}>AI Evaluation</Text>
          <Text style={styles.evaluationText}>{song.aiEvaluation}</Text>
        </View>
      )}
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Metronome</Text>
        <Metronome 
          initialTempo={song.bpm}
          initialTimeSignature={song.timeSignature}
        />
      </View>
      
      <View style={styles.section}>
        <View style={styles.recordingsHeader}>
          <Text style={styles.sectionTitle}>Recordings</Text>
          <View style={styles.recordingsActions}>
            <Button 
              title="AI Evaluate" 
              size="small"
              onPress={handleAiEvaluation}
              style={styles.evaluateButton}
            />
            <TouchableOpacity 
              style={styles.addRecordingButton}
              onPress={() => router.push(`/record/${song.id}`)}
            >
              <PlusCircle color={colors.text} size={20} />
            </TouchableOpacity>
          </View>
        </View>
        
        {songRecordings.length === 0 ? (
          <View style={styles.emptyRecordings}>
            <Text style={styles.emptyText}>No recordings yet</Text>
            <Button 
              title="Record Now" 
              onPress={() => router.push(`/record/${song.id}`)}
              style={styles.recordButton}
            />
          </View>
        ) : (
          <>
            {playingRecording && (
              <View style={styles.playbackContainer}>
                <AudioWaveform progress={playbackProgress} />
              </View>
            )}
            
            {songRecordings.map(recording => (
              <RecordingItem 
                key={recording.id}
                recording={recording}
                isPlaying={playingRecording === recording.id}
                onPlay={() => handlePlayRecording(recording.id)}
                onDelete={() => handleDeleteRecording(recording.id)}
              />
            ))}
          </>
        )}
      </View>
      
      {/* Progress Alert */}
      <AlertInput
        visible={showProgressAlert}
        title="Update Progress"
        message="Enter progress percentage (0-100)"
        placeholder="e.g. 75"
        defaultValue={song.progress.toString()}
        onCancel={() => setShowProgressAlert(false)}
        onSubmit={handleProgressSubmit}
      />
      
      {/* BPM Alert */}
      <AlertInput
        visible={showBpmAlert}
        title="Update BPM"
        message="Enter beats per minute"
        placeholder="e.g. 120"
        defaultValue={song.bpm?.toString() || ''}
        onCancel={() => setShowBpmAlert(false)}
        onSubmit={handleBpmSubmit}
      />
      
      {/* Key Alert */}
      <AlertInput
        visible={showKeyAlert}
        title="Update Key"
        message="Enter song key"
        placeholder="e.g. C Major"
        defaultValue={song.key || ''}
        onCancel={() => setShowKeyAlert(false)}
        onSubmit={handleKeySubmit}
      />
      
      {/* Time Signature Alert */}
      <AlertInput
        visible={showTimeSignatureAlert}
        title="Update Time Signature"
        message="Enter time signature (e.g. 4/4, 3/4)"
        placeholder="e.g. 4/4"
        defaultValue={song.timeSignature || '4/4'}
        onCancel={() => setShowTimeSignatureAlert(false)}
        onSubmit={handleTimeSignatureSubmit}
      />
      
      {/* Instruments Alert */}
      <AlertInput
        visible={showInstrumentsAlert}
        title="Update Instruments"
        message="Enter instruments (comma separated)"
        placeholder="e.g. Guitar, Bass, Drums, Vocals"
        defaultValue={song.instruments?.join(', ') || ''}
        onCancel={() => setShowInstrumentsAlert(false)}
        onSubmit={handleInstrumentsSubmit}
      />
      
      {/* Chords Alert */}
      <AlertInput
        visible={showChordsAlert}
        title="Update Chords"
        message="Enter chords (comma separated)"
        placeholder="e.g. C, G, Am, F"
        defaultValue={song.chords?.join(', ') || ''}
        onCancel={() => setShowChordsAlert(false)}
        onSubmit={handleChordsSubmit}
      />
      
      {/* Delete Recording Alert */}
      <AlertInput
        visible={showDeleteAlert}
        title="Confirm Delete"
        message="Are you sure you want to delete this recording? This action cannot be undone."
        onCancel={() => setShowDeleteAlert(false)}
        onSubmit={handleDeleteConfirm}
        submitText="Delete"
      />
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
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  artist: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  progressSection: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.divider,
    borderRadius: 4,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    width: 50,
    textAlign: 'right',
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailsActions: {
    flexDirection: 'row',
  },
  detailActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  instrumentsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  detailButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  evaluationSection: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  evaluationText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  recordingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recordingsActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  evaluateButton: {
    marginRight: 8,
  },
  addRecordingButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyRecordings: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  recordButton: {
    minWidth: 150,
  },
  playbackContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    color: colors.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  errorButton: {
    minWidth: 150,
  },
});