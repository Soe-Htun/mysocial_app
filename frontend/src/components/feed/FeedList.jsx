import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import PostCard from './PostCard'
import { useSocialStore } from '../../store/useSocialStore'

export default function FeedList({ feed: providedFeed, focusedPostId }) {
  const feedFromStore = useSocialStore((state) => state.feed)
  const searchTerm = useSocialStore((state) => state.postSearchTerm)
  const fetchFeed = useSocialStore((state) => state.fetchFeed)
  const loading = useSocialStore((state) => state.loadingFeed)
  const cursor = useSocialStore((state) => state.feedCursor)
  const hasMore = useSocialStore((state) => state.hasMoreFeed)
  const observer = useRef(null)
  const feed = providedFeed || feedFromStore

  useEffect(() => {
    fetchFeed()
  }, [fetchFeed])

  const visibleFeed = useMemo(() => {
    if (!searchTerm.trim()) return feed
    const query = searchTerm.toLowerCase()
    return feed.filter((post) =>
      [post.content, post.author?.name].some((field) => field?.toLowerCase().includes(query)),
    )
  }, [feed, searchTerm])

  const authorSuggestions = useMemo(() => {
    const map = new Map()
    feed.forEach((post) => {
      if (post.author?.id && !map.has(post.author.id)) {
        map.set(post.author.id, post.author)
      }
    })
    const list = Array.from(map.values())
    if (!searchTerm.trim()) return list.slice(0, 5)
    const query = searchTerm.toLowerCase()
    return list
      .filter((author) => author.name?.toLowerCase().includes(query))
      .slice(0, 5)
  }, [feed, searchTerm])

  const lastPostRef = useCallback(
    (node) => {
      if (loading || searchTerm.trim() || !hasMore) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          fetchFeed({ cursor })
        }
      })
      if (node) observer.current.observe(node)
    },
    [loading, cursor, fetchFeed, searchTerm, hasMore],
  )

  return (
    <div className="space-y-6">
      {visibleFeed.map((post, index) => {
        const shouldObserve = visibleFeed.length - index <= 5
        if (shouldObserve) {
          return (
            <PostCard
              ref={lastPostRef}
              key={post.id}
              post={post}
              highlight={focusedPostId && String(post.id) === focusedPostId}
            />
          )
        }
        return (
          <PostCard
            key={post.id}
            post={post}
            highlight={focusedPostId && String(post.id) === focusedPostId}
          />
        )
      })}
      {loading && <p className="text-sm text-slate-500">Loading more…</p>}
      {!loading && visibleFeed.length === 0 && (
        <div className="space-y-4 border border-dashed border-slate-200 rounded-3xl p-6 text-sm">
          <p className="text-slate-500">No posts match your search.</p>
          {authorSuggestions.length > 0 && (
            <div>
              <p className="text-xs uppercase font-semibold text-slate-400 mb-2">
                Suggested accounts
              </p>
              <div className="flex flex-wrap gap-3">
                {authorSuggestions.map((author) => (
                  <Link
                    key={author.id}
                    to={`/profile/${author.id}`}
                    className="px-3 py-1 rounded-full border border-slate-200 text-xs text-slate-700 hover:border-brand-200"
                  >
                    {author.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
