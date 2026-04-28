'use client'

import { useState, useMemo } from 'react'
import { useScoring } from '@/lib/hooks'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ErrorMessage from '@/components/ui/ErrorMessage'
import ScoringChart from '@/components/charts/ScoringChart'
import { MemberScore, StoryScore } from '@/types/taiga'
import { ChevronDown, ChevronRight, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import DateRangePicker, { DateRange } from '@/components/ui/DateRangePicker'

const roleStyle: Record<string, string> = {
  DEV: 'bg-blue-50 text-blue-600',
  QA: 'bg-emerald-50 text-emerald-600',
  PM: 'bg-amber-50 text-amber-600',
}

const scoreStatusConfig = {
  early:       { label: 'Early',       color: 'text-emerald-600 bg-emerald-50', icon: TrendingUp },
  on_time:     { label: 'On Time',     color: 'text-blue-600 bg-blue-50',       icon: Minus },
  late:        { label: 'Late',        color: 'text-red-500 bg-red-50',         icon: TrendingDown },
  ongoing:     { label: 'On Going',    color: 'text-amber-600 bg-amber-50',     icon: Clock },
  no_due_date: { label: 'No Due Date', color: 'text-gray-400 bg-gray-50',       icon: Minus },
}

function ScoreBadge({ score, status }: { score: number | null; status: StoryScore['scoreStatus'] }) {
  if (status === 'ongoing') {
    return (
      <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-amber-50 text-amber-600">
        On Going
      </span>
    )
  }
  if (status === 'no_due_date') {
    return (
      <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-400">
        No due date
      </span>
    )
  }
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium
      ${score !== null && score > 0
        ? 'bg-emerald-50 text-emerald-700'
        : score === 0
          ? 'bg-gray-100 text-gray-500'
          : 'bg-red-50 text-red-600'
      }`}
    >
      {score !== null && score > 0 ? '+' : ''}{score} pts
    </span>
  )
}

function VarianceBadge({ variance, status }: { variance: number | null; status: StoryScore['scoreStatus'] }) {
  if (variance === null || status === 'no_due_date') {
    return <span className="text-gray-300 text-xs">—</span>
  }
  if (status === 'ongoing') {
    return (
      <span className={`text-[11px] ${variance > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
        {variance > 0 ? `${variance}d remaining` : `${Math.abs(variance)}d overdue`}
      </span>
    )
  }
  return (
    <span className={`text-[11px] font-medium ${
      variance > 0 ? 'text-emerald-600' :
      variance < 0 ? 'text-red-500' : 'text-gray-500'
    }`}>
      {variance > 0 ? `+${variance}d early` : variance < 0 ? `${variance}d late` : 'On time'}
    </span>
  )
}

