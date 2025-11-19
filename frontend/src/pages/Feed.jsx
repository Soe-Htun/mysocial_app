import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import StoryStrip from '../components/feed/StoryStrip'
import CreatePost from '../components/feed/CreatePost'
import FeedList from '../components/feed/FeedList'
import { useSocialStore } from '../store/useSocialStore'

export default function Feed() {
  const fetchFeed = useSocialStore((state) => state.fetchFeed)
  const loadingFeed = useSocialStore((state) => state.loadingFeed)
  const feed = useSocialStore((state) => state.feed)
  const [searchParams, setSearchParams] = useSearchParams()
  const focusedPostId = searchParams.get('post')

  useEffect(() => {
    fetchFeed()
  }, [fetchFeed])

  useEffect(() => {
    if (!focusedPostId) return
    const timer = setTimeout(() => {
      const element = document.getElementById(`post-${focusedPostId}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.delete('post')
        return next
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [focusedPostId, setSearchParams])

  return (
    <div className="flex flex-col gap-6 pt-6">
      <StoryStrip />
      <CreatePost />
      {loadingFeed && <p className="text-sm text-slate-500">Refreshing your feed...</p>}
      <FeedList focusedPostId={focusedPostId} feed={feed} />
    </div>
  )
}
