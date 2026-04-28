'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, CartesianGrid
} from 'recharts'
import { MemberSummary } from '@/types/taiga'

export default function MemberChart({ members }: { members: MemberSummary[] }) {
  const data = members.map(m => ({
    name: m.full_name.split(' ')[0], // Pakai first name saja
    Done: m.done,
    'In Progress': m.inProgress,
    Blocked: m.blocked,
  }))

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-gray-400">
        No data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} barSize={14}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
        />
        <Legend
          iconType="square"
          iconSize={8}
          formatter={(value) => (
            <span style={{ fontSize: 11, color: '#6b7280' }}>{value}</span>
          )}
        />
        <Bar dataKey="Done" fill="#10b981" radius={[3, 3, 0, 0]} />
        <Bar dataKey="In Progress" fill="#f59e0b" radius={[3, 3, 0, 0]} />
        <Bar dataKey="Blocked" fill="#ef4444" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}