function MemberCard({ member }: { member: MemberScore }) {
  const [expanded, setExpanded] = useState(false)

  const ongoingStories = member.stories.filter(s => !s.isClosed)
  const doneStories = member.stories.filter(s => s.isClosed)

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50/50 transition-all"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium flex-shrink-0">
            {member.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-700">{member.full_name}</p>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${roleStyle[member.role_name] || roleStyle.DEV}`}>
                {member.role_name}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">@{member.username}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex gap-4 text-center">
            <div>
              <p className="text-lg font-semibold text-gray-800">{member.totalScore}</p>
              <p className="text-[10px] text-gray-400">Total pts</p>
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-600">{member.earlyCount}</p>
              <p className="text-[10px] text-gray-400">Early</p>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-500">{member.onTimeCount}</p>
              <p className="text-[10px] text-gray-400">On time</p>
            </div>
            <div>
              <p className="text-sm font-medium text-red-500">{member.lateCount}</p>
              <p className="text-[10px] text-gray-400">Late</p>
            </div>
            <div>
              <p className="text-sm font-medium text-amber-500">{member.ongoingStories}</p>
              <p className="text-[10px] text-gray-400">On going</p>
            </div>
          </div>

          <div className="text-center min-w-16">
            <p className={`text-sm font-medium ${
              member.avgVariance > 0 ? 'text-emerald-600' :
              member.avgVariance < 0 ? 'text-red-500' : 'text-gray-500'
            }`}>
              {member.avgVariance > 0 ? `+${member.avgVariance}d` :
               member.avgVariance < 0 ? `${member.avgVariance}d` : '0d'}
            </p>
            <p className="text-[10px] text-gray-400">Avg variance</p>
          </div>

          {expanded
            ? <ChevronDown size={16} className="text-gray-400" />
            : <ChevronRight size={16} className="text-gray-400" />
          }
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100">
          {ongoingStories.length > 0 && (
            <div className="px-4 py-3 bg-amber-50/30">
              <p className="text-[11px] font-medium text-amber-600 mb-2 uppercase tracking-wider">
                Currently working on ({ongoingStories.length})
              </p>
              <div className="space-y-2">
                {ongoingStories.map(s => (
                  <div key={s.storyId} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-gray-400 flex-shrink-0">#{s.ref}</span>
                      <span className="text-gray-600 truncate">{s.subject}</span>
                    </div>
                    <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                      <span className="text-gray-400">{s.totalPoints} pts</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium
                        ${s.status === 'In Progress' ? 'bg-blue-50 text-blue-600' :
                          s.status === 'Ready For Test' ? 'bg-purple-50 text-purple-600' :
                          s.status === 'Testing' ? 'bg-indigo-50 text-indigo-600' :
                          'bg-gray-100 text-gray-500'}`}
                      >
                        {s.status}
                      </span>
                      <VarianceBadge variance={s.daysVariance} status={s.scoreStatus} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {doneStories.length > 0 && (
            <div className="px-4 py-3">
              <p className="text-[11px] font-medium text-gray-400 mb-2 uppercase tracking-wider">
                Completed ({doneStories.length})
              </p>
              <div className="space-y-2">
                {doneStories.map(s => (
                  <div key={s.storyId} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-gray-400 flex-shrink-0">#{s.ref}</span>
                      <span className="text-gray-500 truncate">{s.subject}</span>
                    </div>
                    <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                      <span className="text-gray-400">{s.totalPoints} pts base</span>
                      <VarianceBadge variance={s.daysVariance} status={s.scoreStatus} />
                      <ScoreBadge score={s.score} status={s.scoreStatus} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ScoringPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    label: 'Sprint current (27 Apr – 17 Mei)',
    start: '2026-04-27',
    end: '2026-05-17',
  })
  const [filter, setFilter] = useState<'all' | 'DEV' | 'QA'>('all')

  const { scores, isLoading, error } = useScoring()

  const filteredByDate = useMemo(() => {
    if (!dateRange.start || !dateRange.end) return scores

    const start = new Date(dateRange.start).setHours(0, 0, 0, 0)
    const end = new Date(dateRange.end).setHours(23, 59, 59, 999)

    return scores
      .map((member: MemberScore) => {
        const filteredStories = member.stories.filter(s => {
          if (s.isClosed && s.finishDate) {
            const finished = new Date(s.finishDate).getTime()
            return finished >= start && finished <= end
          }
          if (!s.isClosed && s.dueDate) {
            const due = new Date(s.dueDate).getTime()
            return due >= start && due <= end
          }
          return !s.isClosed
        })

        const doneStories = filteredStories.filter(s => s.isClosed)
        const ongoingStories = filteredStories.filter(s => !s.isClosed)
        const totalScore = doneStories.reduce((sum, s) => sum + (s.score ?? 0), 0)
        const onTimeCount = doneStories.filter(s => s.scoreStatus === 'on_time').length
        const earlyCount = doneStories.filter(s => s.scoreStatus === 'early').length
        const lateCount = doneStories.filter(s => s.scoreStatus === 'late').length

        return {
          ...member,
          stories: filteredStories,
          totalScore,
          doneStories: doneStories.length,
          ongoingStories: ongoingStories.length,
          onTimeCount,
          earlyCount,
          lateCount,
        }
      })
      .filter((m: MemberScore) => m.stories.length > 0)
      .sort((a: MemberScore, b: MemberScore) => b.totalScore - a.totalScore)
  }, [scores, dateRange])

  const filtered = filteredByDate.filter((m: MemberScore) =>
    filter === 'all' ? true : m.role_name === filter
  )

  const topScorer = filtered[0] as MemberScore | undefined
  const totalScore = filtered.reduce((sum: number, m: MemberScore) => sum + m.totalScore, 0)

  if (isLoading) return <LoadingSpinner text="Calculating scores..." />
  if (error) return <ErrorMessage message="Failed to load scoring data" />

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-medium text-gray-800">Scoring</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Based on mandays · on time = base pts · early/late = ±1 per day
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {(['all', 'DEV', 'QA'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-all
                  ${filter === f
                    ? 'bg-white text-gray-700 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                {f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-100 rounded-xl p-4">
          <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">Team total</p>
          <p className="text-2xl font-medium text-gray-700">{totalScore} pts</p>
          <p className="text-[11px] text-gray-400 mt-1">{filtered.length} members</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4">
          <p className="text-[11px] text-emerald-500 uppercase tracking-wider mb-1">Top scorer</p>
          <p className="text-lg font-medium text-emerald-700 truncate">
            {topScorer?.full_name.split(' ')[0] ?? '—'}
          </p>
          <p className="text-[11px] text-emerald-400 mt-1">{topScorer?.totalScore ?? 0} pts</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-[11px] text-blue-500 uppercase tracking-wider mb-1">On time rate</p>
          <p className="text-2xl font-medium text-blue-700">
            {filtered.length > 0
              ? Math.round(
                  (filtered.reduce((sum: number, m: MemberScore) => sum + m.onTimeCount + m.earlyCount, 0) /
                  Math.max(filtered.reduce((sum: number, m: MemberScore) => sum + m.doneStories, 0), 1)) * 100
                )
              : 0}%
          </p>
          <p className="text-[11px] text-blue-400 mt-1">stories delivered</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4">
          <p className="text-[11px] text-amber-500 uppercase tracking-wider mb-1">On going</p>
          <p className="text-2xl font-medium text-amber-700">
            {filtered.reduce((sum: number, m: MemberScore) => sum + m.ongoingStories, 0)}
          </p>
          <p className="text-[11px] text-amber-400 mt-1">active stories</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-5 mb-4">
        <p className="text-xs font-medium text-gray-500 mb-4">Score comparison</p>
        <ScoringChart scores={filtered} />
      </div>

      <div className="space-y-3">
        {filtered.map((member: MemberScore, index: number) => (
          <div key={member.id} className="relative">
            <div className={`absolute -left-2 top-4 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold z-10
              ${index === 0 ? 'bg-amber-400 text-white' :
                index === 1 ? 'bg-gray-300 text-gray-600' :
                index === 2 ? 'bg-amber-700 text-white' :
                'bg-gray-100 text-gray-400'}`}
            >
              {index + 1}
            </div>
            <MemberCard member={member} />
          </div>
        ))}
      </div>
    </div>
  )
}