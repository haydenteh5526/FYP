const BASE = '/api/v1'

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {}
  const token = localStorage.getItem('token')
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

export interface Document {
  id: string
  title: string
  brand: string | null
  model: string | null
  document_type: string | null
  raw_text: string | null
  file_size: number | null
  image_url: string | null
  created_at: string
}

export interface SearchResult {
  chunk_text: string
  document_id: string
  document_title: string
  similarity: number
}

export interface AskResponse {
  answer: string
  sources: { document_id: string; document_title: string; chunk_text: string; similarity: number }[]
}

export async function registerUser(email: string, password: string, displayName?: string): Promise<{ access_token: string }> {
  const res = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, display_name: displayName }),
  })
  if (!res.ok) throw new Error((await res.json()).detail || 'Registration failed')
  return res.json()
}

export async function loginUser(email: string, password: string): Promise<{ access_token: string }> {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error((await res.json()).detail || 'Login failed')
  return res.json()
}

export async function uploadDocument(file: File, title?: string): Promise<Document> {
  const form = new FormData()
  form.append('file', file)
  if (title) form.append('title', title)
  const res = await fetch(`${BASE}/documents`, { method: 'POST', headers: getHeaders(), body: form })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function getDocuments(): Promise<{ documents: Document[]; total: number }> {
  const res = await fetch(`${BASE}/documents`, { headers: getHeaders() })
  return res.json()
}

export async function getDocument(id: string): Promise<Document> {
  const res = await fetch(`${BASE}/documents/${id}`, { headers: getHeaders() })
  return res.json()
}

export async function deleteDocument(id: string): Promise<void> {
  await fetch(`${BASE}/documents/${id}`, { method: 'DELETE', headers: getHeaders() })
}

export async function searchDocuments(q: string): Promise<{ results: SearchResult[] }> {
  const res = await fetch(`${BASE}/search?q=${encodeURIComponent(q)}`, { headers: getHeaders() })
  return res.json()
}

export async function askQuestion(question: string): Promise<AskResponse> {
  const res = await fetch(`${BASE}/ai/ask`, {
    method: 'POST',
    headers: { ...getHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  })
  return res.json()
}
