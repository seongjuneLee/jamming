import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Calendar as CalendarIcon } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { EventCard } from '@/components/EventCard';
import { Button } from '@/components/Button';
import { AlertInput } from '@/components/AlertInput';
import { useScheduleStore } from '@/store/scheduleStore';

export default function ScheduleScreen() {
  const router = useRouter();
  const { events, addEvent, deleteEvent } = useScheduleStore();
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  
  // Alert states
  const [showTitleAlert, setShowTitleAlert] = useState(false);
  const [showLocationAlert, setShowLocationAlert] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showEventDetailsAlert, setShowEventDetailsAlert] = useState(false);
  
  const [tempEventData, setTempEventData] = useState({
    title: '',
    location: '',
  });
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  
  const now = Date.now();
  
  const filteredEvents = events.filter(event => {
    if (filter === 'upcoming') return event.startTime >= now;
    if (filter === 'past') return event.startTime < now;
    return true;
  }).sort((a, b) => {
    if (filter === 'upcoming') return a.startTime - b.startTime;
    return b.startTime - a.startTime;
  });
  
  const handleAddEvent = () => {
    setTempEventData({
      title: '',
      location: '',
    });
    setShowTitleAlert(true);
  };
  
  const handleTitleSubmit = (title: string) => {
    if (title.trim()) {
      setTempEventData(prev => ({ ...prev, title }));
      setShowTitleAlert(false);
      setShowLocationAlert(true);
    }
  };
  
  const handleLocationSubmit = (location: string) => {
    setTempEventData(prev => ({ ...prev, location }));
    setShowLocationAlert(false);
    
    // Create the event
    const { title, location: eventLocation } = tempEventData;
    
    // Get date (simplified for MVP)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(18, 0, 0, 0); // 6 PM
    
    const startTime = tomorrow.getTime();
    const endTime = startTime + (2 * 60 * 60 * 1000); // 2 hours later
    
    addEvent({
      title,
      startTime,
      endTime,
      location: eventLocation.trim() || undefined,
    });
  };
  
  const handleEventPress = (eventId: string) => {
    setSelectedEventId(eventId);
    setShowEventDetailsAlert(true);
  };
  
  const handleDeleteEvent = () => {
    if (selectedEventId) {
      setShowEventDetailsAlert(false);
      setShowDeleteAlert(true);
    }
  };
  
  const handleDeleteConfirm = () => {
    if (selectedEventId) {
      deleteEvent(selectedEventId);
      setShowDeleteAlert(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Schedule</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddEvent}
        >
          <Plus color={colors.text} size={24} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.filterContainer}>
        <Button 
          title="Upcoming" 
          variant={filter === 'upcoming' ? 'primary' : 'outline'}
          size="small"
          style={styles.filterButton}
          onPress={() => setFilter('upcoming')}
        />
        <Button 
          title="Past" 
          variant={filter === 'past' ? 'primary' : 'outline'}
          size="small"
          style={styles.filterButton}
          onPress={() => setFilter('past')}
        />
        <Button 
          title="All" 
          variant={filter === 'all' ? 'primary' : 'outline'}
          size="small"
          style={styles.filterButton}
          onPress={() => setFilter('all')}
        />
      </View>
      
      {filteredEvents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <CalendarIcon size={48} color={colors.textSecondary} style={styles.emptyIcon} />
          <Text style={styles.emptyText}>
            {filter === 'upcoming' 
              ? 'No upcoming events' 
              : filter === 'past' 
                ? 'No past events' 
                : 'No events found'}
          </Text>
          <Button 
            title="Add Event" 
            onPress={handleAddEvent}
            style={styles.emptyButton}
          />
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EventCard 
              event={item} 
              onPress={() => handleEventPress(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
      
      {/* Title Alert */}
      <AlertInput
        visible={showTitleAlert}
        title="New Event"
        message="Enter event title"
        placeholder="Event title"
        onCancel={() => setShowTitleAlert(false)}
        onSubmit={handleTitleSubmit}
        submitText="Next"
      />
      
      {/* Location Alert */}
      <AlertInput
        visible={showLocationAlert}
        title="Location"
        message="Enter event location (optional)"
        placeholder="Location"
        onCancel={() => setShowLocationAlert(false)}
        onSubmit={handleLocationSubmit}
        submitText="Add Event"
      />
      
      {/* Event Details Alert */}
      {selectedEventId && (
        <AlertInput
          visible={showEventDetailsAlert}
          title="Event Details"
          message={events.find(e => e.id === selectedEventId)?.title || ''}
          onCancel={() => setShowEventDetailsAlert(false)}
          onSubmit={() => setShowEventDetailsAlert(false)}
          submitText="Close"
        >
          <View style={styles.eventDetailsContainer}>
            <Text style={styles.eventDetailsText}>
              {events.find(e => e.id === selectedEventId)?.location || 'No location specified'}
            </Text>
            <Text style={styles.eventDetailsText}>
              {new Date(events.find(e => e.id === selectedEventId)?.startTime || 0).toLocaleDateString()}
            </Text>
            <Text style={styles.eventDetailsText}>
              {new Date(events.find(e => e.id === selectedEventId)?.startTime || 0).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
              {new Date(events.find(e => e.id === selectedEventId)?.endTime || 0).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            
            <Button 
              title="Delete Event" 
              variant="outline"
              onPress={handleDeleteEvent}
              style={styles.deleteButton}
            />
          </View>
        </AlertInput>
      )}
      
      {/* Delete Confirmation Alert */}
      <AlertInput
        visible={showDeleteAlert}
        title="Confirm Delete"
        message="Are you sure you want to delete this event? This action cannot be undone."
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
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
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
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyButton: {
    minWidth: 150,
  },
  eventDetailsContainer: {
    width: '100%',
    marginTop: 8,
  },
  eventDetailsText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
  },
  deleteButton: {
    marginTop: 16,
    borderColor: colors.error,
  },
});