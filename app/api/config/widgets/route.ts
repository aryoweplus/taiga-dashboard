import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Default widgets kalau belum ada di DB
const DEFAULT_WIDGETS = [
  { widgetKey: 'summary_cards', visible: true, position: 0, chartType: 'cards' },
  { widgetKey: 'progress_bar',  visible: true, position: 1, chartType: 'bar' },
  { widgetKey: 'status_chart',  visible: true, position: 2, chartType: 'donut' },
  { widgetKey: 'member_chart',  visible: true, position: 3, chartType: 'bar' },
  { widgetKey: 'team_table',    visible: true, position: 4, chartType: 'table' },
  { widgetKey: 'qa_dev_chart',  visible: false, position: 5, chartType: 'bar' },
  { widgetKey: 'trend_chart',   visible: false, position: 6, chartType: 'line' },
]

export async function GET() {
  try {
    let widgets = await prisma.widgetConfig.findMany({
      orderBy: { position: 'asc' }
    })

    // Kalau belum ada, seed default
    if (widgets.length === 0) {
      await prisma.widgetConfig.createMany({ data: DEFAULT_WIDGETS })
      widgets = await prisma.widgetConfig.findMany({
        orderBy: { position: 'asc' }
      })
    }

    return NextResponse.json(widgets)
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
    const { widgetKey, visible, chartType, position } = body

    const updated = await prisma.widgetConfig.upsert({
      where: { widgetKey },
      update: { visible, chartType, position },
      create: { widgetKey, visible, chartType, position },
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}