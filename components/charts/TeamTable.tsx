import { MemberSummary } from '@/types/taiga'

const roleStyle: Record<string, string> = {
  DEV: 'bg-blue-50 text-blue-600',
  QA:  'bg-emerald-50 text-emerald-600',
  PM:  'bg-amber-50 text-amber-600',
}

export default function TeamTable({ members }: { members: MemberSummary[] }) {
  if (members.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-6 text-center">
        No member data available
      </p>
    )
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
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-medium flex-shrink-0">
                  {m.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <span className="text-gray-700 text-xs">{m.full_name}</span>
              </div>
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
  )
}