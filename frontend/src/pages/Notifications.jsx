import { useEffect } from 'react'
import { Bell, Check, Heart, MessageSquare, Share2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSocialStore } from '../store/useSocialStore'

export default function Notifications() {
  const notifications = useSocialStore((state) => state.notifications)
  const fetchNotifications = useSocialStore((state) => state.fetchNotifications)
  const markNotificationRead = useSocialStore((state) => state.markNotificationRead)
  const navigate = useNavigate()

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  return (
    <div className="pt-6 space-y-4">
      <div className="flex items-center gap-2 text-slate-900">
        <Bell className="h-5 w-5 text-brand-600" />
        <h1 className="text-2xl font-semibold">Notifications</h1>
      </div>
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm divide-y divide-slate-100">
        {notifications.map((notification) => {
          const Icon =
            notification.type === 'reaction'
              ? Heart
              : notification.type === 'comment'
              ? MessageSquare
              : notification.type === 'share'
              ? Share2
              : Bell
          return (
            <button
              key={notification.id}
              className={`w-full p-5 flex items-center gap-4 text-left ${
                notification.read ? 'bg-white' : 'bg-brand-50/40'
              }`}
              onClick={() => {
                markNotificationRead(notification.id)
                if (notification.postId) {
                  navigate(`/?post=${notification.postId}`)
                }
              }}
            >
              <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-brand-600">
                <Icon size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-700">{notification.message}</p>
                <p className="text-xs text-slate-400 mt-1">{notification.time}</p>
              </div>
              {!notification.read && (
                <span className="text-[10px] uppercase text-brand-600 font-semibold">New</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
