import { create } from 'zustand'
import { socialApi } from '../api/social'
import { REACTION_OPTIONS } from '../constants/reactions'

const newId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`

const formatTime = (timestamp) => {
  try {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return 'now'
  }
}

const sampleUsers = [
  {
    id: 1,
    name: 'Jane Doe',
    headline: 'Product Designer @ Aurora Labs',
    avatar: 'https://i.pravatar.cc/150?img=47',
    cover: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
    location: 'San Francisco, CA',
  },
  {
    id: 2,
    name: 'Marcus Li',
    headline: 'Software Engineer @ Orbit',
    avatar: 'https://i.pravatar.cc/150?img=12',
    location: 'New York, NY',
  },
]

const BASE_REACTIONS = REACTION_OPTIONS.reduce((acc, option) => {
  acc[option.id.toLowerCase()] = 0
  return acc
}, {})

const normalizePost = (post = {}) => {
  const viewerReaction = post.viewerReaction || (post.viewerReacted ? 'LIKE' : null)
  return {
    ...post,
    reactions: { ...BASE_REACTIONS, ...(post.reactions || {}) },
    viewerReaction,
    viewerReacted: Boolean(viewerReaction),
    likedBy:
      post.likedBy?.map((person) => ({
        ...person,
        reaction: (person.reaction || person.type || 'LIKE').toUpperCase(),
      })) || [],
    comments:
      post.comments?.map((comment) => ({
        ...comment,
        replies: comment.replies || [],
      })) || [],
  }
}

const fallbackPosts = [
  {
    id: 'p1',
    author: sampleUsers[0],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    content:
      'Thrilled to share a sneak peek of the new design system we have been building for Aurora Labs. Accessibility first, with a ton of delightful motion. Feedback welcome!',
    media:
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=60',
    reactions: { like: 128, celebrate: 9 },
    viewerReacted: false,
    likedBy: [
      { ...sampleUsers[1], reaction: 'LOVE' },
      { ...sampleUsers[0], id: 'viewer', name: 'You', reaction: 'WOW' },
    ],
    comments: [
      {
        id: 'c1',
        author: sampleUsers[1],
        text: 'This looks great Jane. Curious how you approached typography scaling?',
        createdAt: '1 hour ago',
        replies: [
          {
            id: 'r1',
            author: sampleUsers[0],
            text: 'Thank you! Mixing a fluid type scale with clamp().',
            createdAt: '45 minutes ago',
          },
        ],
      },
    ],
  },
  {
    id: 'p2',
    author: sampleUsers[1],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    content:
      'Pair programmed a tiny AI agent that triages customer issues based on sentiment. Already saving our support team 6 hrs/week.',
    reactions: { like: 89 },
    viewerReacted: false,
    likedBy: [{ ...sampleUsers[0], reaction: 'LIKE' }],
    comments: [],
  },
]

const fallbackStories = [
  {
    id: 'story-1',
    user: sampleUsers[0],
    media:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=60',
    caption: 'Sneak peek of the new design system animations.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    views: [],
    reactions: [],
  },
  {
    id: 'story-2',
    user: sampleUsers[1],
    media:
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=60',
    caption: 'Pairing on some AI experiments today.',
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    views: [],
    reactions: [],
  },
]

const fallbackNotifications = [
  {
    id: 'n1',
    message: 'Nora Winters reacted to your update',
    time: '10m ago',
    read: false,
    type: 'reaction',
    postId: 'p1',
  },
  {
    id: 'n2',
    message: 'Marcus Li commented on your photo',
    time: '1h ago',
    read: true,
    type: 'comment',
    postId: 'p2',
  },
  {
    id: 'n3',
    message: 'Jane Doe shared your announcement',
    time: '2h ago',
    read: false,
    type: 'share',
    postId: 'p1',
  },
]

const fallbackMessages = []

const fallbackTrends = [
  { id: 't1', label: 'Generative UI', count: '42k mentions' },
  { id: 't2', label: '#OSSFriday', count: '12k mentions' },
  { id: 't3', label: 'Product Market Fit', count: '7k mentions' },
]

const uniqueById = (items = []) => {
  const map = new Map()
  items.forEach((item) => {
    if (!map.has(item.id)) {
      map.set(item.id, item)
    }
  })
  return Array.from(map.values())
}

export const useSocialStore = create((set, get) => ({
  feed: fallbackPosts.map(normalizePost),
  postSearchTerm: '',
  stories: fallbackStories,
  notifications: fallbackNotifications,
  messages: [],
  messagesCursor: null,
  trends: fallbackTrends,
  loadingFeed: false,
  feedCursor: null,
  hasMoreFeed: true,
  activeConversationId: null,
  conversationReads: {},

  fetchFeed: async ({ cursor, reset } = {}) => {
    const state = get()
    if (reset) {
      set({ feedCursor: null, hasMoreFeed: true })
    }
    if (state.loadingFeed || (!cursor && state.postSearchTerm.trim())) return
    if (cursor && !state.hasMoreFeed) return
    set({ loadingFeed: true })
    try {
      const params = { limit: 20 }
      if (cursor) params.cursor = cursor
      const posts = await socialApi.listPosts({ params })
      const normalized = posts.map(normalizePost)
      set((prev) => ({
        feed: cursor ? uniqueById([...prev.feed, ...normalized]) : normalized,
        feedCursor: posts[posts.length - 1]?.id || prev.feedCursor,
        hasMoreFeed: posts.length === params.limit,
      }))
    } catch (error) {
      console.info('Using fallback feed data', error.message)
      if (!cursor) {
        set({
          feed: fallbackPosts.map(normalizePost),
          hasMoreFeed: false,
        })
      }
    } finally {
      set({ loadingFeed: false })
    }
  },

  setPostSearchTerm: (term) =>
    set((state) => {
      if (term === state.postSearchTerm) return {}
      return { postSearchTerm: term }
    }),

  createPost: async (payload) => {
    const optimisticPost = {
      id: newId(),
      createdAt: new Date().toISOString(),
      reactions: { ...BASE_REACTIONS },
      comments: [],
      viewerReacted: false,
      viewerReaction: null,
      likedBy: [],
      ...payload,
      author: payload.author || sampleUsers[0],
    }
    set((state) => ({ feed: [optimisticPost, ...state.feed] }))
    try {
      const created = await socialApi.createPost({
        content: payload.content,
        media: payload.media,
      })
      set((state) => ({
        feed: state.feed.map((post) =>
          post.id === optimisticPost.id ? normalizePost(created) : post,
        ),
      }))
    } catch (error) {
      console.error('Unable to create post, rolling back', error.message)
      set((state) => ({ feed: state.feed.filter((post) => post.id !== optimisticPost.id) }))
    }
  },

  addComment: async (postId, text, author) => {
    if (!text?.trim()) return
    const comment = {
      id: newId(),
      author: author || sampleUsers[1],
      text,
      createdAt: 'moments ago',
      replies: [],
    }
    set((state) => ({
      feed: state.feed.map((post) =>
        post.id === postId ? { ...post, comments: [...post.comments, comment] } : post,
      ),
    }))
    try {
      await socialApi.addComment(postId, { text })
    } catch (error) {
      console.error('Unable to sync comment', error.message)
    }
  },

  addReply: async (postId, commentId, text, author) => {
    if (!text?.trim()) return
    const reply = {
      id: newId(),
      author: author || sampleUsers[1],
      text,
      createdAt: 'moments ago',
    }
    set((state) => ({
      feed: state.feed.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments.map((comment) =>
                comment.id === commentId
                  ? { ...comment, replies: [...(comment.replies || []), reply] }
                  : comment,
              ),
            }
          : post,
      ),
    }))
  },

  toggleReaction: async (postId, type = 'LIKE', options = {}) => {
    const normalizedType = type ? type.toUpperCase() : null
    const remove = Boolean(options.remove)
    const currentPost = get().feed.find((post) => post.id === postId)
    const apiType = remove
      ? currentPost?.viewerReaction || normalizedType || 'LIKE'
      : normalizedType || 'LIKE'
    let snapshot = null
    set((state) => ({
      feed: state.feed.map((post) => {
        if (post.id !== postId) return post
        snapshot = JSON.parse(JSON.stringify(post))
        const reactions = { ...post.reactions }
        const previousKey = post.viewerReaction ? post.viewerReaction.toLowerCase() : null
        if (previousKey && reactions[previousKey] !== undefined) {
          reactions[previousKey] = Math.max(0, (reactions[previousKey] || 0) - 1)
        }
        let nextReaction = null
        if (!remove && normalizedType && normalizedType !== post.viewerReaction) {
          const key = normalizedType.toLowerCase()
          reactions[key] = (reactions[key] || 0) + 1
          nextReaction = normalizedType
        }
        return {
          ...post,
          reactions,
          viewerReaction: nextReaction,
          viewerReacted: Boolean(nextReaction),
        }
      }),
    }))
    try {
      const updatedPost = await socialApi.toggleReaction(postId, apiType)
      set((state) => ({
        feed: state.feed.map((post) =>
          post.id === postId ? normalizePost(updatedPost) : post,
        ),
      }))
    } catch (error) {
      set((state) => ({
        feed: state.feed.map((post) =>
          post.id === postId && snapshot ? snapshot : post,
        ),
      }))
      console.error('Unable to sync reaction', error.message)
    }
  },

  fetchNotifications: async () => {
    try {
      const data = await socialApi.listNotifications()
      set({
        notifications: data.map((item) => ({
          id: item.id,
          message: item.message,
          time: formatTime(item.createdAt),
          read: item.read,
          type: item.type ? item.type.toLowerCase() : undefined,
          postId: item.postId,
        })),
      })
    } catch (error) {
      console.info('Using fallback notifications', error.message)
      set({ notifications: fallbackNotifications })
    }
  },

  markNotificationRead: async (notificationId) => {
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === notificationId ? { ...notification, read: true } : notification,
      ),
    }))
    try {
      await socialApi.markNotificationRead(notificationId)
    } catch (error) {
      console.error('Unable to update notification', error.message)
    }
  },

  fetchMessages: async ({ cursor } = {}) => {
    try {
      const params = cursor ? { params: { since: cursor } } : undefined
      const data = await socialApi.listMessages(params)
      set((state) => {
        const merged = new Map(state.messages.map((message) => [message.id, message]))
        data.forEach((message) => {
          merged.set(message.id, {
            id: message.id,
            sender: message.sender || { name: 'Teammate', avatar: 'https://i.pravatar.cc/100?img=32' },
            recipient: message.recipient,
            body: message.body,
            time: formatTime(message.createdAt),
            recipientId: message.recipientId,
            createdAt: message.createdAt,
          })
        })
        const nextMessages = Array.from(merged.values()).sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        )
        return {
          messages: nextMessages,
          messagesCursor: nextMessages[nextMessages.length - 1]?.createdAt || state.messagesCursor,
          conversationReads: state.conversationReads,
        }
      })
    } catch (error) {
      console.info('Using fallback messages', error.message)
      set({ messages: [] })
    }
  },

  markStoryViewed: (storyId, viewer) => {
    if (!viewer?.id) return
    set((state) => ({
      stories: state.stories.map((story) =>
        story.id === storyId
          ? {
              ...story,
              views: story.views?.some((view) => view.id === viewer.id)
                ? story.views
                : [...(story.views || []), { id: viewer.id, name: viewer.name, avatar: viewer.avatar }],
            }
          : story,
      ),
    }))
  },

  reactToStory: (storyId, viewer, reaction) => {
    if (!viewer?.id) return
    set((state) => ({
      stories: state.stories.map((story) =>
        story.id === storyId
          ? {
              ...story,
              reactions: [
                ...(story.reactions || []).filter((item) => item.id !== viewer.id),
                { id: viewer.id, name: viewer.name, avatar: viewer.avatar, reaction },
              ],
            }
          : story,
      ),
    }))
  },

  startConversation: ({ user: targetUser, currentUser }) => {
    if (!targetUser?.id) return null
    const exists = get().messages.some(
      (message) =>
        message.sender?.id === targetUser.id && message.recipient?.id === currentUser?.id,
    )
    if (!exists) {
      const stamp = new Date().toISOString()
      set((state) => ({
        messages: [
          {
            id: newId(),
            sender: targetUser,
            recipient: currentUser || sampleUsers[0],
            body: `You connected with ${targetUser.name}.`,
            createdAt: stamp,
            time: formatTime(stamp),
            recipientId: currentUser?.id,
          },
          ...state.messages,
        ],
      }))
    }
    return String(targetUser.id)
  },

  setActiveConversation: (id, lastSeenAt) =>
    set((state) => ({
      activeConversationId: id,
      conversationReads:
        id && lastSeenAt
          ? { ...state.conversationReads, [id]: lastSeenAt }
          : state.conversationReads,
    })),

  sendMessage: async (payload) => {
    const timestamp = new Date().toISOString()
    const tempId = newId()
    const optimistic = {
      id: tempId,
      sender: payload.sender || sampleUsers[0],
      recipient: payload.recipient,
      body: payload.body,
      createdAt: timestamp,
      time: formatTime(timestamp),
      recipientId: payload.recipientId,
    }
    set((state) => ({ messages: [optimistic, ...state.messages] }))
    try {
      const saved = await socialApi.sendMessage(payload)
      const formatted = {
        id: saved.id,
        sender: saved.sender,
        recipient: saved.recipient,
        body: saved.body,
        createdAt: saved.createdAt,
        time: formatTime(saved.createdAt),
        recipientId: saved.recipientId,
      }
      set((state) => ({
        messages: state.messages.map((message) =>
          message.id === tempId ? formatted : message,
        ),
      }))
    } catch (error) {
      console.error('Unable to send message', error.message)
      set((state) => ({
        messages: state.messages.filter((message) => message.id !== tempId),
      }))
    }
    // no auto-reply; rely on backend for new messages
  },
}))
