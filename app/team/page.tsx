'use client'

import { useMemo, useState } from 'react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ErrorMessage from '@/components/ui/ErrorMessage'
import { useUserStories, useTasks, useMembers, useTeamConfig } from '@/lib/hooks'
import { calcMemberSummary } from '@/lib/transformer'
import MemberDetailModal from '@/components/ui/MemberDetailModal'

const roleStyle: Record<string, string> = {
  DEV: 'bg-blue-50 text-blue-600',
  QA:  'bg-emerald-50 text-emerald-600',
  PM:  'bg-amber-50 text-amber-600',
}

type SelectedMember = {
  id: number
  full_name: string
  username: string
  role_name: string
}

export default function TeamPage() {
  const { stories, isLoading, error } = useUserStories()
  const { tasks } = useTasks()
  const { members } = useMembers()
  const { teamConfig } = useTeamConfig()
  const [selectedMember, setSelectedMember] = useState<SelectedMember | null>(null)

  const memberSummary = useMemo(() => {
    const base = calcMemberSummary(stories, tasks, members)
    return base.map(m => {
      const config = teamConfig.find((c: any) => c.taigaUserId === m.id)
      return { ...m, role_name: config?.role || m.role_name || 'DEV' }
    })
  }, [stories, tasks, members, teamConfig])

  const devMembers = memberSummary.filter(m => m.role_name === 'DEV')
  const qaMembers  = memberSummary.filter(m => m.role_name === 'QA')
  const pmMembers  = memberSummary.filter(m => m.role_name === 'PM')

  const devDone  = devMembers.reduce((s, m) => s + m.done, 0)
  const qaDone   = qaMembers.reduce((s, m) => s + m.done, 0)
  const devTotal = devMembers.reduce((s, m) => s + m.total, 0)
  const qaTotal  = qaMembers.reduce((s, m) => s + m.total, 0)

  if (isLoading) return <LoadingSpinner text="Loading team data..." />
  if (error)     return <ErrorMessage message="Failed to load team data" />

  return (
    <div className="p-4 md:p-6">

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-base md:text-lg font-medium text-gray-800">Team</h1>
        <p className="text-xs text-gray-400 mt-0.5">{memberSummary.length} active members</p>
      </div>

      {/* Summary cards — 1 col mobile, 3 col desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {/* DEV */}
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-xs text-blue-500 mb-1">DEV team</p>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-medium text-blue-700">{devDone}</p>
            <p className="text-xs text-blue-400 mb-0.5">
              {devTotal > 0 ? Math.round((devDone / devTotal) * 100) : 0}%
            </p>
          </div>
          <p className="text-xs text-blue-400 mt-0.5">done of {devTotal}</p>
          <div className="mt-2 h-1.5 bg-blue-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${devTotal > 0 ? Math.round((devDone / devTotal) * 100) : 0}%` }}
            />
          </div>
          <p className="text-[11px] text-blue-400 mt-1.5">{devMembers.length} members</p>
        </div>

        {/* QA */}
        <div className="bg-emerald-50 rounded-xl p-4">
          <p className="text-xs text-emerald-500 mb-1">QA team</p>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-medium text-emerald-700">{qaDone}</p>
            <p className="text-xs text-emerald-400 mb-0.5">
              {qaTotal > 0 ? Math.round((qaDone / qaTotal) * 100) : 0}%
            </p>
          </div>
          <p className="text-xs text-emerald-400 mt-0.5">done of {qaTotal}</p>
          <div className="mt-2 h-1.5 bg-emerald-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${qaTotal > 0 ? Math.round((qaDone / qaTotal) * 100) : 0}%` }}
            />
          </div>
          <p className="text-[11px] text-emerald-400 mt-1.5">{qaMembers.length} members</p>
        </div>

        {/* Total */}
        <div className="bg-gray-100 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Total members</p>
          <p className="text-2xl font-medium text-gray-700">{memberSummary.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {devMembers.length} DEV · {qaMembers.length} QA · {pmMembers.length} PM
          </p>
          <div className="mt-2 flex gap-1">
            {devMembers.length > 0 && (
              <div
                className="h-1.5 bg-blue-400 rounded-full"
                style={{ width: `${Math.round((devMembers.length / memberSummary.length) * 100)}%` }}
              />
            )}
            {qaMembers.length > 0 && (
              <div
                className="h-1.5 bg-emerald-400 rounded-full"
                style={{ width: `${Math.round((qaMembers.length / memberSummary.length) * 100)}%` }}
              />
            )}
            {pmMembers.length > 0 && (
              <div
                className="h-1.5 bg-amber-400 rounded-full"
                style={{ width: `${Math.round((pmMembers.length / memberSummary.length) * 100)}%` }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Members */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 md:p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-medium text-gray-500">All members</p>
          <p className="text-[11px] text-gray-400 hidden sm:block">Klik nama untuk lihat detail</p>
        </div>

        {/* Desktop — table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Member', 'Role', 'Done', 'In Progress', 'Blocked', 'Total', 'Progress'].map(h => (
                  <th key={h} className="text-left text-[11px] text-gray-400 uppercase tracking-wider pb-2 font-medium pr-4 whitespace-nowrap">
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
                      <p className="text-xs text-gray-700 group-hover:text-blue-600 transition-colors group-hover:underline underline-offset-2 whitespace-nowrap">
                        {m.full_name}
                      </p>
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
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${m.pct}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{m.pct}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile — card list */}
        <div className="md:hidden space-y-2">
          {memberSummary.map(m => (
            <button
              key={m.id}
              onClick={() => setSelectedMember(m)}
              className="w-full text-left bg-gray-50 active:bg-gray-100 rounded-xl p-3 transition-all"
            >
              {/* Top row — avatar + name + role + pct */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-medium flex-shrink-0">
                    {m.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate">{m.full_name}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${roleStyle[m.role_name] || roleStyle.DEV}`}>
                      {m.role_name}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-medium text-gray-600 ml-2 flex-shrink-0">{m.pct}%</span>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${m.pct}%` }} />
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-4 text-center">
                <div>
                  <p className="text-xs font-medium text-emerald-600">{m.done}</p>
                  <p className="text-[10px] text-gray-400">Done</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-amber-500">{m.inProgress}</p>
                  <p className="text-[10px] text-gray-400">Progress</p>
                </div>
                <div>
                  <p className={`text-xs font-medium ${m.blocked > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                    {m.blocked}
                  </p>
                  <p className="text-[10px] text-gray-400">Blocked</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">{m.total}</p>
                  <p className="text-[10px] text-gray-400">Total</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedMember && (
        <MemberDetailModal
          memberId={selectedMember.id}
          memberName={selectedMember.full_name}
          memberRolename={selectedMember.username}
          roleLabel={selectedMember.role_name}
          stories={stories}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  )
}