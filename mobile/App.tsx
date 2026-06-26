import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Alert, ScrollView, Image, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as LocalAuthentication from 'expo-local-authentication';
import { login, register, uploadDocument, getDocuments, askQuestion } from './src/api';

type Screen = 'docs' | 'ask';
type CaptureState = { uri: string } | null;

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>('docs');
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [capture, setCapture] = useState<CaptureState>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('token').then(t => {
      setToken(t);
      setLoading(false);
      if (t) attemptBiometric();
    });
  }, []);

  async function attemptBiometric() {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (hasHardware && enrolled) {
      setLocked(true);
      const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Unlock DocVault' });
      setLocked(!result.success);
    }
  }

  if (loading) return <View style={styles.center}><ActivityIndicator /></View>;
  if (!token) return <AuthScreen onAuth={(t) => { setToken(t); }} />;
  if (locked) return (
    <View style={styles.center}>
      <Text style={styles.lockTitle}>🔒 Locked</Text>
      <TouchableOpacity style={styles.button} onPress={attemptBiometric}><Text style={styles.buttonText}>Unlock</Text></TouchableOpacity>
    </View>
  );

  // Camera preview/confirm screen
  if (capture) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Confirm Document</Text>
        <Image source={{ uri: capture.uri }} style={styles.preview} resizeMode="contain" />
        {uploading ? (
          <View style={styles.uploadingBox}>
            <ActivityIndicator color="#5b21b6" />
            <Text style={styles.uploadingText}>Processing — OCR & AI extraction...</Text>
          </View>
        ) : (
          <View style={styles.confirmRow}>
            <TouchableOpacity style={[styles.button, styles.outlineBtn]} onPress={() => setCapture(null)}>
              <Text style={styles.outlineText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { flex: 1 }]} onPress={confirmUpload}>
              <Text style={styles.buttonText}>Upload</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>DocVault</Text>
        <TouchableOpacity onPress={() => { AsyncStorage.removeItem('token'); setToken(null); }}>
          <Text style={styles.link}>Sign Out</Text>
        </TouchableOpacity>
      </View>
      {screen === 'docs' && <DocsScreen />}
      {screen === 'ask' && <AskScreen />}
      <View style={styles.tabs}>
        <TabButton label="📄 Docs" active={screen === 'docs'} onPress={() => setScreen('docs')} />
        <TabButton label="📷 Scan" active={false} onPress={handleCapture} />
        <TabButton label="💬 Ask" active={screen === 'ask'} onPress={() => setScreen('ask')} />
      </View>
    </View>
  );

  async function handleCapture() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Camera permission needed'); return; }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) setCapture({ uri: result.assets[0].uri });
  }

  async function confirmUpload() {
    if (!capture) return;
    setUploading(true);
    try {
      await uploadDocument(capture.uri, 'scan.jpg');
      Alert.alert('Success', 'Document uploaded and processed');
      setCapture(null);
      setScreen('docs');
    } catch {
      Alert.alert('Error', 'Upload failed');
    } finally {
      setUploading(false);
    }
  }
}

function AuthScreen({ onAuth }: { onAuth: (t: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  async function handleSubmit() {
    try {
      const token = isLogin ? await login(email, password) : await register(email, password);
      onAuth(token);
    } catch (e: any) { Alert.alert('Error', e.message); }
  }

  return (
    <View style={styles.authContainer}>
      <Text style={styles.authTitle}>DocVault</Text>
      <Text style={styles.authSubtitle}>{isLogin ? 'Sign in' : 'Create account'}</Text>
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}><Text style={styles.buttonText}>{isLogin ? 'Sign In' : 'Sign Up'}</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => setIsLogin(!isLogin)}><Text style={styles.link}>{isLogin ? 'Create account' : 'Sign in instead'}</Text></TouchableOpacity>
    </View>
  );
}

function DocsScreen() {
  const [docs, setDocs] = useState<any[]>([]);
  useEffect(() => { getDocuments().then(d => setDocs(d.documents || [])); }, []);
  return (
    <FlatList data={docs} keyExtractor={item => item.id} contentContainerStyle={{ padding: 16 }}
      ListEmptyComponent={<Text style={styles.empty}>No documents yet. Tap Scan to add one.</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <View style={styles.cardMeta}>
            {item.brand && <Text style={styles.badge}>{item.brand}</Text>}
            {item.document_type && <Text style={styles.badge}>{item.document_type}</Text>}
          </View>
        </View>
      )} />
  );
}

function AskScreen() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  async function handleAsk() {
    if (!question.trim()) return;
    setLoading(true);
    const data = await askQuestion(question);
    setAnswer(data.answer);
    setLoading(false);
  }
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <TextInput style={styles.input} placeholder="Ask about your documents..." value={question} onChangeText={setQuestion} />
      <TouchableOpacity style={styles.button} onPress={handleAsk} disabled={loading}><Text style={styles.buttonText}>{loading ? 'Thinking...' : 'Ask'}</Text></TouchableOpacity>
      {answer ? <Text style={styles.answer}>{answer}</Text> : null}
    </ScrollView>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.tab, active && styles.tabActive]} onPress={onPress}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 50 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  lockTitle: { fontSize: 22, fontWeight: '700' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 20, fontWeight: '700', paddingHorizontal: 16, paddingTop: 8 },
  authContainer: { flex: 1, justifyContent: 'center', padding: 32 },
  authTitle: { fontSize: 28, fontWeight: '700', textAlign: 'center' },
  authSubtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 24 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  button: { backgroundColor: '#5b21b6', borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 12 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  outlineBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', flex: 1, marginRight: 10 },
  outlineText: { color: '#333', fontWeight: '600', fontSize: 16 },
  link: { color: '#5b21b6', textAlign: 'center', fontSize: 14 },
  preview: { flex: 1, margin: 16, borderRadius: 12, backgroundColor: '#f5f5f5' },
  confirmRow: { flexDirection: 'row', padding: 16 },
  uploadingBox: { padding: 24, alignItems: 'center', gap: 12 },
  uploadingText: { color: '#666', fontSize: 14 },
  card: { backgroundColor: '#f9f9f9', borderRadius: 10, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
  cardTitle: { fontSize: 15, fontWeight: '600' },
  cardMeta: { flexDirection: 'row', gap: 6, marginTop: 8 },
  badge: { backgroundColor: '#ede9fe', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3, fontSize: 12, color: '#5b21b6' },
  empty: { textAlign: 'center', color: '#999', marginTop: 40 },
  answer: { marginTop: 16, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8, fontSize: 14, lineHeight: 22 },
  tabs: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#eee' },
  tab: { flex: 1, padding: 14, alignItems: 'center' },
  tabActive: { borderTopWidth: 2, borderTopColor: '#5b21b6' },
  tabText: { fontSize: 14, color: '#999' },
  tabTextActive: { color: '#5b21b6', fontWeight: '600' },
});
