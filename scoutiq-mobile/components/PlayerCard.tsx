import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TEAM_COLORS } from '../constants';

interface PlayerCardProps {
  item: any;
  onPress: () => void;
}

export const PlayerCard = ({ item, onPress }: PlayerCardProps) => {
  const colors = TEAM_COLORS[item.team?.toLowerCase().trim()] || { primary: '#2c2c2c', text: '#95a5a6' };
  const ratingNum = parseInt(item.rating) || 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardMain}>
        <View style={[styles.ratingBox, { backgroundColor: ratingNum >= 80 ? '#f1c40f' : '#2ecc71' }]}>
          <Text style={styles.ratingText}>{item.rating || '-'}</Text>
        </View>
        
        <View style={{ flex: 1, marginLeft: 15 }}>
          <Text style={styles.pName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.pSub}>{item.position} • {item.team || 'Serbest'}</Text>
        </View>

        <View style={[styles.tBadge, { backgroundColor: colors.primary }]}>
          <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 10 }}>
            {item.team?.substring(0, 3).toUpperCase() || 'GLB'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#1e1e1e', borderRadius: 15, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: '#333' },
  cardMain: { flexDirection: 'row', alignItems: 'center' },
  ratingBox: { width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  ratingText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  pName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  pSub: { color: '#7f8c8d', fontSize: 12, marginTop: 2 },
  tBadge: { padding: 5, borderRadius: 5, minWidth: 40, alignItems: 'center' }
});