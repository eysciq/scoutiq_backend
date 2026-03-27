import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Image, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🚨 GÜNCEL IP ADRESİN
const BACKEND_URL = 'http://192.168.1.181:3001';

export default function AuthScreen() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true); // True = Giriş Yap, False = Kayıt Ol
  const [loading, setLoading] = useState(false);

  // Form Verileri
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 🚀 KAYIT OL (REGISTER) İŞLEMİ
  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.toLowerCase().trim(), password })
      });
      const data = await response.json();
      
      if (response.ok) {
        Alert.alert("Aramıza Hoş Geldin!", "Hesabın oluşturuldu, şimdi giriş yapabilirsin.");
        setIsLogin(true); // Başarılı kayıttan sonra Giriş ekranına yönlendir
      } else {
        Alert.alert("Kayıt Başarısız", data.error || "Bir sorun oluştu.");
      }
    } catch (error) {
      Alert.alert("Bağlantı Hatası", "Sunucuya ulaşılamadı. IP adresini kontrol et.");
    } finally {
      setLoading(false);
    }
  };

  // 🔑 GİRİŞ YAP (LOGIN) İŞLEMİ
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Hata", "E-posta ve şifre zorunludur.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), password })
      });
      const data = await response.json();

      if (response.ok) {
        // Giriş başarılıysa e-postayı telefona kaydet ve ana uygulamaya (tabs) geç!
        await AsyncStorage.setItem('userEmail', email.toLowerCase().trim());
        router.replace('/(tabs)'); 
      } else {
        Alert.alert("Giriş Başarısız", data.error || "Şifre veya e-posta hatalı.");
      }
    } catch (error) {
      Alert.alert("Bağlantı Hatası", "Sunucuya ulaşılamadı. IP adresini kontrol et.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        
        {/* LOGO VE BAŞLIK */}
        <View style={styles.logoContainer}>
          <MaterialCommunityIcons name="shield-star" size={80} color="#2ecc71" />
          <Text style={styles.appName}>SCOUT<Text style={{color: '#2ecc71'}}>IQ</Text></Text>
          <Text style={styles.subtitle}>Yeni Nesil Yetenek Avcısı</Text>
        </View>

        {/* FORM ALANI */}
        <View style={styles.formContainer}>
          <View style={styles.tabContainer}>
            <TouchableOpacity style={[styles.tabBtn, isLogin && styles.tabBtnActive]} onPress={() => setIsLogin(true)}>
              <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>Giriş Yap</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tabBtn, !isLogin && styles.tabBtnActive]} onPress={() => setIsLogin(false)}>
              <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>Kayıt Ol</Text>
            </TouchableOpacity>
          </View>

          {!isLogin && (
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="account-outline" size={20} color="#95a5a6" style={styles.icon} />
              <TextInput style={styles.input} placeholder="Ad Soyad" placeholderTextColor="#7f8c8d" value={name} onChangeText={setName} />
            </View>
          )}

          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="email-outline" size={20} color="#95a5a6" style={styles.icon} />
            <TextInput style={styles.input} placeholder="E-posta Adresi" placeholderTextColor="#7f8c8d" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </View>

          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="lock-outline" size={20} color="#95a5a6" style={styles.icon} />
            <TextInput style={styles.input} placeholder="Şifre" placeholderTextColor="#7f8c8d" value={password} onChangeText={setPassword} secureTextEntry />
          </View>

          <TouchableOpacity style={styles.mainBtn} onPress={isLogin ? handleLogin : handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#000" /> : (
              <Text style={styles.mainBtnText}>{isLogin ? 'Sisteme Gir' : 'Hesap Oluştur'}</Text>
            )}
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  keyboardView: { flex: 1, justifyContent: 'center', padding: 20 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  appName: { fontSize: 40, fontWeight: '900', color: '#fff', marginTop: 10, letterSpacing: 2 },
  subtitle: { color: '#95a5a6', fontSize: 14, marginTop: 5, letterSpacing: 1 },
  formContainer: { backgroundColor: '#1e1e1e', padding: 25, borderRadius: 30, elevation: 10, borderWidth: 1, borderColor: '#333' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#2c2c2c', borderRadius: 15, padding: 5, marginBottom: 25 },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  tabBtnActive: { backgroundColor: '#2ecc71' },
  tabText: { color: '#95a5a6', fontWeight: 'bold', fontSize: 15 },
  tabTextActive: { color: '#000' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2c2c2c', borderRadius: 15, paddingHorizontal: 15, height: 55, marginBottom: 15, borderWidth: 1, borderColor: '#444' },
  icon: { marginRight: 10 },
  input: { flex: 1, color: '#fff', fontSize: 16 },
  mainBtn: { backgroundColor: '#2ecc71', height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  mainBtnText: { color: '#000', fontSize: 18, fontWeight: 'bold' }
});