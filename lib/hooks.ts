import useSWR, { mutate } from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const PROJECT_ID = '2'

export async function syncAndRefresh() {
  await fetch('/api/cron/sync')
  // Invalidate semua SWR cache
  await mutate(() => true, undefined, { revalidate: true })
}

export function useStats() {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/taiga/stats?projectId=${PROJECT_ID}`,
    fetcher,
    { refreshInterval: 5 * 60 * 1000 } // refresh tiap 5 menit
  )
  return { data, error, isLoading, mutate }
}

export function useUserStories() {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/taiga/userstories?projectId=${PROJECT_ID}`,
    fetcher,
    { refreshInterval: 5 * 60 * 1000 }
  )
  return {
    stories: data || [],
    error,
    isLoading,
    mutate
  }
}

export function useTasks() {
  const { data, error, isLoading } = useSWR(
    `/api/taiga/tasks?projectId=${PROJECT_ID}`,
    fetcher
  )
  return { tasks: data || [], error, isLoading }
}

export function useMembers() {
  const { data, error, isLoading } = useSWR(
    `/api/taiga/members?projectId=${PROJECT_ID}`,
    fetcher,
    { refreshInterval: 30 * 60 * 1000 } // refresh tiap 30 menit
  )
  return { members: data || [], error, isLoading }
}

export function useTeamConfig() {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/config/team?projectId=${PROJECT_ID}`,
    fetcher
  )
  return { teamConfig: data || [], error, isLoading, mutate }
}

export function useWidgets() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/config/widgets',
    fetcher
  )
  return { widgets: data || [], error, isLoading, mutate }
}

export function useSnapshots() {
  const { data, error, isLoading } = useSWR(
    `/api/config/snapshots?projectId=${PROJECT_ID}`,
    fetcher
  )
  return { snapshots: data || [], error, isLoading }
}

export function useScoring() {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/taiga/scoring?projectId=${PROJECT_ID}`,
    fetcher,
    { refreshInterval: 5 * 60 * 1000 }
  )
  return {
    scores: data || [],
    error,
    isLoading,
    mutate
  }

  
}