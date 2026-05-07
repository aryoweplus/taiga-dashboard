'use client'

import { useEffect, useMemo } from 'react'
import { X, ExternalLink } from 'lucide-react'
import { TaigaUserStory } from '@/types/taiga'

interface Props {
  memberId: number
  memberName: string
  memberRolename: string
  roleLabel: string
  stories: TaigaUserStory[]
  onClose: () => void
}

const statusStyle: Record<string, string> = {
  'New':              'bg-gray-100 text-gray-500',
  'Ready':            'bg-blue-50 text-blue-500',
  'In Progress':      'bg-indigo-50 text-indigo-600',
  'In progress':      'bg-indigo-50 text-indigo-600',  // ← lowercase variant
  'Hold':             'bg-orange-50 text-orange-500',
  'Ready For Test':   'bg-purple-50 text-purple-600',
  'Ready for test':   'bg-purple-50 text-purple-600',  // ← lowercase variant
  'Testing':          'bg-violet-50 text-violet-600',
  'Ready to Release': 'bg-cyan-50 text-cyan-600',
  'Done':             'bg-emerald-50 text-emerald-600',
  'Archived':         'bg-gray-100 text-gray-400',
}

const roleStyle: Record<string, string> = {
  DEV: 'bg-blue-50 text-blue-600',
  QA:  'bg-emerald-50 text-emerald-600',
  PM:  'bg-amber-50 text-amber-600',
}

export default function MemberDetailModal({
  memberId,
  memberName,
  // memberUsername,
  memberRolename,
  roleLabel,
  stories,
  onClose,
}: Props) {
  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Filter stories yang di-assign ke member ini
  const memberStories = useMemo(() => {
    return stories.filter(s => {
      const assignedUsers: number[] = (s as any).assigned_users?.length
        ? (s as any).assigned_users
        : s.assigned_to ? [s.assigned_to] : []
      return assignedUsers.includes(memberId)
    })
  }, [stories, memberId])

  // Group by status
  const ongoing = memberStories.filter(s => !s.is_closed)
  const done = memberStories.filter(s => s.is_closed)

  // Group ongoing by status name
  const ongoingByStatus = ongoing.reduce((acc, s) => {
    const key = s.status_extra_info?.name || 'Unknown'
    if (!acc[key]) acc[key] = []
    acc[key].push(s)
    return acc
  }, {} as Record<string, TaigaUserStory[]>)

  const initials = memberName
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="relative z-10 w-[480px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium flex-shrink-0">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-800">{memberName}</p>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${roleStyle[roleLabel] || roleStyle.DEV}`}>
                  {roleLabel}
                </span>
              </div>
              <p className="text-xs text-gray-400">@{memberRolename}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
          <div className="px-4 py-3 text-center">
            <p className="text-lg font-semibold text-gray-700">{memberStories.length}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Total</p>
          </div>
          <div className="px-4 py-3 text-center">
            <p className="text-lg font-semibold text-amber-500">{ongoing.length}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">On Going</p>
          </div>
          <div className="px-4 py-3 text-center">
            <p className="text-lg font-semibold text-emerald-600">{done.length}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Done</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">

          {memberStories.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <p className="text-sm">No stories assigned</p>
              <p className="text-xs mt-1">dalam range yang dipilih</p>
            </div>
          )}

          {/* Ongoing section */}
          {ongoing.length > 0 && (
            <div className="px-5 pt-4 pb-2">
              <p className="text-[11px] font-medium text-amber-600 uppercase tracking-wider mb-3">
                On Going ({ongoing.length})
              </p>

              {/* Group by status */}
              {Object.entries(ongoingByStatus).map(([status, items]) => (
                <div key={status} className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusStyle[status] || 'bg-gray-100 text-gray-500'}`}>
                      {status}
                    </span>
                    <span className="text-[10px] text-gray-400">{items.length} stories</span>
                  </div>
                  <div className="space-y-2 pl-2">
                    {items.map(s => (
                      <StoryRow key={s.id} story={s} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Divider */}
          {ongoing.length > 0 && done.length > 0 && (
            <div className="mx-5 border-t border-gray-100 my-2" />
          )}

          {/* Done section */}
          {done.length > 0 && (
            <div className="px-5 pt-2 pb-4">
              <p className="text-[11px] font-medium text-emerald-600 uppercase tracking-wider mb-3">
                Done ({done.length})
              </p>
              <div className="space-y-2">
                {done.map(s => (
                  <StoryRow key={s.id} story={s} isDone />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StoryRow({ story, isDone = false }: { story: TaigaUserStory; isDone?: boolean }) {
  const statusName = story.status_extra_info?.name || ''

  return (
    <div className={`flex items-start justify-between gap-3 p-2.5 rounded-lg border transition-all group
      ${isDone
        ? 'border-gray-100 bg-gray-50/50 hover:bg-gray-100/50'
        : 'border-gray-100 bg-white hover:border-gray-200'
      }`}
    >
      <div className="flex items-start gap-2 flex-1 min-w-0">
        <span className="text-[11px] text-gray-400 flex-shrink-0 mt-0.5">#{story.ref}</span>
        <div className="flex-1 min-w-0">
          <p className={`text-xs leading-relaxed truncate ${isDone ? 'text-gray-400' : 'text-gray-700'}`}>
            {story.subject}
          </p>
          <div className="flex items-center gap-2 mt-1">
            {story.due_date && (
              <span className={`text-[10px] ${
                !isDone && new Date(story.due_date) < new Date()
                  ? 'text-red-500'
                  : 'text-gray-400'
              }`}>
                Due: {new Date(story.due_date).toLocaleDateString('id-ID', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}
              </span>
            )}
            {story.total_points !== null && (
              <span className="text-[10px] text-gray-400">
                {story.total_points} pts
              </span>
            )}
            {story.is_blocked && (
              <span className="text-[10px] text-red-500 font-medium">Blocked</span>
            )}
          </div>
        </div>
      </div>

      {/* Status badge */}
      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0
        ${statusStyle[statusName] || 'bg-gray-100 text-gray-500'}`}
      >
        {statusName}
      </span>
    </div>
  )
}