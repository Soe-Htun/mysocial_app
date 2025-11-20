import { useMemo } from 'react'
import { X, Volume2 } from 'lucide-react'

export default function StoryViewer({
  story,
  onClose,
  onReact,
  canViewInsights,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
}) {
  const reactionCounts = useMemo(() => {
    const map = new Map()
    story.reactions?.forEach((item) => {
      map.set(item.reaction, (map.get(item.reaction) || 0) + 1)
    })
    return Array.from(map.entries())
  }, [story.reactions])

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="relative mx-auto flex h-full w-full max-w-4xl items-center justify-center px-4">
        <div
          className="relative flex h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-[32px] bg-slate-900 text-white shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <img
                src={
                  story.user?.avatar ||
                  `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(story.user?.name || 'Story')}`
                }
                alt={story.user?.name}
                className="h-12 w-12 rounded-full border-2 border-white/40 object-cover"
              />
              <div>
                <p className="text-sm font-semibold leading-tight">{story.user?.name}</p>
                <p className="text-xs text-white/70">
                  {new Date(story.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" className="rounded-full bg-white/10 p-2 hover:bg-white/20">
                <Volume2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="rounded-full bg-white/10 p-2 hover:bg-white/20"
                onClick={(event) => {
                  event.stopPropagation()
                  onClose()
                }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="relative flex-1 bg-black/60">
            {story.media ? (
              <img src={story.media} alt={story.caption} className="h-full w-full object-contain" />
            ) : (
              <div className="flex h-full items-center justify-center px-6 text-center text-lg font-semibold">
                {story.caption || 'Shared an update'}
              </div>
            )}
            <button
              type="button"
              className="absolute inset-y-0 left-0 w-1/3 focus-visible:outline-none"
              onClick={(event) => {
                event.stopPropagation()
                if (hasPrev) onPrev?.()
              }}
              aria-label="Previous story"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 w-1/3 focus-visible:outline-none"
              onClick={(event) => {
                event.stopPropagation()
                if (hasNext) {
                  onNext?.()
                } else {
                  onClose()
                }
              }}
              aria-label="Next story"
            />
          </div>

          <div className="space-y-4 px-6 py-4">
            {story.caption && <p className="text-sm text-white/90">{story.caption}</p>}
            <div className="flex flex-wrap gap-2 text-sm">
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                {reactionCounts.length === 0 ? (
                  <span className="text-white/70">No reactions yet</span>
                ) : (
                  reactionCounts.map(([emoji, count]) => (
                    <span key={emoji} className="flex items-center gap-1">
                      {emoji}
                      <span className="text-xs text-white/80">{count}</span>
                    </span>
                  ))
                )}
              </div>
              <div className="ml-auto flex gap-2">
                {['👍', '❤️', '🔥', '👏'].map((emoji) => (
                  <button
                    key={emoji}
                    className="rounded-full bg-white/15 px-3 py-1 text-sm font-semibold text-white backdrop-blur hover:bg-white/30"
                    onClick={() => onReact(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            {canViewInsights ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed">
                <p className="font-semibold text-white">Viewers · {story.views?.length || 0}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-white/80">
                  {story.views?.length
                    ? story.views.slice(0, 6).map((viewer) => (
                        <span key={viewer.id} className="rounded-full bg-white/10 px-3 py-1 text-xs">
                          {viewer.name}
                        </span>
                      ))
                    : 'No viewers yet.'}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-white/70">
                Only you can see viewers for your own stories.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
