import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const projectId = req.nextUrl.searchParams.get('projectId')
      || process.env.TAIGA_PROJECT_ID || ''

    // Ambil snapshot 6 sprint terakhir untuk trend chart
    const snapshots = await prisma.sprintSnapshot.findMany({
      where: { projectId },
      orderBy: { takenAt: 'desc' },
      distinct: ['sprintId'],
      take: 6,
    })

    return NextResponse.json(snapshots.reverse())
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const snapshot = await prisma.sprintSnapshot.create({
      data: {
        projectId: body.projectId,
        sprintId: body.sprintId,
        sprintName: body.sprintName,
        doneCount: body.doneCount,
        inProgress: body.inProgress,
        blockedCount: body.blockedCount,
        totalCount: body.totalCount,
      }
    })

    return NextResponse.json(snapshot)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}