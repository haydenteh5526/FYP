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

export async function getDocument(id: string): Promise<any> {
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/api/v1/documents/${id}`, { headers });
  return res.json();
}

export async function searchDocuments(query: string): Promise<any> {
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/api/v1/search?q=${encodeURIComponent(query)}`, { headers });
  return res.json();
}

export async function askQuestion(question: string, documentId?: string): Promise<any> {
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/api/v1/ai/ask`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, document_id: documentId || null }),
  });
  return res.json();
}

// Conversations
export async function listConversations(): Promise<any[]> {
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/api/v1/conversations`, { headers });
  return res.json();
}

export async function createConversation(title?: string): Promise<any> {
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/api/v1/conversations`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  return res.json();
}

export async function getConversation(id: string): Promise<any> {
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/api/v1/conversations/${id}`, { headers });
  return res.json();
}

export async function sendMessage(conversationId: string, question: string, documentId?: string): Promise<any> {
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/api/v1/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, document_id: documentId || null }),
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
