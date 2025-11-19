import { useState } from 'react'
import { Bell, Menu, Search, User, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../providers/AuthProvider'
import { useSocialStore } from '../../store/useSocialStore'

export default function TopBar() {
  const { user, logout } = useAuth()
  const [showMenu, setShowMenu] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const postSearchTerm = useSocialStore((state) => state.postSearchTerm)
  const setPostSearchTerm = useSocialStore((state) => state.setPostSearchTerm)

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
        <Link to="/" className="text-xl font-semibold text-brand-600">
          SocialSphere
        </Link>
        <div className="hidden md:flex items-center flex-1 max-w-xl relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="search"
            value={postSearchTerm}
            onChange={(event) => setPostSearchTerm(event.target.value)}
            placeholder="Search people, posts, or topics"
            className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div className="flex items-center gap-4 ml-auto">
          <button className="relative p-2 rounded-full hover:bg-slate-50" aria-label="Notifications">
            <Bell className="h-5 w-5 text-slate-500" />
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-rose-500" />
          </button>
          <div className="relative">
            <button
              className="h-9 w-9 rounded-full border border-slate-100 flex items-center justify-center overflow-hidden"
              onClick={() => setShowMenu((prev) => !prev)}
            >
              {user?.avatar ? (
                <img src={user.avatar} alt={user?.name} className="h-full w-full object-cover" />
              ) : (
                <User className="h-5 w-5 text-brand-700" />
              )}
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-100 bg-white shadow-lg p-2 text-sm">
                <Link
                  to="/profile/me"
                  className="block rounded-xl px-3 py-2 text-slate-600 hover:bg-slate-50"
                  onClick={() => setShowMenu(false)}
                >
                  View profile
                </Link>
                <button
                  className="w-full text-left rounded-xl px-3 py-2 text-rose-600 hover:bg-rose-50"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to log out?')) {
                      logout()
                    }
                  }}
                >
                  Log out
                </button>
              </div>
            )}
          </div>
          <button
            className="md:hidden p-2 rounded-full hover:bg-slate-50"
            aria-label="Open navigation"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu className="h-5 w-5 text-slate-500" />
          </button>
        </div>
      </div>
      {mobileNavOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white">
          <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
            <Link to="/" className="text-xl font-semibold text-brand-600" onClick={() => setMobileNavOpen(false)}>
              SocialSphere
            </Link>
            <button
              className="p-2 rounded-full hover:bg-slate-50"
              aria-label="Close navigation"
              onClick={() => setMobileNavOpen(false)}
            >
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>
          <nav className="px-4 py-6 space-y-4">
            <Link className="block text-lg font-medium text-slate-800" to="/" onClick={() => setMobileNavOpen(false)}>
              Feed
            </Link>
            <Link className="block text-lg font-medium text-slate-800" to="/messages" onClick={() => setMobileNavOpen(false)}>
              Messages
            </Link>
            <Link
              className="block text-lg font-medium text-slate-800"
              to="/notifications"
              onClick={() => setMobileNavOpen(false)}
            >
              Notifications
            </Link>
            <Link className="block text-lg font-medium text-slate-800" to="/resources" onClick={() => setMobileNavOpen(false)}>
              Resources
            </Link>
            <Link
              className="block text-lg font-medium text-slate-800"
              to="/profile/me"
              onClick={() => setMobileNavOpen(false)}
            >
              Profile
            </Link>
            <button
              className="w-full text-left text-lg font-medium text-rose-600"
              onClick={() => {
                if (window.confirm('Are you sure you want to log out?')) {
                  logout()
                  setMobileNavOpen(false)
                }
              }}
            >
              Log out
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}
