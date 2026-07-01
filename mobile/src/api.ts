import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './config';

async function getHeaders(): Promise<Record<string, string>> {
  const token = await AsyncStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function login(email: string, password: string): Promise<string> {
  const res = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Invalid credentials');
  const data = await res.json();
  await AsyncStorage.setItem('token', data.access_token);
  return data.access_token;
}

export async function register(email: string, password: string): Promise<string> {
  const res = await fetch(`${API_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Registration failed');
  const data = await res.json();
  await AsyncStorage.setItem('token', data.access_token);
  return data.access_token;
}

export async function uploadDocument(uri: string, filename: string): Promise<any> {
  const headers = await getHeaders();
  const form = new FormData();
  form.append('file', { uri, name: filename, type: 'image/jpeg' } as any);
  const res = await fetch(`${API_URL}/api/v1/documents`, {
    method: 'POST',
    headers,
    body: form,
  });
  return res.json();
}

export async function getDocuments(): Promise<any> {
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/api/v1/documents`, { headers });
  return res.json();
}

export async function askQuestion(question: string): Promise<any> {
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/api/v1/ai/ask`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  return res.json();
}

export async function registerPushToken(token: string, platform: string): Promise<void> {
  const headers = await getHeaders();
  await fetch(`${API_URL}/api/v1/notifications/register`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, platform }),
  });
}
