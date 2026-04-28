import { NextRequest, NextResponse } from 'next/server'
import { getUserStories, getMembers } from '@/lib/taiga'
import { getCached } from '@/lib/cache'
import { prisma } from '@/lib/prisma'
import { calcMemberScores } from '@/lib/scoring'
import { TaigaUserStory, TaigaMember } from '@/types/taiga'

export async function GET(req: NextRequest) {
  try {
    const projectId = req.nextUrl.searchParams.get('projectId')
      || process.env.TAIGA_PROJECT_ID || ''

    const [stories, members] = await Promise.all([
      getCached(
        `userstories:${projectId}`,
        'userstories',
        () => getUserStories(projectId)
      ) as Promise<TaigaUserStory[]>,
      getCached(
        `members:${projectId}`,
        'members',
        () => getMembers(projectId)
      ) as Promise<TaigaMember[]>,
    ])

    // Ambil team config dari DB
    const teamConfig = await prisma.teamMember.findMany({
      where: { projectId },
      select: { taigaUserId: true, role: true },
    })

    const scores = calcMemberScores(stories, members, teamConfig)

    return NextResponse.json(scores)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to calculate scores' },
      { status: 500 }
    )
  }
}