import { NextRequest, NextResponse } from 'next/server'
import { getMembers } from '@/lib/taiga'
import { getCached } from '@/lib/cache'

export async function GET(req: NextRequest) {
  try {
    const projectId = req.nextUrl.searchParams.get('projectId')
      || process.env.TAIGA_PROJECT_ID || ''

    const data = await getCached(
      `members:${projectId}`,
      'members',
      () => getMembers(projectId)
    )

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch members' },
      { status: 500 }
    )
  }
}