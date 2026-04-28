'use client'

import { useMemo } from 'react'
import MetricCard from '@/components/ui/MetricCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ErrorMessage from '@/components/ui/ErrorMessage'
import StatusChart from '@/components/charts/StatusChart'
import MemberChart from '@/components/charts/MemberChart'
import TeamTable from '@/components/charts/TeamTable'
import { useUserStories, useMembers, useTasks, useTeamConfig } from '@/lib/hooks'
import { calcSprintSummary, calcMemberSummary } from '@/lib/transformer'

export default function DashboardPage() {
  const { stories, isLoading: storiesLoading, error: storiesError } = useUserStories()
  const { tasks } = useTasks()
  const { members } = useMembers()
  const { teamConfig } = useTeamConfig()

  const summary = useMemo(() => calcSprintSummary(stories), [stories])

  const memberSummary = useMemo(() => {
    const base = calcMemberSummary(stories, tasks, members)
    // Merge dengan role dari DB config
    return base.map(m => {
      const config = teamConfig.find((c: any) => c.taigaUserId === m.id)
      return {
        ...m,
        role_name: config?.role || m.role_name || 'DEV',
      }
    })
  }, [stories, tasks, members, teamConfig])

  if (storiesLoading) return <LoadingSpinner text="Loading dashboard..." />
  if (storiesError) return <ErrorMessage message="Failed to load data from Taiga" />

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-medium text-gray-800">Dashboard</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            IT Development · Kanban Board
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          {stories.length} stories loaded
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <MetricCard
          label="Total Stories"
          value={summary.total}
          sub="All stories"
          color="blue"
        />
        <MetricCard
          label="Done"
          value={summary.done}
          sub={`${summary.completionPct}% completion`}
          color="teal"
        />
        <MetricCard
          label="In Progress"
          value={summary.inProgress}
          sub={`${summary.total > 0 ? Math.round((summary.inProgress / summary.total) * 100) : 0}% of total`}
          color="amber"
        />
        <MetricCard
          label="Blocked"
          value={summary.blocked}
          sub="Needs attention"
          color="red"
        />
      </div>

      {/* Progress Bar */}
      <div className="mb-5">
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>Overall Progress</span>
          <span className="font-medium text-gray-700">
            {summary.completionPct}%
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-700"
            style={{ width: `${summary.completionPct}%` }}
          />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <p className="text-xs font-medium text-gray-500 mb-3">
            Status breakdown
          </p>
          <StatusChart summary={summary} />
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <p className="text-xs font-medium text-gray-500 mb-3">
            Tasks per member
          </p>
          <MemberChart members={memberSummary} />
        </div>
      </div>

      {/* Team Table */}
      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <p className="text-xs font-medium text-gray-500 mb-3">
          Team summary
        </p>
        <TeamTable members={memberSummary} />
      </div>
    </div>
  )
}