import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Link } from 'expo-router';

// 임시 데이터
const DUMMY_SONGS = [
  { id: '1', title: '곡 1', artist: '아티스트 1' },
  { id: '2', title: '곡 2', artist: '아티스트 2' },
  { id: '3', title: '곡 3', artist: '아티스트 3' },
];

export default function SongsList() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>곡 목록</Text>
      <FlatList
        data={DUMMY_SONGS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Link href={`/songs/${item.id}`} asChild>
            <View style={styles.songItem}>
              <Text style={styles.songTitle}>{item.title}</Text>
              <Text style={styles.songArtist}>{item.artist}</Text>
            </View>
          </Link>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  songItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  songTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  songArtist: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
}); 