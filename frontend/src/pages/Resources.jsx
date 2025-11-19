import { BookOpen } from 'lucide-react'

const resources = [
  { id: 1, title: 'Build high-signal communities', summary: 'Playbook for starting meaningful niche communities.', link: '#' },
  { id: 2, title: 'Content cadence templates', summary: 'Lightweight Notion templates to plan your posting flywheel.', link: '#' },
]

export default function Resources() {
  return (
    <div className="pt-6 space-y-4">
      <div className="flex items-center gap-2 text-slate-900">
        <BookOpen className="h-5 w-5 text-brand-600" />
        <h1 className="text-2xl font-semibold">Creator resources</h1>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {resources.map((resource) => (
          <article key={resource.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-2">
            <p className="text-lg font-semibold text-slate-900">{resource.title}</p>
            <p className="text-sm text-slate-500">{resource.summary}</p>
            <button className="text-sm font-medium text-brand-600">Open</button>
          </article>
        ))}
      </div>
    </div>
  )
}
