const BASE = '/api/v1'

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {}
  const token = localStorage.getItem('token')
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

export interface Tag {
  id: string
  name: string
  color: string | null
}

export interface Document {
  id: string
  title: string
  brand: string | null
  model: string | null
  document_type: string | null
  category_id: string | null
  raw_text: string | null
  file_size: number | null
  image_url: string | null
  tags?: Tag[]
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

export async function registerUser(email: string, password: string, displayName?: string): Promise<{ message: string }> {
  const res = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, display_name: displayName }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text ? (JSON.parse(text).detail || 'Registration failed') : 'Server unavailable')
  }
  return res.json()
}

export async function loginUser(email: string, password: string): Promise<{ access_token?: string; requires_2fa?: boolean }> {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text ? (JSON.parse(text).detail || 'Login failed') : 'Server unavailable')
  }
  return res.json()
}

export async function verify2FA(email: string, password: string, code: string): Promise<{ access_token: string }> {
  const res = await fetch(`${BASE}/auth/login/2fa`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, code }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text ? (JSON.parse(text).detail || 'Invalid code') : 'Server unavailable')
  }
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

export async function getDocuments(categoryId?: string): Promise<{ documents: Document[]; total: number }> {
  const url = categoryId ? `${BASE}/documents?category_id=${categoryId}` : `${BASE}/documents`
  const res = await fetch(url, { headers: getHeaders() })
  return res.json()
}

export async function getDocument(id: string): Promise<Document> {
  const res = await fetch(`${BASE}/documents/${id}`, { headers: getHeaders() })
  return res.json()
}

export async function deleteDocument(id: string): Promise<void> {
  await fetch(`${BASE}/documents/${id}`, { method: 'DELETE', headers: getHeaders() })
}

export async function bulkDeleteDocuments(documentIds: string[]): Promise<void> {
  await fetch(`${BASE}/documents/bulk/delete`, {
    method: 'POST',
    headers: { ...getHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ document_ids: documentIds }),
  })
}

export async function shareDocument(id: string, expiresHours = 24): Promise<{ share_url: string; expires_in_hours: number }> {
  const res = await fetch(`${BASE}/documents/${id}/share?expires_hours=${expiresHours}`, { headers: getHeaders() })
  return res.json()
}

export async function searchDocuments(q: string): Promise<{ results: SearchResult[] }> {
  const res = await fetch(`${BASE}/search?q=${encodeURIComponent(q)}`, { headers: getHeaders() })
  return res.json()
}

export async function askQuestion(question: string, documentId?: string, history?: { role: string; content: string }[]): Promise<AskResponse> {
  const res = await fetch(`${BASE}/ai/ask`, {
    method: 'POST',
    headers: { ...getHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, document_id: documentId, history: history || [] }),
  })
  return res.json()
}

export async function getCategories(): Promise<{ id: string; name: string }[]> {
  const res = await fetch(`${BASE}/categories`, { headers: getHeaders() })
  return res.json()
}

// === 2FA ===
export async function setup2FA(): Promise<{ secret: string; qr_code: string; uri: string }> {
  const res = await fetch(`${BASE}/auth/2fa/setup`, { method: 'POST', headers: getHeaders() })
  if (!res.ok) throw new Error('Failed to set up 2FA')
  return res.json()
}

export async function disable2FA(): Promise<void> {
  await fetch(`${BASE}/auth/2fa/disable`, { method: 'POST', headers: getHeaders() })
}

// === Warranties ===
export interface Warranty {
  id: string
  document_id: string
  document_title: string
  purchase_date: string | null
  expiry_date: string | null
  notes: string | null
}

export async function getWarranties(): Promise<Warranty[]> {
  const res = await fetch(`${BASE}/warranties`, { headers: getHeaders() })
  return res.json()
}

export async function getExpiringWarranties(days = 30): Promise<{ warranty_id: string; document_title: string; expiry_date: string; days_remaining: number }[]> {
  const res = await fetch(`${BASE}/warranties/expiring?days=${days}`, { headers: getHeaders() })
  return res.json()
}

// === Account ===
export async function deleteAccount(): Promise<void> {
  await fetch(`${BASE}/auth/account`, { method: 'DELETE', headers: getHeaders() })
}

// === Tags ===
export async function getTags(): Promise<Tag[]> {
  const res = await fetch(`${BASE}/tags`, { headers: getHeaders() })
  return res.json()
}

export async function createTag(name: string, color?: string): Promise<Tag> {
  const res = await fetch(`${BASE}/tags`, {
    method: 'POST',
    headers: { ...getHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, color }),
  })
  return res.json()
}

export async function deleteTag(tagId: string): Promise<void> {
  await fetch(`${BASE}/tags/${tagId}`, { method: 'DELETE', headers: getHeaders() })
}

export async function addTagToDocument(documentId: string, tagId: string): Promise<void> {
  await fetch(`${BASE}/tags/documents/${documentId}/tags/${tagId}`, { method: 'PUT', headers: getHeaders() })
}

export async function removeTagFromDocument(documentId: string, tagId: string): Promise<void> {
  await fetch(`${BASE}/tags/documents/${documentId}/tags/${tagId}`, { method: 'DELETE', headers: getHeaders() })
}

// === Version history ===
export interface DocumentVersion {
  id: string
  version_number: number
  created_at: string | null
  preview: string
  char_count: number
}

export async function updateDocumentText(documentId: string, rawText: string): Promise<Document> {
  const res = await fetch(`${BASE}/documents/${documentId}`, {
    method: 'PATCH',
    headers: { ...getHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw_text: rawText }),
  })
  return res.json()
}

export async function getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
  const res = await fetch(`${BASE}/documents/${documentId}/versions`, { headers: getHeaders() })
  return res.json()
}

export async function restoreDocumentVersion(documentId: string, versionId: string): Promise<Document> {
  const res = await fetch(`${BASE}/documents/${documentId}/versions/${versionId}/restore`, { method: 'POST', headers: getHeaders() })
  return res.json()
}
