import { forwardRef, useMemo, useState, useCallback } from 'react'
import { MessageCircle, Send, ThumbsUp, CornerDownRight, Sparkles } from 'lucide-react'
import { useSocialStore } from '../../store/useSocialStore'
import { useAuth } from '../../providers/AuthProvider'
import { formatPostTimestamp } from '../../utils/formatDate'
import ReactionList from './ReactionList'
import { Link } from 'react-router-dom'
import { REACTION_OPTIONS, getReactionMeta } from '../../constants/reactions'

const PostCard = forwardRef(function PostCard({ post, highlight }, ref) {
  const addComment = useSocialStore((state) => state.addComment)
  const toggleReaction = useSocialStore((state) => state.toggleReaction)
  const addReply = useSocialStore((state) => state.addReply)
  const [comment, setComment] = useState('')
  const [showCommentBox, setShowCommentBox] = useState(false)
  const [showLikers, setShowLikers] = useState(false)
  const [replyBoxes, setReplyBoxes] = useState({})
  const [expandedComments, setExpandedComments] = useState(false)
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const { user } = useAuth()

  const reactionStats = useMemo(() => {
    const totals = REACTION_OPTIONS.map((option) => ({
      ...option,
      count: post.reactions?.[option.id.toLowerCase()] || 0,
    })).filter((item) => item.count > 0)
    return {
      total: totals.reduce((sum, item) => sum + item.count, 0),
      breakdown: totals.sort((a, b) => b.count - a.count).slice(0, 3),
    }
  }, [post.reactions])

  const activeReaction = getReactionMeta(post.viewerReaction)

  const handleComment = async (event) => {
    event.preventDefault()
    if (!comment.trim()) return
    await addComment(post.id, comment, {
      id: user?.id || 0,
      name: user?.name || 'Guest User',
      avatar:
        user?.avatar ||
        `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(user?.name || 'Guest User')}`,
    })
    setComment('')
  }

  const handleReactionSelect = useCallback(
    (type) => {
      const isClearing = !type && Boolean(post.viewerReaction)
      const targetType = (type || post.viewerReaction || 'LIKE').toUpperCase()
      toggleReaction(post.id, targetType, { remove: isClearing })
      setShowReactionPicker(false)
    },
    [post.id, post.viewerReaction, toggleReaction],
  )

  const handleQuickLike = useCallback(() => {
    const nextType = post.viewerReaction === 'LIKE' ? null : 'LIKE'
    handleReactionSelect(nextType)
  }, [post.viewerReaction, handleReactionSelect])

  const reactionPeopleSummary = useMemo(() => {
    const people = post.likedBy || []
    if (!people.length) return ''
    const names = people
      .map((person) => (person.id === user?.id ? 'You' : person.name))
      .filter(Boolean)
    if (!names.length) return ''
    if (names.length === 1) return names[0]
    if (names.length === 2) return `${names[0]} and ${names[1]}`
    return `${names[0]}, ${names[1]} and ${names.length - 2} others`
  }, [post.likedBy, user?.id])

  return (
    <article
      ref={ref}
      id={`post-${post.id}`}
      className={`bg-white rounded-3xl border ${
        highlight ? 'border-brand-300 ring-2 ring-brand-200' : 'border-slate-100'
      } shadow-sm p-6 space-y-4`}
    >
      <div className="flex items-center gap-3">
        <Link to={`/profile/${post.author?.id || 'me'}`} className="flex items-center gap-3">
          <img
            src={
              post.author?.avatar ||
              `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(post.author?.name || 'Guest User')}`
            }
            alt={post.author?.name}
            className="h-10 w-10 rounded-full object-cover border border-slate-100"
          />
          <div>
            <p className="font-semibold text-slate-900">{post.author?.name}</p>
          </div>
        </Link>
        <div className="flex-1">
          <p className="text-xs text-slate-400 mt-0.5">{formatPostTimestamp(post.createdAt)}</p>
        </div>
      </div>

      <p className="text-slate-700 leading-relaxed">{post.content}</p>

      {post.media && (
        <div className="rounded-2xl overflow-hidden border border-slate-100">
          <img src={post.media} alt="Post media" className="w-full object-cover" />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
        <div
          className="relative flex items-center gap-2"
          onMouseEnter={() => setShowReactionPicker(true)}
          onMouseLeave={() => setShowReactionPicker(false)}
          onFocus={() => setShowReactionPicker(true)}
          onBlur={() => setShowReactionPicker(false)}
        >
          <button
            type="button"
            onClick={handleQuickLike}
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-brand-600 ${
              activeReaction ? activeReaction.color : ''
            }`}
          >
            {activeReaction ? (
              <span className="text-xl leading-none">{activeReaction.emoji}</span>
            ) : (
              <ThumbsUp size={16} />
            )}
            <span>{activeReaction?.label || 'React'}</span>
          </button>
          <button
            type="button"
            aria-label="Choose a reaction"
            className="p-1 rounded-full text-slate-400 hover:text-brand-600 md:hidden"
            onClick={(event) => {
              event.stopPropagation()
              setShowReactionPicker((prev) => !prev)
            }}
          >
            <Sparkles size={16} />
          </button>
          {showReactionPicker && (
            <div
              className="pointer-events-auto absolute left-1/2 bottom-[calc(100%-4px)] z-10 -translate-x-1/2 flex gap-2 rounded-3xl border border-slate-100 bg-white/95 px-3 py-2 shadow-2xl"
              onMouseEnter={() => setShowReactionPicker(true)}
              onMouseLeave={() => setShowReactionPicker(false)}
            >
              {REACTION_OPTIONS.map((reaction) => (
                <button
                  type="button"
                  key={reaction.id}
                  className="flex flex-col items-center gap-1 rounded-2xl px-2 py-1 text-[10px] font-semibold text-slate-500 transition-all hover:-translate-y-1 hover:text-brand-700 focus-visible:outline-none"
                  onClick={(event) => {
                    event.stopPropagation()
                    handleReactionSelect(reaction.id)
                  }}
                >
                  <span className="text-[26px] drop-shadow-sm">{reaction.emoji}</span>
                  <span>{reaction.label}</span>
                </button>
              ))}
              {post.viewerReaction && (
                <button
                  type="button"
                  className="flex flex-col items-center gap-1 rounded-2xl px-2 py-1 text-[10px] font-semibold text-slate-400 transition-all hover:-translate-y-1 hover:text-slate-600"
                  onClick={(event) => {
                    event.stopPropagation()
                    handleReactionSelect(null)
                  }}
                >
                  <span className="text-xl">✖️</span>
                  <span>Clear</span>
                </button>
              )}
            </div>
          )}
        </div>
        <button
          type="button"
          className="flex items-center gap-2 text-left hover:underline"
          onClick={() => reactionStats.total > 0 && setShowLikers(true)}
        >
              {reactionStats.breakdown.length > 0 ? (
                <span className="flex -space-x-2">
                  {reactionStats.breakdown.map((reaction) => (
                    <span
                      key={reaction.id}
                      className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white bg-slate-100 text-xs shadow-sm"
                    >
                      {reaction.emoji}
                    </span>
                  ))}
                </span>
              ) : (
                <ThumbsUp size={16} className="text-slate-400" />
              )}
          <span>{reactionPeopleSummary || (reactionStats.total ? `${reactionStats.total} reactions` : 'No reactions yet')}</span>
        </button>
        <button
          type="button"
          onClick={() => setShowCommentBox((prev) => !prev)}
          className={`flex items-center gap-1 transition-colors ${
            showCommentBox ? 'text-brand-600' : 'hover:text-brand-600'
          }`}
        >
          <MessageCircle size={16} />
          {post.comments?.length || 0} comments
        </button>
      </div>

      <div className="space-y-3">
        {(expandedComments ? post.comments : post.comments?.slice(0, 2))?.map((item) => (
          <div key={item.id} className="bg-slate-50 rounded-2xl px-3 py-2 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">{item.author?.name}</p>
                <p className="text-xs text-slate-400">{item.createdAt}</p>
              </div>
              <button
                className="text-xs text-brand-600 font-medium"
                onClick={() =>
                  setReplyBoxes((prev) => {
                    const next = { ...prev }
                    if (next[item.id] !== undefined) {
                      delete next[item.id]
                    } else {
                      next[item.id] = ''
                    }
                    return next
                  })
                }
              >
                Reply
              </button>
            </div>
            <p className="text-sm text-slate-600">{item.text}</p>
            {item.replies?.length > 0 && (
              <div className="space-y-2 pl-4 border-l border-slate-200">
                {item.replies.map((reply) => (
                  <div key={reply.id} className="text-sm text-slate-600 flex gap-2 items-start">
                    <CornerDownRight className="h-4 w-4 text-slate-400 mt-1" />
                    <div>
                      <p className="font-medium text-slate-700">{reply.author?.name}</p>
                      <p>{reply.text}</p>
                      <p className="text-xs text-slate-400">{reply.createdAt}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {replyBoxes[item.id] !== undefined && (
              <form
                className="flex items-center gap-2 pt-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  if (!replyBoxes[item.id]?.trim()) return
                  addReply(post.id, item.id, replyBoxes[item.id], {
                    id: user?.id || 0,
                    name: user?.name || 'You',
                    avatar:
                      user?.avatar ||
                      `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(
                        user?.name || 'You',
                      )}`,
                  })
                  setReplyBoxes((prev) => ({ ...prev, [item.id]: '' }))
                }}
              >
                <input
                  className="flex-1 rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Write a reply…"
                  value={replyBoxes[item.id] || ''}
                  onChange={(event) =>
                    setReplyBoxes((prev) => ({ ...prev, [item.id]: event.target.value }))
                  }
                />
                <button type="submit" className="text-sm text-brand-600 font-medium">
                  Reply
                </button>
              </form>
            )}
          </div>
        ))}
      </div>

      {post.comments?.length > 2 && !expandedComments && (
        <button
          className="text-sm text-brand-600 font-medium"
          onClick={() => setExpandedComments(true)}
        >
          View all {post.comments.length} comments
        </button>
      )}

      {showCommentBox && (
        <form onSubmit={handleComment} className="flex items-center gap-3">
          <input
            className="flex-1 rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-100"
            placeholder="Add a thoughtful comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
          <button
            type="submit"
            className="rounded-2xl bg-brand-600 text-white px-4 py-2 text-sm font-medium flex items-center gap-2"
          >
            Comment
            <Send size={16} />
          </button>
        </form>
      )}

      <ReactionList visible={showLikers} onClose={() => setShowLikers(false)} people={post.likedBy} />
    </article>
  )
})

export default PostCard
