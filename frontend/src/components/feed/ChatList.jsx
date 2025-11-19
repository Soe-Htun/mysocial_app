import { MessageSquare } from 'lucide-react'
import { useSocialStore } from '../../store/useSocialStore'

export default function ChatList() {
  const messages = useSocialStore((state) => state.messages)

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
      <div className="flex items-center gap-2 text-slate-900 font-semibold">
        <MessageSquare className="h-4 w-4 text-brand-600" />
        Quick chats
      </div>
      <div className="space-y-4">
        {messages.map((message) => (
          <button key={message.id} className="w-full flex items-center gap-3">
            <img
              src={message.sender.avatar}
              alt={message.sender.name}
              className="h-10 w-10 rounded-full object-cover"
            />
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-slate-800">{message.sender.name}</p>
              <p className="text-xs text-slate-500 line-clamp-2">{message.preview}</p>
            </div>
            <span className="text-xs text-slate-400">{message.time}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
