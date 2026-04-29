'use client'

import { useMemo, useState } from 'react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ErrorMessage from '@/components/ui/ErrorMessage'
import { useUserStories, useTasks, useMembers, useTeamConfig } from '@/lib/hooks'
import { calcMemberSummary } from '@/lib/transformer'
import MemberDetailModal from '@/components/ui/MemberDetailModal'

const roleStyle: Record<string, string> = {
  DEV: 'bg-blue-50 text-blue-600',
  QA: 'bg-emerald-50 text-emerald-600',
  PM: 'bg-amber-50 text-amber-600',
}

export default function TeamPage() {
  const { stories, isLoading, error } = useUserStories()
  const { tasks } = useTasks()
  const { members } = useMembers()
  const { teamConfig } = useTeamConfig()

  const memberSummary = useMemo(() => {
    const base = calcMemberSummary(stories, tasks, members)
    return base.map(m => {
      const config = teamConfig.find((c: any) => c.taigaUserId === m.id)
      return { ...m, role_name: config?.role || m.role_name || 'DEV' }
    })
  }, [stories, tasks, members, teamConfig])

  const devMembers = memberSummary.filter(m => m.role_name === 'DEV')
  const qaMembers = memberSummary.filter(m => m.role_name === 'QA')
  const pmMembers = memberSummary.filter(m => m.role_name === 'PM')

  const devDone = devMembers.reduce((sum, m) => sum + m.done, 0)
  const qaDone = qaMembers.reduce((sum, m) => sum + m.done, 0)
  const devTotal = devMembers.reduce((sum, m) => sum + m.total, 0)
  const qaTotal = qaMembers.reduce((sum, m) => sum + m.total, 0)

  const [selectedMember, setSelectedMember] = useState<{
  id: number; full_name: string; username: string; role_name: string
} | null>(null)

  if (isLoading) return <LoadingSpinner text="Loading team data..." />
  if (error) return <ErrorMessage message="Failed to load team data" />

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-medium text-gray-800">Team</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          {memberSummary.length} active members
        </p>
      </div>

      {/* QA vs DEV summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-xs text-blue-500 mb-1">DEV team</p>
          <p className="text-2xl font-medium text-blue-700">{devDone}</p>
          <p className="text-xs text-blue-400 mt-0.5">
            done of {devTotal} · {devTotal > 0 ? Math.round((devDone / devTotal) * 100) : 0}%
          </p>
          <div className="mt-2 h-1.5 bg-blue-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${devTotal > 0 ? Math.round((devDone / devTotal) * 100) : 0}%` }}
            />
          </div>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4">
          <p className="text-xs text-emerald-500 mb-1">QA team</p>
          <p className="text-2xl font-medium text-emerald-700">{qaDone}</p>
          <p className="text-xs text-emerald-400 mt-0.5">
            done of {qaTotal} · {qaTotal > 0 ? Math.round((qaDone / qaTotal) * 100) : 0}%
          </p>
          <div className="mt-2 h-1.5 bg-emerald-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${qaTotal > 0 ? Math.round((qaDone / qaTotal) * 100) : 0}%` }}
            />
          </div>
        </div>
        <div className="bg-gray-100 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Total members</p>
          <p className="text-2xl font-medium text-gray-700">{memberSummary.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {devMembers.length} DEV · {qaMembers.length} QA · {pmMembers.length} PM
          </p>
        </div>
      </div>

      {/* Member table */}
      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <p className="text-xs font-medium text-gray-500 mb-4">All members</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {['Member', 'Role', 'Done', 'In Progress', 'Blocked', 'Total', 'Progress'].map(h => (
                <th key={h} className="text-left text-[11px] text-gray-400 uppercase tracking-wider pb-2 font-medium pr-4">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {memberSummary.map(m => (
              <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="py-2.5 pr-4">
                  <button
                    onClick={() => setSelectedMember(m)}
                    className="flex items-center gap-2 hover:opacity-75 transition-opacity group text-left"
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-medium flex-shrink-0">
                      {m.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs text-gray-700 group-hover:text-blue-600 transition-colors group-hover:underline underline-offset-2">
                        {m.full_name}
                      </p>
                      <p className="text-[11px] text-gray-400">{m.role_name}</p>
                    </div>
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
                <td className="py-2.5 pr-4 text-gray-500 text-xs">{m.total}</td>
                <td className="py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${m.pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{m.pct}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedMember && (
  <MemberDetailModal
    memberId={selectedMember.id}
    memberName={selectedMember.full_name}
    memberRolename={selectedMember.role_name}
    roleLabel={selectedMember.role_name}
    stories={stories}
    onClose={() => setSelectedMember(null)}
  />
)}
    </div>
  )
}