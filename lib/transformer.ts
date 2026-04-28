import { TaigaUserStory, TaigaTask, TaigaMember, MemberSummary, SprintSummary } from '@/types/taiga'

export function calcSprintSummary(stories: TaigaUserStory[]): SprintSummary {
  const total = stories.length

  // ✅ Pakai is_closed di root level
  const done = stories.filter(s => s.is_closed === true).length
  const blocked = stories.filter(s => s.is_blocked === true).length
  const inProgress = total - done - blocked

  return {
    total,
    done,
    inProgress: inProgress < 0 ? 0 : inProgress,
    blocked,
    completionPct: total > 0 ? Math.round((done / total) * 100) : 0,
  }
}

export function calcMemberSummary(
  stories: TaigaUserStory[],
  tasks: TaigaTask[],
  members: TaigaMember[]
): MemberSummary[] {
  const summary: Record<number, MemberSummary> = {}

  // Init semua member
  members.forEach(m => {
    summary[m.user] = {
      id: m.user,
      full_name: m.full_name,
      username: m.username,
      role_name: m.role_name,
      done: 0,
      inProgress: 0,
      blocked: 0,
      total: 0,
      pct: 0,
    }
  })

  // Hitung dari user stories — support assigned_users (array) & assigned_to (single)
  stories.forEach(s => {
    // Taiga support multi-assign via assigned_users
    const assignedIds: number[] = (s as any).assigned_users?.length
      ? (s as any).assigned_users
      : s.assigned_to ? [s.assigned_to] : []

    assignedIds.forEach(userId => {
      const member = summary[userId]
      if (!member) return

      member.total++
      if (s.is_blocked) member.blocked++
      else if (s.is_closed) member.done++
      else member.inProgress++
    })
  })

  // Hitung dari tasks
  tasks.forEach(t => {
    if (!t.assigned_to) return
    const member = summary[t.assigned_to]
    if (!member) return

    member.total++
    if (t.is_blocked) member.blocked++
    else if (t.status_extra_info?.is_closed) member.done++
    else member.inProgress++
  })

  // Hitung persentase & filter member yang punya task
  return Object.values(summary)
    .map(m => ({
      ...m,
      pct: m.total > 0 ? Math.round((m.done / m.total) * 100) : 0,
    }))
    .filter(m => m.total > 0) // Hanya tampilkan member yang punya assignment
    .sort((a, b) => b.done - a.done) // Sort by done terbanyak
}