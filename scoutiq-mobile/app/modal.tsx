import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ModalScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name="soccer-field" size={80} color="#2ecc71" />
      </View>

      <ThemedText type="title" style={styles.title}>
        Scout<ThemedText style={{color: '#2ecc71'}} type="title">IQ</ThemedText>
      </ThemedText>
      <ThemedText style={styles.version}>Versiyon 1.0.4 (Beta)</ThemedText>

      <View style={styles.separator} />

      <View style={styles.infoBox}>
        <ThemedText style={styles.description}>
          ScoutIQ, geleceğin yıldızlarını keşfetmek ve profesyonel gözlem raporları tutmak için tasarlanmış üst düzey bir mobil platformdur.
        </ThemedText>
        
        <View style={styles.featureRow}>
          <MaterialCommunityIcons name="lightning-bolt" size={20} color="#f1c40f" />
          <ThemedText style={styles.featureText}>Hızlı ve Akıllı Oyuncu Kaydı</ThemedText>
        </View>
        <View style={styles.featureRow}>
          <MaterialCommunityIcons name="chart-areaspline" size={20} color="#3498db" />
          <ThemedText style={styles.featureText}>Detaylı Performans Analizi</ThemedText>
        </View>
        <View style={styles.featureRow}>
          <MaterialCommunityIcons name="shield-check" size={20} color="#2ecc71" />
          <ThemedText style={styles.featureText}>Profesyonel Portföy Yönetimi</ThemedText>
        </View>
      </View>

      <View style={styles.footerContainer}>
        <ThemedText style={styles.footer}>Developed by Erdem Şen</ThemedText>
        <ThemedText style={styles.credits}>© 2026 ScoutIQ Pro Development</ThemedText>
      </View>

      <TouchableOpacity 
        style={styles.closeButton} 
        activeOpacity={0.8}
        onPress={() => router.back()}
      >
        <MaterialCommunityIcons name="check-all" size={20} color="#000" style={{marginRight: 8}} />
        <ThemedText style={styles.closeButtonText}>Anladım, Devam Et</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#121212', // Temayı index.tsx ile eşitledim
  },
  iconContainer: {
    marginBottom: 20,
    padding: 25,
    backgroundColor: '#1e1e1e',
    borderRadius: 60,
    borderWidth: 1,
    borderColor: '#333',
    elevation: 10,
    shadowColor: '#2ecc71',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  version: {
    color: '#7f8c8d',
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '60%',
    backgroundColor: '#333',
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#1e1e1e',
    padding: 25,
    borderRadius: 25,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#333',
  },
  description: {
    color: '#bdc3c7',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 15,
    marginBottom: 25,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#252525',
    padding: 12,
    borderRadius: 15,
  },
  featureText: {
    color: '#fff',
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  footerContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  footer: {
    color: '#2ecc71',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  credits: {
    color: '#555',
    fontSize: 10,
    marginTop: 4,
  },
  closeButton: {
    flexDirection: 'row',
    backgroundColor: '#2ecc71',
    paddingVertical: 18,
    paddingHorizontal: 50,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    elevation: 5,
  },
  closeButtonText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 16,
    textTransform: 'uppercase',
  },
});