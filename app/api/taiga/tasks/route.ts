import { NextRequest, NextResponse } from 'next/server'
import { getTasks } from '@/lib/taiga'
import { getCached } from '@/lib/cache'

export async function GET(req: NextRequest) {
  try {
    const projectId = req.nextUrl.searchParams.get('projectId')
      || process.env.TAIGA_PROJECT_ID || ''
    const milestoneId = req.nextUrl.searchParams.get('milestoneId') || undefined

    const cacheKey = milestoneId
      ? `tasks:${projectId}:${milestoneId}`
      : `tasks:${projectId}`

    const data = await getCached(
      cacheKey,
      'userstories',
      () => getTasks(projectId, milestoneId)
    )

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}