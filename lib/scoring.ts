import { TaigaUserStory, TaigaMember, StoryScore, MemberScore } from '@/types/taiga'

function daysDiff(dateA: string, dateB: string): number {
  const a = new Date(dateA).setHours(0, 0, 0, 0)
  const b = new Date(dateB).setHours(0, 0, 0, 0)
  return Math.round((b - a) / (1000 * 60 * 60 * 24))
}

export function calcStoryScore(story: TaigaUserStory): StoryScore {
  const base = story.total_points ?? 0
  const dueDate = story.due_date ?? null
  const finishDate = story.finish_date ?? null
  const isClosed = story.is_closed

  // Ambil semua assigned users (support multi-assign)
  const assignedUsers: number[] = (story as any).assigned_users?.length
    ? (story as any).assigned_users
    : story.assigned_to ? [story.assigned_to] : []

  let score: number | null = null
  let daysVariance: number | null = null
  let scoreStatus: StoryScore['scoreStatus'] = 'ongoing'

  if (!dueDate) {
    scoreStatus = 'no_due_date'
  } else if (isClosed && finishDate) {
    // Hitung variance: negatif = terlambat, positif = lebih cepat
    // daysDiff(finish, due): kalau finish < due = positif = early
    daysVariance = daysDiff(finishDate, dueDate)
    score = base + daysVariance

    if (daysVariance > 0) scoreStatus = 'early'
    else if (daysVariance < 0) scoreStatus = 'late'
    else scoreStatus = 'on_time'
  } else if (!isClosed && dueDate) {
    // Cek apakah sudah melewati due date
    const today = new Date().toISOString().split('T')[0]
    daysVariance = daysDiff(today, dueDate) // positif = masih ada waktu
    scoreStatus = 'ongoing'
  }

  return {
    storyId: story.id,
    ref: story.ref,
    subject: story.subject,
    assignedUsers,
    totalPoints: base,
    dueDate,
    finishDate,
    status: story.status_extra_info?.name ?? '',
    isClosed,
    score,
    daysVariance,
    scoreStatus,
  }
}

export function calcMemberScores(
  stories: TaigaUserStory[],
  members: TaigaMember[],
  teamConfig: Array<{ taigaUserId: number; role: string }>
): MemberScore[] {
  // Hitung score per story
  const storyScores = stories.map(calcStoryScore)

  // Init member map
  const memberMap: Record<number, MemberScore> = {}
  members.forEach(m => {
    const config = teamConfig.find(c => c.taigaUserId === m.user)
    memberMap[m.user] = {
      id: m.user,
      full_name: m.full_name,
      username: m.username,
      role_name: config?.role || m.role_name || 'DEV',
      totalScore: 0,
      totalStories: 0,
      doneStories: 0,
      ongoingStories: 0,
      onTimeCount: 0,
      earlyCount: 0,
      lateCount: 0,
      avgVariance: 0,
      stories: [],
    }
  })

  // Assign story scores ke member
  storyScores.forEach(ss => {
    ss.assignedUsers.forEach(userId => {
      const member = memberMap[userId]
      if (!member) return

      member.totalStories++
      member.stories.push(ss)

      if (ss.isClosed) {
        member.doneStories++
        if (ss.score !== null) member.totalScore += ss.score
        if (ss.scoreStatus === 'on_time') member.onTimeCount++
        if (ss.scoreStatus === 'early') member.earlyCount++
        if (ss.scoreStatus === 'late') member.lateCount++
      } else {
        member.ongoingStories++
      }
    })
  })

  // Hitung avg variance
  return Object.values(memberMap)
    .map(m => {
      const closedWithDue = m.stories.filter(
        s => s.isClosed && s.daysVariance !== null
      )
      const avgVariance = closedWithDue.length > 0
        ? Math.round(
            closedWithDue.reduce((sum, s) => sum + (s.daysVariance ?? 0), 0) /
            closedWithDue.length
          )
        : 0

      return { ...m, avgVariance }
    })
    .filter(m => m.totalStories > 0)
    .sort((a, b) => b.totalScore - a.totalScore)
}