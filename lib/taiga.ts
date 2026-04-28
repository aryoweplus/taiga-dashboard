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

// ─── API functions ───────────────────────────────────────────

export async function getProjectStats(projectId: string) {
  return taigaGet(`/projects/${projectId}/stats`)
}

export async function getUserStories(projectId: string, milestoneId?: string) {
  const query = milestoneId
    ? `?project=${projectId}&milestone=${milestoneId}`
    : `?project=${projectId}`
  return taigaGet(`/userstories${query}`)
}

export async function getTasks(projectId: string, milestoneId?: string) {
  const query = milestoneId
    ? `?project=${projectId}&milestone=${milestoneId}`
    : `?project=${projectId}`
  return taigaGet(`/tasks${query}`)
}

export async function getMembers(projectId: string) {
  return taigaGet(`/memberships?project=${projectId}`)
}

export async function getMilestones(projectId: string) {
  return taigaGet(`/milestones?project=${projectId}`)
}