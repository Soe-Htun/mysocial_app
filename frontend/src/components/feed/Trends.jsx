import { ArrowUpRight, Users } from 'lucide-react'
import { useSocialStore } from '../../store/useSocialStore'

export default function Trends() {
  const trends = useSocialStore((state) => state.trends)

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-slate-900">Trending discussions</p>
        <ArrowUpRight className="h-5 w-5 text-slate-400" />
      </div>
      <ul className="mt-4 space-y-3">
        {trends.map((trend) => (
          <li key={trend.id} className="flex items-center justify-between text-sm">
            <div>
              <p className="font-medium text-slate-700">{trend.label}</p>
              <p className="text-slate-400">{trend.count}</p>
            </div>
            <button className="text-brand-600 text-xs font-medium">View</button>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500">
        <Users className="h-4 w-4" />
        Invite peers to keep your feed fresh.
      </div>
    </div>
  )
}
