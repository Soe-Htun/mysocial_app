import { NavLink } from 'react-router-dom'
import { Bell, BookOpen, Home, MessageSquare, User } from 'lucide-react'
import { useMemo } from 'react'
import { useAuth } from '../../providers/AuthProvider'
import { useSocialStore } from '../../store/useSocialStore'

const navItems = [
  { to: '/', label: 'Feed', icon: Home },
  { to: '/messages', label: 'Messages', icon: MessageSquare },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/profile/me', label: 'Profile', icon: User },
  { to: '/resources', label: 'Resources', icon: BookOpen },
]

export default function Sidebar() {
  const { user } = useAuth()
  const messages = useSocialStore((state) => state.messages)
  const conversationReads = useSocialStore((state) => state.conversationReads)
  const refreshFeed = useSocialStore((state) => state.fetchFeed)
  const unreadMessages = useMemo(() => {
    if (!messages?.length) return 0
    return messages.reduce((count, message) => {
      const senderId = message.sender?.id
      if (!senderId || senderId === user?.id) return count
      const key = String(
        senderId || message.sender?.email || message.sender?.name || message.recipientId || 'unknown',
      )
      const lastRead = conversationReads?.[key]
      const createdAt = message.createdAt
      if (!lastRead) return count + 1
      try {
        if (new Date(createdAt) > new Date(lastRead)) {
          return count + 1
        }
      } catch {
        return count + 1
      }
      return count
    }, 0)
  }, [messages, conversationReads, user?.id])

  return (
    <aside className="hidden lg:block w-64 shrink-0 pt-6">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sticky top-24">
        <div className="text-center">
          <img
            src={
              user?.avatar ||
              `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(user?.name || 'Guest User')}`
            }
            alt={user?.name}
            className="h-12 w-12 rounded-full mx-auto object-cover border border-slate-100"
          />
          <p className="mt-4 text-slate-900 font-semibold">{user?.name || 'Guest User'}</p>
          <p className="text-sm text-slate-500">{user?.headline || 'Building the next big thing'}</p>
        </div>

        <nav className="mt-8 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => {
                if (to === '/') {
                  refreshFeed({ reset: true })
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'
                }`
              }
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {to === '/messages' && unreadMessages > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500 text-white">
                  {unreadMessages}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  )
}
