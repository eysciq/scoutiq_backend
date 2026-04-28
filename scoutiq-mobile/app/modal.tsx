import React from 'react';
import { StyleSheet, TouchableOpacity, View, Platform, SafeAreaView, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ModalScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <SafeAreaView style={styles.content}>
        {/* ⚽ İkon Bölümü */}
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="soccer-field" size={80} color="#2ecc71" />
        </View>

        {/* 🏷️ Başlık ve Versiyon */}
        <Text style={styles.title}>
          Scout<Text style={{color: '#2ecc71'}}>IQ</Text>
        </Text>
        <Text style={styles.version}>Versiyon 1.0.4 (Beta)</Text>

        <View style={styles.separator} />

        {/* ℹ️ Bilgi Kutusu */}
        <View style={styles.infoBox}>
          <Text style={styles.description}>
            ScoutIQ, geleceğin yıldızlarını keşfetmek ve profesyonel gözlem raporları tutmak için tasarlanmış üst düzey bir mobil platformdur.
          </Text>
          
          <View style={styles.featureRow}>
            <MaterialCommunityIcons name="lightning-bolt" size={20} color="#f1c40f" />
            <Text style={styles.featureText}>Hızlı ve Akıllı Oyuncu Kaydı</Text>
          </View>
          
          <View style={styles.featureRow}>
            <MaterialCommunityIcons name="chart-areaspline" size={20} color="#3498db" />
            <Text style={styles.featureText}>Detaylı Performans Analizi</Text>
          </View>
          
          <View style={styles.featureRow}>
            <MaterialCommunityIcons name="shield-check" size={20} color="#2ecc71" />
            <Text style={styles.featureText}>Profesyonel Portföy Yönetimi</Text>
          </View>
        </View>

        {/* ✍️ Footer ve Krediler */}
        <View style={styles.footerContainer}>
          <Text style={styles.footer}>Developed by Erdem Şen</Text>
          <Text style={styles.credits}>© 2026 ScoutIQ Pro Development</Text>
        </View>

        {/* 🚪 Kapatma Butonu */}
        <TouchableOpacity 
          style={styles.closeButton} 
          activeOpacity={0.8}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="check-all" size={22} color="#000" style={{marginRight: 10}} />
          <Text style={styles.closeButtonText}>Anladım, Devam Et</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  iconContainer: {
    marginBottom: 20,
    padding: 25,
    backgroundColor: '#1e1e1e',
    borderRadius: 60,
    borderWidth: 1,
    borderColor: '#333',
    ...Platform.select({
      ios: {
        shadowColor: '#2ecc71',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
  },
  version: {
    color: '#7f8c8d',
    marginTop: 8,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  separator: {
    marginVertical: 35,
    height: 1,
    width: '50%',
    backgroundColor: '#333',
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#1e1e1e',
    padding: 25,
    borderRadius: 30,
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
    fontWeight: '500',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#252525',
    padding: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  featureText: {
    color: '#fff',
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  footerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  footer: {
    color: '#2ecc71',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  credits: {
    color: '#555',
    fontSize: 10,
    marginTop: 6,
    fontWeight: 'bold',
  },
  closeButton: {
    flexDirection: 'row',
    backgroundColor: '#2ecc71',
    paddingVertical: 18,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  closeButtonText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});