interface MetricCardProps {
  label: string
  value: number | string
  sub?: string
  color?: 'blue' | 'teal' | 'amber' | 'red'
}

const colorMap = {
  blue:  'text-blue-600',
  teal:  'text-emerald-600',
  amber: 'text-amber-600',
  red:   'text-red-500',
}

export default function MetricCard({ label, value, sub, color = 'blue' }: MetricCardProps) {
  return (
    <div className="bg-gray-100 rounded-lg px-4 py-3.5">
      <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5">
        {label}
      </p>
      <p className={`text-2xl font-medium ${colorMap[color]}`}>
        {value}
      </p>
      {sub && (
        <p className="text-[11px] text-gray-400 mt-1">{sub}</p>
      )}
    </div>
  )
}