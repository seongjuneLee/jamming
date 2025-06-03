import React from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';
import { colors } from '@/constants/colors';

interface Member {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'offline';
  avatar: string;
}

// 임시 멤버 데이터
const DUMMY_MEMBERS: Member[] = [
  {
    id: '1',
    name: '김기타',
    role: '기타',
    status: 'online',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: '2',
    name: '이베이스',
    role: '베이스',
    status: 'offline',
    avatar: 'https://i.pravatar.cc/150?img=2',
  },
  {
    id: '3',
    name: '박드럼',
    role: '드럼',
    status: 'online',
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
];

interface MemberItemProps {
  member: Member;
}

const MemberItem: React.FC<MemberItemProps> = ({ member }) => (
  <View style={styles.memberItem}>
    <Image source={{ uri: member.avatar }} style={styles.avatar} />
    <View style={styles.memberInfo}>
      <Text style={styles.memberName}>{member.name}</Text>
      <Text style={styles.memberRole}>{member.role}</Text>
    </View>
    <View style={[styles.statusIndicator, { backgroundColor: member.status === 'online' ? colors.primary : colors.textSecondary }]} />
  </View>
);

export default function MemberScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={DUMMY_MEMBERS}
        renderItem={({ item }) => <MemberItem member={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContainer: {
    padding: 16,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 8,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  memberRole: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
}); 