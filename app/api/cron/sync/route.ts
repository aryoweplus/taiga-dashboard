import { NextRequest, NextResponse } from 'next/server'
import { getUserStories, getTasks, getMembers, getMilestones } from '@/lib/taiga'
import { invalidateCache } from '@/lib/cache'
import { prisma } from '@/lib/prisma'
import { calcSprintSummary } from '@/lib/transformer'
import { TaigaUserStory, TaigaTask, TaigaMember, TaigaMilestone } from '@/types/taiga'

const PROJECT_ID = process.env.TAIGA_PROJECT_ID || '2'

function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization')
  return authHeader === `Bearer ${process.env.CRON_SECRET}`
}

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === 'production' && !isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startTime = Date.now()
  const results: Record<string, any> = {}

  try {
    console.log(`[Cron] Starting sync for project ${PROJECT_ID}...`)

    // 1. Ambil semua milestone
    const milestones = await getMilestones(PROJECT_ID) as TaigaMilestone[]
    console.log(`[Cron] Found ${milestones?.length ?? 0} milestones`)

    // 2. Cari milestone aktif — fallback ke yang paling terakhir
    const activeMilestone =
      milestones?.find(m => !(m as any).closed) ||
      milestones?.[milestones.length - 1] ||
      null

    // 3. Ambil data parallel — dengan atau tanpa milestone
    const milestoneId = activeMilestone ? String(activeMilestone.id) : undefined

    const [stories, tasks, members] = await Promise.all([
      getUserStories(PROJECT_ID, milestoneId) as Promise<TaigaUserStory[]>,
      getTasks(PROJECT_ID, milestoneId) as Promise<TaigaTask[]>,
      getMembers(PROJECT_ID) as Promise<TaigaMember[]>,
    ])

    results.storiesCount = stories.length
    results.tasksCount = tasks.length
    results.membersCount = members.length
    results.milestone = activeMilestone?.name ?? 'All Stories'

    console.log(`[Cron] Sprint: ${results.milestone}`)
    console.log(`[Cron] Stories: ${stories.length}, Tasks: ${tasks.length}, Members: ${members.length}`)

    // 4. Hitung summary
    const summary = calcSprintSummary(stories)
    results.summary = summary

    // 5. Simpan snapshot ke DB
    const snapshot = await prisma.sprintSnapshot.create({
      data: {
        projectId: PROJECT_ID,
        sprintId: activeMilestone?.id ?? 0,
        sprintName: activeMilestone?.name ?? 'All Stories',
        doneCount: summary.done,
        inProgress: summary.inProgress,
        blockedCount: summary.blocked,
        totalCount: summary.total,
      },
    })

    results.snapshotId = snapshot.id
    console.log(`[Cron] Snapshot saved — ID: ${snapshot.id}`)

    // 6. Invalidate Redis cache
    await Promise.all([
      invalidateCache(`stats:${PROJECT_ID}`),
      invalidateCache(`userstories:${PROJECT_ID}`),
      invalidateCache(`milestones:${PROJECT_ID}`),
      milestoneId ? invalidateCache(`userstories:${PROJECT_ID}:${milestoneId}`) : Promise.resolve(),
    ])

    console.log(`[Cron] Cache invalidated`)

    const duration = Date.now() - startTime
    results.duration = `${duration}ms`

    console.log(`[Cron] Sync completed in ${duration}ms`)

    return NextResponse.json({
      success: true,
      syncedAt: new Date().toISOString(),
      ...results,
    })

  } catch (error: any) {
    console.error('[Cron] Sync failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Sync failed',
        results,
      },
      { status: 500 }
    )
  }
}