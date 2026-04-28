import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface StatBoxProps {
  label: string;
  value: string | number;
  icon: any;
  color?: string;
}

export const StatBox = ({ label, value, icon, color = '#2ecc71' }: StatBoxProps) => {
  return (
    <View style={styles.box}>
      <MaterialCommunityIcons name={icon} size={20} color={color} />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  box: { flex: 1, backgroundColor: '#1e1e1e', borderRadius: 12, padding: 15, alignItems: 'center', marginHorizontal: 5, borderWidth: 1, borderColor: '#333' },
  value: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 8 },
  label: { color: '#7f8c8d', fontSize: 10, marginTop: 2, textTransform: 'uppercase', letterSpacing: 1 }
});