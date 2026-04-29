'use client'

import { useMemo, useState } from 'react'
import MetricCard from '@/components/ui/MetricCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ErrorMessage from '@/components/ui/ErrorMessage'
import StatusChart from '@/components/charts/StatusChart'
import MemberChart from '@/components/charts/MemberChart'
import TeamTable from '@/components/charts/TeamTable'
import DateRangePicker, { DateRange } from '@/components/ui/DateRangePicker'
import MemberDetailModal from '@/components/ui/MemberDetailModal'
import { filterStoriesByDateRange } from '@/lib/dateFilter'
import { useUserStories, useMembers, useTasks, useTeamConfig } from '@/lib/hooks'
import { calcSprintSummary, calcMemberSummary } from '@/lib/transformer'
import { MemberSummary } from '@/types/taiga'

const DEFAULT_RANGE: DateRange = {
  label: 'Sprint current (27 Apr – 17 Mei)',
  start: '2026-04-27',
  end: '2026-05-17',
}

interface SelectedMember {
  id: number
  full_name: string
  username: string
  role_name: string
}

export default function DashboardPage() {
  const [showDone, setShowDone] = useState(true) 
  const [dateRange, setDateRange] = useState<DateRange>(DEFAULT_RANGE)
  const [selectedMember, setSelectedMember] = useState<SelectedMember | null>(null)

  const { stories: allStories, isLoading, error } = useUserStories()
  const { tasks } = useTasks()
  const { members } = useMembers()
  const { teamConfig } = useTeamConfig()

  const stories = useMemo(
    () => filterStoriesByDateRange(allStories, dateRange),
    [allStories, dateRange]
  )

  const summary = useMemo(() => calcSprintSummary(stories), [stories])

  const memberSummary = useMemo(() => {
    const filteredTasks = tasks.filter((t: any) => {
      if (!dateRange.start || !dateRange.end) return true
      const start = new Date(dateRange.start).setHours(0, 0, 0, 0)
      const end = new Date(dateRange.end).setHours(23, 59, 59, 999)
      const modified = new Date(t.modified_date).getTime()
      return modified >= start && modified <= end
    })
    const base = calcMemberSummary(stories, filteredTasks, members)
    return base.map(m => {
      const config = teamConfig.find((c: any) => c.taigaUserId === m.id)
      return { ...m, role_name: config?.role || m.role_name || 'DEV' }
    })
  }, [stories, tasks, members, teamConfig, dateRange])

  if (isLoading) return <LoadingSpinner text="Loading dashboard..." />
  if (error) return <ErrorMessage message="Failed to load data from Taiga" />

  const isFiltered = !!(dateRange.start && dateRange.end)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-medium text-gray-800">Dashboard</h1>
          <p className="text-xs text-gray-400 mt-0.5">IT Development · Kanban Board</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            {isFiltered
              ? `${stories.length} dari ${allStories.length} stories`
              : `${stories.length} stories`
            }
          </div>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      {/* Sprint info bar */}
      {isFiltered && (
        <div className="mb-4 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-blue-600">
            <span className="font-medium">{dateRange.label}</span>
            <span className="text-blue-400">{dateRange.start} → {dateRange.end}</span>
          </div>
          <div className="text-xs text-blue-400">
            {Math.ceil(
              (new Date(dateRange.end).getTime() - new Date(dateRange.start).getTime())
              / (1000 * 60 * 60 * 24)
            ) + 1} hari
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <MetricCard label="Total Stories" value={summary.total} sub={isFiltered ? dateRange.label : 'semua'} color="blue" />
        <MetricCard label="Done" value={summary.done} sub={`${summary.completionPct}% completion`} color="teal" />
        <MetricCard label="In Progress" value={summary.inProgress} sub={`${summary.total > 0 ? Math.round((summary.inProgress / summary.total) * 100) : 0}% of total`} color="amber" />
        <MetricCard label="Blocked" value={summary.blocked} sub="Needs attention" color="red" />
      </div>

      {/* Progress Bar */}
      <div className="mb-5">
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>Sprint Progress</span>
          <span className="font-medium text-gray-700">{summary.completionPct}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-700"
            style={{ width: `${summary.completionPct}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
          <span>{summary.done} done</span>
          <span>{summary.inProgress} in progress</span>
          <span>{summary.blocked} blocked</span>
        </div>
      </div>

      {/* Done Stories List */}
<div className="bg-white border border-gray-100 rounded-xl p-4 mb-4">
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-2">
      <p className="text-xs font-medium text-gray-500">Done stories</p>
      <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-medium">
        {summary.done}
      </span>
    </div>
    <button
      onClick={() => setShowDone(prev => !prev)}
      className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
    >
      {showDone ? 'Hide' : 'Show all'}
    </button>
  </div>

  {showDone && (
    <div className="space-y-1.5">
      {stories
        .filter(s => s.is_closed)
        .sort((a, b) => {
          // Sort by finish_date terbaru dulu
          if (!a.finish_date) return 1
          if (!b.finish_date) return -1
          return new Date(b.finish_date).getTime() - new Date(a.finish_date).getTime()
        })
        .map(s => {
          const assignedNames = memberSummary
            .filter(m =>
              ((s as any).assigned_users?.length
                ? (s as any).assigned_users
                : s.assigned_to ? [s.assigned_to] : []
              ).includes(m.id)
            )
            .map(m => m.full_name.split(' ')[0])

          return (
            <div
              key={s.id}
              className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition-all group"
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                {/* Done checkmark */}
                <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1 4L3 6L7 2" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                {/* Ref + Subject */}
                <span className="text-[11px] text-gray-400 flex-shrink-0">#{s.ref}</span>
                <span className="text-xs text-gray-600 truncate">{s.subject}</span>
              </div>

              <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                {/* Assigned members */}
                {assignedNames.length > 0 && (
                  <div className="flex items-center gap-1">
                    {assignedNames.slice(0, 2).map((name, i) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-500 rounded font-medium">
                        {name}
                      </span>
                    ))}
                    {assignedNames.length > 2 && (
                      <span className="text-[10px] text-gray-400">+{assignedNames.length - 2}</span>
                    )}
                  </div>
                )}

                {/* Points */}
                {s.total_points !== null && (
                  <span className="text-[10px] text-gray-400">{s.total_points} pts</span>
                )}

                {/* Finish date */}
                {s.finish_date && (
                  <span className="text-[10px] text-gray-400">
                    {new Date(s.finish_date).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'short'
                    })}
                  </span>
                )}

                {/* Status badge */}
                <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-emerald-50 text-emerald-600">
                  {s.status_extra_info?.name}
                </span>
              </div>
            </div>
          )
        })}

      {stories.filter(s => s.is_closed).length === 0 && (
        <p className="text-xs text-gray-400 text-center py-4">
          Belum ada story yang done dalam range ini
        </p>
      )}
    </div>
  )}

  {/* Collapsed preview — tampil saat hidden */}
  {!showDone && stories.filter(s => s.is_closed).length > 0 && (
    <div className="flex items-center gap-2">
      {stories
        .filter(s => s.is_closed)
        .slice(0, 3)
        .map(s => (
          <span key={s.id} className="text-[11px] text-gray-400 truncate max-w-32">
            #{s.ref} {s.subject.split(']').pop()?.trim() || s.subject}
          </span>
        ))
      }
      {stories.filter(s => s.is_closed).length > 3 && (
        <span className="text-[11px] text-gray-400">
          +{stories.filter(s => s.is_closed).length - 3} more
        </span>
      )}
    </div>
  )}
</div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <p className="text-xs font-medium text-gray-500 mb-3">Status breakdown</p>
          <StatusChart summary={summary} />
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <p className="text-xs font-medium text-gray-500 mb-3">Tasks per member</p>
          <MemberChart members={memberSummary} />
        </div>
      </div>

      {/* Team Table — dengan clickable member */}
      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-gray-500">Team summary</p>
          <p className="text-[11px] text-gray-400">Klik nama untuk lihat detail</p>
        </div>
        <TeamTableClickable
          members={memberSummary}
          onMemberClick={setSelectedMember}
        />
      </div>

      {/* Member Detail Modal */}
      {selectedMember && (
        <MemberDetailModal
          memberId={selectedMember.id}
          memberName={selectedMember.full_name}
          memberRolename={selectedMember.username}
          roleLabel={selectedMember.role_name}
          stories={allStories}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  )
}

// ─── Clickable version of TeamTable ──────────────────────────
function TeamTableClickable({
  members,
  onMemberClick,
}: {
  members: MemberSummary[]
  onMemberClick: (m: SelectedMember) => void
}) {
  const roleStyle: Record<string, string> = {
    DEV: 'bg-blue-50 text-blue-600',
    QA:  'bg-emerald-50 text-emerald-600',
    PM:  'bg-amber-50 text-amber-600',
  }

  if (members.length === 0) {
    return <p className="text-sm text-gray-400 py-6 text-center">No member data</p>
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-100">
          {['Member', 'Role', 'Done', 'In Progress', 'Blocked', 'Progress'].map(h => (
            <th key={h} className="text-left text-[11px] text-gray-400 uppercase tracking-wider pb-2 font-medium pr-4">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {members.map(m => (
          <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50/50">
            <td className="py-2.5 pr-4">
              <button
                onClick={() => onMemberClick(m)}
                className="flex items-center gap-2 hover:opacity-75 transition-opacity text-left group"
              >
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-medium flex-shrink-0">
                  {m.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <span className="text-xs text-gray-700 group-hover:text-blue-600 transition-colors underline-offset-2 group-hover:underline">
                  {m.full_name}
                </span>
              </button>
            </td>
            <td className="py-2.5 pr-4">
              <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${roleStyle[m.role_name] || roleStyle.DEV}`}>
                {m.role_name}
              </span>
            </td>
            <td className="py-2.5 pr-4 text-emerald-600 font-medium text-xs">{m.done}</td>
            <td className="py-2.5 pr-4 text-amber-600 text-xs">{m.inProgress}</td>
            <td className="py-2.5 pr-4 text-red-500 text-xs">{m.blocked}</td>
            <td className="py-2.5">
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${m.pct}%` }} />
                </div>
                <span className="text-xs text-gray-500">{m.pct}%</span>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}