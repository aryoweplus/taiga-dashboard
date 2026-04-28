'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell, ReferenceLine
} from 'recharts'
import { MemberScore } from '@/types/taiga'

export default function ScoringChart({ scores }: { scores: MemberScore[] }) {
  const data = scores.map(m => ({
    name: m.full_name.split(' ')[0],
    score: m.totalScore,
    stories: m.doneStories,
  }))

  const maxScore = Math.max(...data.map(d => d.score), 0)

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-gray-400">
        No scoring data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} barSize={20}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
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
          formatter={(value, name) => {
            const label = name === 'score' ? 'Total Score' : 'Done Stories'
            const display = name === 'score' ? `${value} pts` : `${value} stories`
            return [display, label]
          }}
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
        />
        <ReferenceLine y={0} stroke="#e5e7eb" />
        <Bar dataKey="score" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={index}
              fill={
                entry.score >= maxScore * 0.8 ? '#10b981' :
                entry.score >= maxScore * 0.5 ? '#3b82f6' :
                entry.score >= 0 ? '#f59e0b' : '#ef4444'
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}