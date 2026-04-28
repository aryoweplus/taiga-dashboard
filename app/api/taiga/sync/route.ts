import { NextRequest, NextResponse } from 'next/server'
import { invalidateCache } from '@/lib/cache'

export async function POST(req: NextRequest) {
  try {
    const projectId = req.nextUrl.searchParams.get('projectId')
      || process.env.TAIGA_PROJECT_ID || ''

    // Hapus semua cache untuk project ini
    await invalidateCache(`stats:${projectId}`)
    await invalidateCache(`members:${projectId}`)
    await invalidateCache(`milestones:${projectId}`)
    await invalidateCache(`userstories:${projectId}*`)

    return NextResponse.json({
      success: true,
      message: 'Cache cleared — next request will fetch fresh data'
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to sync' },
      { status: 500 }
    )
  }
}