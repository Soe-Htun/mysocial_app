import { useMemo } from 'react'

export default function StoryViewer({ story, onClose, onReact }) {
  const reactionCounts = useMemo(() => {
    const map = new Map()
    story.reactions?.forEach((item) => {
      map.set(item.reaction, (map.get(item.reaction) || 0) + 1)
    })
    return Array.from(map.entries())
  }, [story.reactions])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl h-[80vh] flex flex-col overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <p className="text-sm font-medium text-slate-900">{story.user?.name}</p>
            <p className="text-xs text-slate-400">
              {new Date(story.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <button className="text-sm text-slate-500 hover:text-slate-700" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="flex-1 flex flex-col md:flex-row">
          <div className="flex-1 bg-slate-900 flex items-center justify-center">
            {story.media ? (
              <img src={story.media} alt={story.caption} className="max-h-full max-w-full object-contain" />
            ) : (
              <p className="text-white text-center px-6">{story.caption}</p>
            )}
          </div>
          <div className="w-full md:w-64 border-t md:border-l border-slate-100 p-4 space-y-4 overflow-y-auto">
            <div>
              <p className="text-sm font-semibold text-slate-900">Views ({story.views?.length || 0})</p>
              <ul className="mt-2 space-y-2 text-sm text-slate-600">
                {story.views?.map((viewer) => (
                  <li key={viewer.id}>{viewer.name}</li>
                ))}
                {!story.views?.length && <li className="text-slate-400">No viewers yet.</li>}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Reactions</p>
              <div className="mt-2 flex flex-wrap gap-2 text-sm">
                {reactionCounts.length === 0 && <span className="text-slate-400">No reactions yet.</span>}
                {reactionCounts.map(([emoji, count]) => (
                  <span key={emoji} className="px-2 py-1 rounded-full bg-slate-100">
                    {emoji} {count}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                {['👍', '❤️', '🔥'].map((emoji) => (
                  <button
                    key={emoji}
                    className="px-3 py-1 rounded-full border border-slate-200 text-sm"
                    onClick={() => onReact(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        {story.caption && (
          <div className="px-6 py-4 border-t border-slate-100 text-sm text-slate-700">{story.caption}</div>
        )}
      </div>
    </div>
  )
}
