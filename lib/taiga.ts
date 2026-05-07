import axios from 'axios'

const BASE_URL = process.env.TAIGA_BASE_URL || 'https://api.taiga.io/api/v1'

// Cache token in memory (server-side only)
let cachedToken: string | null = null
let tokenExpiry: number = 0

export async function getTaigaToken(): Promise<string> {
  const now = Date.now()

  // Reuse token if still valid (55 min window)
  if (cachedToken && now < tokenExpiry) {
    return cachedToken
  }

  const res = await axios.post(`${BASE_URL}/auth`, {
    type: 'normal',
    username: process.env.TAIGA_USERNAME,
    password: process.env.TAIGA_PASSWORD,
  })

  cachedToken = res.data.auth_token
  tokenExpiry = now + 55 * 60 * 1000 // 55 minutes
  return cachedToken!
}

export async function taigaGet<T>(endpoint: string): Promise<T> {
  const token = await getTaigaToken()

  const res = await axios.get(`${BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  return res.data
}

// Helper untuk fetch semua pages
async function taigaGetAll<T>(endpoint: string): Promise<T[]> {
  const token = await getTaigaToken()
  let results: T[] = []
  let page = 1
  const pageSize = 100

  while (true) {
    const separator = endpoint.includes('?') ? '&' : '?'
    const url = `${BASE_URL}${endpoint}${separator}page=${page}&page_size=${pageSize}`

    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    const data: T[] = res.data
    if (!Array.isArray(data) || data.length === 0) break

    results = [...results, ...data]
    console.log(`[Taiga] Fetched page ${page} — ${data.length} items (total so far: ${results.length})`)

    // Cek header x-pagination-count kalau ada
    const totalCount = res.headers['x-pagination-count']
    if (totalCount && results.length >= parseInt(totalCount)) break

    // Kalau dapat kurang dari pageSize berarti sudah halaman terakhir
    if (data.length < pageSize) break

    page++
  }

  console.log(`[Taiga] Total fetched: ${results.length} items from ${endpoint}`)
  return results
}
// ─── API functions ───────────────────────────────────────────

export async function getProjectStats(projectId: string) {
  return taigaGet(`/projects/${projectId}/stats`)
}

export async function getUserStories(projectId: string, milestoneId?: string) {
  const query = milestoneId
    ? `?project=${projectId}&milestone=${milestoneId}`
    : `?project=${projectId}`

  // ✅ Fetch semua pages, tanpa filter archived
  return taigaGetAll(`/userstories${query}`)
}

export async function getTasks(projectId: string, milestoneId?: string) {
  const query = milestoneId
    ? `?project=${projectId}&milestone=${milestoneId}`
    : `?project=${projectId}`

  return taigaGetAll(`/tasks${query}`)
}

export async function getMembers(projectId: string) {
  return taigaGetAll(`/memberships?project=${projectId}`)
}

export async function getMilestones(projectId: string) {
  return taigaGetAll(`/milestones?project=${projectId}`)
}