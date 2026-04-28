import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const projectId = req.nextUrl.searchParams.get('projectId')
      || process.env.TAIGA_PROJECT_ID || ''

    const members = await prisma.teamMember.findMany({
      where: { projectId },
      orderBy: { fullName: 'asc' }
    })

    return NextResponse.json(members)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { taigaUserId, fullName, username, role, projectId } = body

    const updated = await prisma.teamMember.upsert({
      where: { taigaUserId },
      update: { role, fullName, username },
      create: { taigaUserId, fullName, username, role, projectId },
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}