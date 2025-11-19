import { useEffect, useMemo, useState } from 'react'
import { Send } from 'lucide-react'
import { useSocialStore } from '../store/useSocialStore'
import { useAuth } from '../providers/AuthProvider'
import { formatPostTimestamp } from '../utils/formatDate'
import { useSearchParams } from 'react-router-dom'

const buildAvatar = (name = 'Friend') =>
  `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name)}`

export default function Messages() {
  const rawMessages = useSocialStore((state) => state.messages)
  const messagesCursor = useSocialStore((state) => state.messagesCursor)
  const fetchMessages = useSocialStore((state) => state.fetchMessages)
  const sendMessage = useSocialStore((state) => state.sendMessage)
  const startConversation = useSocialStore((state) => state.startConversation)
  const setActiveConversation = useSocialStore((state) => state.setActiveConversation)
  const persistedConversation = useSocialStore((state) => state.activeConversationId)
  const conversationReads = useSocialStore((state) => state.conversationReads)
  const feed = useSocialStore((state) => state.feed)
  const { user } = useAuth()
  const [activeId, setActiveId] = useState(null)
  const [draft, setDraft] = useState('')
  const [query, setQuery] = useState('')
  const [searchParams] = useSearchParams()

  const feedAuthors = useMemo(() => {
    const map = new Map()
    feed.forEach((post) => {
      if (post.author?.id && post.author.id !== user?.id && !map.has(post.author.id)) {
        map.set(post.author.id, post.author)
      }
    })
    return Array.from(map.values())
  }, [feed, user?.id])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  useEffect(() => {
    const interval = setInterval(() => {
      fetchMessages(messagesCursor ? { cursor: messagesCursor } : undefined)
    }, 5000)
    return () => clearInterval(interval)
  }, [fetchMessages, messagesCursor])

  const conversations = useMemo(() => {
    const map = new Map()
    rawMessages.forEach((message) => {
      const isOutgoing = message.sender?.id === user?.id
      const counterpart = isOutgoing ? message.recipient : message.sender
      if (!counterpart || counterpart.id === user?.id) return
      const key = String(counterpart.id || counterpart.email || counterpart.name)
      if (!map.has(key)) {
        map.set(key, {
          id: key,
          counterpart: counterpart || { name: 'Peer', avatar: buildAvatar('Peer') },
          recipientId: counterpart.id || message.recipientId,
          messages: [],
        })
      }
      map.get(key).messages.push({
        id: message.id,
        text: message.body,
        createdAt: message.createdAt,
        author: isOutgoing ? 'you' : 'them',
      })
    })
    return Array.from(map.values()).map((conversation) => ({
      ...conversation,
      messages: conversation.messages.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ),
    }))
  }, [rawMessages, user])

  useEffect(() => {
    if (activeId && activeId !== persistedConversation) {
      const latest = conversations
        .find((conversation) => conversation.id === activeId)
        ?.messages.slice(-1)[0]?.createdAt
      setActiveConversation(activeId, latest)
      return
    }
    if (!activeId && persistedConversation) {
      setActiveId(persistedConversation)
      return
    }
    if (!activeId && conversations.length > 0) {
      setActiveId(conversations[0].id)
    }
  }, [conversations, activeId, persistedConversation, setActiveConversation])

  useEffect(() => {
    const target = searchParams.get('user')
    if (!target) return
    const exists = conversations.find((conversation) => conversation.id === target)
    if (exists) {
      setActiveId(target)
      return
    }
    const candidate = feedAuthors.find((author) => String(author?.id) === target)
    if (candidate) {
      const id = startConversation({ user: candidate, currentUser: user })
      if (id) {
        setActiveId(id)
      }
    }
  }, [searchParams, conversations, feedAuthors, startConversation, user])

  const activeConversation = conversations.find((conversation) => conversation.id === activeId)
  const counterpart = activeConversation?.counterpart

  const handleSend = async (event) => {
    event.preventDefault()
    if (!draft.trim() || !counterpart || !activeConversation) return
    await sendMessage({
      body: draft,
      recipientId: activeConversation.recipientId || counterpart.id,
      recipient: counterpart,
      sender: {
        id: user?.id || 0,
        name: user?.name || 'You',
        avatar: user?.avatar || buildAvatar(user?.name || 'You'),
      },
    })
    setDraft('')
    fetchMessages(messagesCursor ? { cursor: messagesCursor } : undefined)
  }

  const filteredConversations = useMemo(() => {
    if (!query.trim()) return conversations
    const term = query.toLowerCase()
    return conversations.filter((conversation) =>
      conversation.counterpart?.name?.toLowerCase().includes(term),
    )
  }, [conversations, query])

  const authorSuggestions = useMemo(() => {
    if (!query.trim()) return []
    const term = query.toLowerCase()
    return feedAuthors
      .filter((author) => author.name?.toLowerCase().includes(term))
      .slice(0, 5)
  }, [feedAuthors, query])

  return (
    <div className="grid lg:grid-cols-[280px,1fr] gap-6 pt-6">
      <aside className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 space-y-3 md:sticky md:top-6 md:h-fit">
        <p className="text-sm font-semibold text-slate-900">Inbox</p>
        <input
          type="search"
          placeholder="Search messages"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        {filteredConversations.map((conversation) => {
          const lastMessage = conversation.messages[conversation.messages.length - 1]
          const lastRead = conversationReads[conversation.id]
          const unreadCount = conversation.messages.filter(
            (message) =>
              message.author === 'them' &&
              (!lastRead || new Date(message.createdAt) > new Date(lastRead)),
          ).length
          return (
            <button
              key={conversation.id}
              onClick={() =>
                setActiveId((prev) => {
                  if (prev === conversation.id) {
                    setActiveConversation(null)
                    return null
                  }
                  const latest = conversation.messages.slice(-1)[0]?.createdAt
                  setActiveConversation(conversation.id, latest)
                  return conversation.id
                })
              }
              className={`w-full flex items-center gap-3 rounded-2xl px-3 py-2 text-left ${
                activeConversation?.id === conversation.id ? 'bg-brand-50' : 'hover:bg-slate-50'
              }`}
            >
              <img
                src={conversation.counterpart?.avatar || buildAvatar(conversation.counterpart?.name)}
                alt={conversation.counterpart?.name}
                className="h-10 w-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-medium ${unreadCount ? 'text-slate-900' : 'text-slate-700'}`}>
                    {conversation.counterpart?.name}
                  </p>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-semibold text-white bg-rose-500 rounded-full px-2 py-0.5">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <p className={`text-xs ${unreadCount ? 'text-slate-800' : 'text-slate-500'}`}>
                  {lastMessage ? `${lastMessage.author === 'you' ? 'You: ' : ''}${lastMessage.text}` : ''}
                </p>
              </div>
            </button>
          )
        })}
        {!filteredConversations.length && authorSuggestions.length > 0 && (
          <div className="space-y-3 border border-dashed border-slate-200 rounded-2xl p-4 text-sm text-slate-600">
            <p className="text-xs uppercase font-semibold text-slate-400">Suggested accounts</p>
            <div className="space-y-2">
              {authorSuggestions.map((author) => (
                <button
                  key={author.id}
                  className="w-full text-left px-3 py-2 rounded-2xl hover:bg-slate-50"
                  onClick={() => {
                    const conversationId = startConversation({ user: author, currentUser: user })
                    if (conversationId) {
                      setActiveId(conversationId)
                      setActiveConversation(conversationId)
                      setQuery('')
                    }
                  }}
                >
                  {author.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>

      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col h-[calc(100vh-140px)]">
        {counterpart ? (
          <>
            <header className="border-b border-slate-100 px-6 py-4">
              <p className="text-sm text-slate-500">Messaging</p>
              <p className="text-lg font-semibold text-slate-900">{counterpart.name}</p>
            </header>
            <div className="flex-1 px-6 py-4 space-y-4 overflow-y-auto">
              {activeConversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex flex-col gap-1 ${
                    message.author === 'you' ? 'items-end' : 'items-start'
                  }`}
                >
                  <p className="text-sm font-medium text-slate-700">
                    {message.author === 'you' ? 'You' : counterpart.name}
                  </p>
                  <div
                    className={`rounded-2xl px-4 py-2 text-sm max-w-md ${
                      message.author === 'you'
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {message.text}
                  </div>
                  <span className="text-xs text-slate-400">{formatPostTimestamp(message.createdAt)}</span>
                </div>
              ))}
              {activeConversation.messages.length === 0 && (
                <p className="text-sm text-slate-500">No messages yet. Start the conversation!</p>
              )}
            </div>
            <form onSubmit={handleSend} className="border-t border-slate-100 px-6 py-4 flex gap-3">
              <input
                className="flex-1 rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-100"
                placeholder={`Message ${counterpart.name}`}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
              />
              <button type="submit" className="bg-brand-600 text-white px-5 rounded-2xl flex items-center gap-2 text-sm">
                Send
                <Send size={16} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
            Select a conversation to start chatting
          </div>
        )}
      </section>
    </div>
  )
}
