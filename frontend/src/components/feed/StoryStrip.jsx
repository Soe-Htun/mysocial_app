import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { useSocialStore } from '../../store/useSocialStore'
import { useAuth } from '../../providers/AuthProvider'
import StoryViewer from './StoryViewer'
import CreateStoryModal from './CreateStoryModal'

const buildPreviewStyle = (story) =>
  story?.media
    ? {
        backgroundImage: `url(${story.media})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : { backgroundImage: 'linear-gradient(135deg, #f3f4f6, #e0f2fe)' }

export default function StoryStrip() {
  const stories = useSocialStore((state) => state.stories)
  const markStoryViewed = useSocialStore((state) => state.markStoryViewed)
  const reactToStory = useSocialStore((state) => state.reactToStory)
  const createStory = useSocialStore((state) => state.createStory)
  const { user } = useAuth()
  const [activeStoryIndex, setActiveStoryIndex] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  if (!stories?.length && !user) return null

  const viewerId = user?.id || null

  const orderedStories = useMemo(() => {
    const list = stories || []
    if (!viewerId) return list
    const mine = list.filter((story) => story.user?.id === viewerId)
    const others = list.filter((story) => story.user?.id !== viewerId)
    return [...mine, ...others]
  }, [stories, viewerId])

  const userStoryIndex = viewerId
    ? orderedStories.findIndex((story) => story.user?.id === viewerId)
    : -1
  const userStory = userStoryIndex >= 0 ? orderedStories[userStoryIndex] : null

  const activeStory = activeStoryIndex != null ? orderedStories[activeStoryIndex] : null

  const handleCreateStory = ({ caption, media }) => {
    if (!user?.id) return
    createStory({ user, caption, media })
    setShowCreateModal(false)
  }

  const openStoryAtIndex = (index) => {
    if (index < 0 || index >= orderedStories.length) return
    const story = orderedStories[index]
    setActiveStoryIndex(index)
    markStoryViewed(story.id, user)
  }

  const renderYourCard = () => {
    if (!user) return null
    if (!userStory) {
      return (
        <button
          type="button"
          className="flex h-44 w-28 shrink-0 flex-col items-center justify-center gap-3 overflow-hidden rounded-[1.5rem] border border-dashed border-slate-300 bg-gradient-to-b from-white to-slate-50 text-center text-xs font-semibold text-slate-600 shadow-inner"
          onClick={() => setShowCreateModal(true)}
        >
          <span className="rounded-full bg-white p-3 text-brand-600 shadow">
            <Plus className="h-6 w-6" />
          </span>
          <div className="px-3">
            <p className="text-sm font-semibold">Create story</p>
            <p className="text-[11px] text-slate-400">Share a moment</p>
          </div>
        </button>
      )
    }

    return (
      <div
        role="button"
        tabIndex={0}
        aria-label="View your story"
        className="relative h-44 w-28 shrink-0 overflow-hidden rounded-[1.5rem] text-white shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
        style={buildPreviewStyle(userStory)}
        onClick={() => openStoryAtIndex(userStoryIndex)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            openStoryAtIndex(userStoryIndex)
          }
        }}
      >
        <span className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/70" />
        <div className="absolute inset-0 p-3 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <img
              src={
                userStory.user?.avatar ||
                `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(userStory.user?.name || 'You')}`
              }
              alt="You"
              className="h-10 w-10 rounded-full border-2 border-white object-cover"
            />
            <span className="text-xs font-semibold uppercase tracking-wide text-white/80">Your story</span>
          </div>
          <div className="space-y-2">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-1 rounded-full bg-white/80 py-1 text-xs font-semibold text-slate-800 hover:bg-white"
              onClick={(event) => {
                event.stopPropagation()
                setShowCreateModal(true)
              }}
            >
              <Plus className="h-3 w-3" />
              Add story
            </button>
            <p className="text-[11px] text-white/80">
              {new Date(userStory.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const renderStoryCard = (story, index) => {
    const hasViewed = story.views?.some((view) => view.id === viewerId)
    return (
      <div
        key={story.id}
        role="button"
        tabIndex={0}
        aria-label={`View story from ${story.user?.name || 'friend'}`}
        className="relative h-44 w-28 shrink-0 overflow-hidden rounded-[1.5rem] text-white shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
        style={buildPreviewStyle(story)}
        onClick={() => openStoryAtIndex(index)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') openStoryAtIndex(index)
        }}
      >
        <span className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/20 to-black/70" />
        <div
          className={`absolute left-3 top-3 flex h-12 w-12 items-center justify-center rounded-full border-2 ${
            hasViewed ? 'border-white/40' : 'border-brand-400'
          } bg-black/30 backdrop-blur`}
        >
          <img
            src={
              story.user?.avatar ||
              `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(story.user?.name || 'Story')}`
            }
            alt={story.user?.name}
            className="h-10 w-10 rounded-full object-cover ring-1 ring-white/60"
          />
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-sm font-semibold leading-snug drop-shadow">
            {story.user?.id === viewerId ? 'Your story' : story.user?.name || 'Story'}
          </p>
          <p className="text-[11px] text-white/80">
            {new Date(story.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 overflow-x-auto pb-2">
        {renderYourCard()}
        {orderedStories.map((story, index) => {
          if (viewerId && story.user?.id === viewerId) return null
          return renderStoryCard(story, index)
        })}
      </div>
      {activeStory && (
        <StoryViewer
          story={activeStory}
          onClose={() => setActiveStoryIndex(null)}
          onReact={(emoji) => reactToStory(activeStory.id, user, emoji)}
          canViewInsights={activeStory.user?.id === viewerId}
          onNext={() => {
            const nextIndex = (activeStoryIndex ?? 0) + 1
            if (nextIndex < orderedStories.length) {
              openStoryAtIndex(nextIndex)
            } else {
              setActiveStoryIndex(null)
            }
          }}
          onPrev={() => {
            const prevIndex = (activeStoryIndex ?? 0) - 1
            if (prevIndex >= 0) {
              openStoryAtIndex(prevIndex)
            }
          }}
          hasNext={(activeStoryIndex ?? -1) + 1 < orderedStories.length}
          hasPrev={(activeStoryIndex ?? 0) > 0}
        />
      )}
      <CreateStoryModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateStory}
      />
    </div>
  )
}
