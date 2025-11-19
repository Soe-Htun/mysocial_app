import { useState } from 'react'
import { useSocialStore } from '../../store/useSocialStore'
import { useAuth } from '../../providers/AuthProvider'
import StoryViewer from './StoryViewer'

export default function StoryStrip() {
  const stories = useSocialStore((state) => state.stories)
  const markStoryViewed = useSocialStore((state) => state.markStoryViewed)
  const reactToStory = useSocialStore((state) => state.reactToStory)
  const { user } = useAuth()
  const [activeStoryId, setActiveStoryId] = useState(null)

  if (!stories?.length) return null

  const activeStory = stories.find((story) => story.id === activeStoryId)

  return (
    <div className="space-y-4">
      <div className="flex gap-3 overflow-x-auto pb-2">
        {stories.map((story) => (
          <button
            key={story.id}
            className="w-28 h-40 rounded-3xl bg-white border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-3 shrink-0"
            onClick={() => {
              setActiveStoryId(story.id)
              markStoryViewed(story.id, user)
            }}
          >
            <div className={`h-14 w-14 rounded-full border-2 ${story.views?.length ? 'border-slate-200' : 'border-brand-400'} p-0.5`}>
              <img
                src={story.user?.avatar}
                alt={story.user?.name}
                className="h-full w-full rounded-full object-cover"
              />
            </div>
            <span className="text-sm font-medium text-slate-600">{story.user?.name}</span>
          </button>
        ))}
      </div>
      {activeStory && (
        <StoryViewer
          story={activeStory}
          onClose={() => setActiveStoryId(null)}
          onReact={(emoji) => reactToStory(activeStory.id, user, emoji)}
        />
      )}
    </div>
  )
}
