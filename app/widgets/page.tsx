'use client'

import { useState, useEffect } from 'react'
import { Save, Eye, EyeOff } from 'lucide-react'
import { useWidgets } from '@/lib/hooks'

interface Widget {
  id: number
  widgetKey: string
  visible: boolean
  position: number
  chartType: string
}

const WIDGET_LABELS: Record<string, { label: string; desc: string }> = {
  summary_cards: {
    label: 'Summary cards',
    desc: 'Total, Done, In Progress, Blocked counts',
  },
  progress_bar: {
    label: 'Sprint progress bar',
    desc: 'Overall completion percentage',
  },
  status_chart: {
    label: 'Status donut chart',
    desc: 'Visual breakdown of story statuses',
  },
  member_chart: {
    label: 'Per-member bar chart',
    desc: 'Done vs In Progress grouped by member',
  },
  team_table: {
    label: 'Team summary table',
    desc: 'Detailed table with role and progress',
  },
  qa_dev_chart: {
    label: 'QA vs DEV chart',
    desc: 'Aggregate role-level performance',
  },
  trend_chart: {
    label: 'Sprint trend chart',
    desc: 'Done tasks over previous sprints',
  },
}

const CHART_TYPES: Record<string, string[]> = {
  status_chart: ['donut', 'pie', 'bar'],
  member_chart: ['bar', 'horizontalBar'],
  qa_dev_chart: ['bar', 'pie'],
  trend_chart:  ['line', 'bar', 'area'],
}

export default function WidgetsPage() {
  const { widgets: initial, mutate } = useWidgets()
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (initial.length > 0) setWidgets(initial)
  }, [initial])

  function toggleVisible(widgetKey: string) {
    setWidgets(prev =>
      prev.map(w => w.widgetKey === widgetKey ? { ...w, visible: !w.visible } : w)
    )
  }

  function setChartType(widgetKey: string, chartType: string) {
    setWidgets(prev =>
      prev.map(w => w.widgetKey === widgetKey ? { ...w, chartType } : w)
    )
  }

  async function saveAll() {
    setSaving(true)
    try {
      await Promise.all(
        widgets.map(w =>
          fetch('/api/config/widgets', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              widgetKey: w.widgetKey,
              visible: w.visible,
              chartType: w.chartType,
              position: w.position,
            }),
          })
        )
      )
      mutate()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      console.error('Failed to save widgets', e)
    } finally {
      setSaving(false)
    }
  }

  const visibleCount = widgets.filter(w => w.visible).length

  return (
    <div className="p-4 md:p-6 max-w-3xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-base md:text-lg font-medium text-gray-800">Widgets</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {visibleCount} of {widgets.length} widgets visible
          </p>
        </div>
        <button
          onClick={saveAll}
          disabled={saving}
          className="flex items-center gap-1.5 px-3 md:px-4 py-2 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 transition-all flex-shrink-0"
        >
          <Save size={11} />
          <span>{saved ? 'Saved!' : saving ? 'Saving...' : 'Save'}</span>
        </button>
      </div>

      {/* Visibility */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 md:p-5 mb-4">
        <h2 className="text-sm font-medium text-gray-700 mb-3 pb-3 border-b border-gray-100">
          Visibility
        </h2>
        <div className="divide-y divide-gray-50">
          {widgets.map(w => {
            const meta = WIDGET_LABELS[w.widgetKey]
            if (!meta) return null
            return (
              <div key={w.widgetKey} className="flex items-center gap-3 py-3">
                {/* Icon */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                  ${w.visible ? 'bg-blue-50 text-blue-500' : 'bg-gray-100 text-gray-400'}`}
                >
                  {w.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                </div>

                {/* Label + desc */}
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium ${w.visible ? 'text-gray-700' : 'text-gray-400'}`}>
                    {meta.label}
                  </p>
                  <p className="text-[11px] text-gray-400 truncate">{meta.desc}</p>
                </div>

                {/* Toggle */}
                <button
                  onClick={() => toggleVisible(w.widgetKey)}
                  aria-label={`${w.visible ? 'Hide' : 'Show'} ${meta.label}`}
                  className={`relative w-9 h-5 rounded-full transition-all duration-200 flex-shrink-0
                    ${w.visible ? 'bg-blue-500' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200
                    ${w.visible ? 'left-4' : 'left-0.5'}`}
                  />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Chart type preferences */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 md:p-5">
        <h2 className="text-sm font-medium text-gray-700 mb-3 pb-3 border-b border-gray-100">
          Chart type preferences
        </h2>
        <div className="divide-y divide-gray-50">
          {widgets
            .filter(w => CHART_TYPES[w.widgetKey])
            .map(w => {
              const meta = WIDGET_LABELS[w.widgetKey]
              const types = CHART_TYPES[w.widgetKey]
              return (
                <div key={w.widgetKey} className="py-3">
                  {/* Label */}
                  <p className="text-xs text-gray-600 mb-2">{meta?.label}</p>
                  {/* Type buttons — wrap on mobile */}
                  <div className="flex flex-wrap gap-1.5">
                    {types.map(type => (
                      <button
                        key={type}
                        onClick={() => setChartType(w.widgetKey, type)}
                        className={`text-[11px] px-2.5 py-1.5 rounded-md border transition-all
                          ${w.chartType === type
                            ? 'bg-blue-50 text-blue-600 border-blue-200'
                            : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
        </div>
      </div>

      {/* Floating save bar — mobile only, muncul saat ada perubahan */}
      <div className="fixed bottom-4 left-4 right-4 md:hidden">
        <button
          onClick={saveAll}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium
            bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-500
            disabled:opacity-50 transition-all"
        >
          <Save size={14} />
          {saved ? 'Saved!' : saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>

      {/* Bottom padding supaya konten tidak ketutup floating bar di mobile */}
      <div className="h-20 md:hidden" />
    </div>
  )
}