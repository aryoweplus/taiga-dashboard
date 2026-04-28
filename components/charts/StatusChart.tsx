'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { SprintSummary } from '@/types/taiga'

const COLORS = ['#10b981', '#f59e0b', '#ef4444']

export default function StatusChart({ summary }: { summary: SprintSummary }) {
  const data = [
    { name: 'Done', value: summary.done },
    { name: 'In Progress', value: summary.inProgress },
    { name: 'Blocked', value: summary.blocked },
  ].filter(d => d.value > 0)

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-gray-400">
        No data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={75}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [String(value), 'stories']}
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ fontSize: 11, color: '#6b7280' }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}