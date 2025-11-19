import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PostCard from '../components/feed/PostCard'
import { useSocialStore } from '../store/useSocialStore'
import { useAuth } from '../providers/AuthProvider'
import ProfileEditModal from '../components/profile/ProfileEditModal'

export default function Profile() {
  const { id } = useParams()
  const { user, updateProfile, loading } = useAuth()
  const feed = useSocialStore((state) => state.feed)
  const startConversation = useSocialStore((state) => state.startConversation)
  const navigate = useNavigate()
  const [showEditor, setShowEditor] = useState(false)

  const profileUser = useMemo(() => {
    if (id === 'me' || !id) return user
    return feed.find((post) => String(post.author?.id) === id)?.author || user
  }, [feed, id, user])

  const posts = feed.filter((post) => post.author?.name === profileUser?.name)

  if (!profileUser) {
    return <p className="pt-10 text-center text-slate-500">Profile not available yet.</p>
  }

  return (
    <div className="pt-6 space-y-6">
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div
          className={`h-48 ${profileUser.coverUrl ? '' : 'bg-gradient-to-r from-brand-200 to-brand-100'}`}
          style={
            profileUser.coverUrl
              ? { backgroundImage: `url(${profileUser.coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : undefined
          }
        />
        <div className="p-6 -mt-16 flex flex-col md:flex-row md:items-end gap-4">
          <img
            src={
              profileUser.avatar ||
              `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(profileUser.name || 'Guest User')}`
            }
            alt={profileUser.name}
            className="h-24 w-24 rounded-3xl border-4 border-white object-cover"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-slate-900">{profileUser.name}</h1>
            <p className="text-sm text-slate-400 mt-1">{profileUser.location || 'Worldwide'}</p>
          </div>
          {(!id || id === 'me') && (
            <button
              className="h-11 px-6 rounded-2xl bg-brand-600 text-white text-sm font-medium"
              onClick={() => setShowEditor(true)}
            >
              Edit profile
            </button>
          )}
          {id && id !== 'me' && profileUser.id !== user?.id && (
            <button
              className="h-11 px-6 rounded-2xl border border-brand-200 text-brand-600 text-sm font-medium"
              onClick={() => {
                const convoId = startConversation({ user: profileUser, currentUser: user })
                navigate(`/messages?user=${convoId || profileUser.id}`)
              }}
            >
              Message
            </button>
          )}
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-4">
        {[
          { label: 'Followers', value: '1.2k' },
          { label: 'Posts this month', value: posts.length || 0 },
          { label: 'Communities', value: 8 },
          { label: 'Inspiration score', value: 'Top 5%' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-3xl border border-slate-100 p-5">
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Recent posts</h2>
        {posts.length === 0 && (
          <p className="text-sm text-slate-500">No posts yet. Share something with your community.</p>
        )}
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </section>

      <ProfileEditModal
        open={showEditor}
        onClose={() => setShowEditor(false)}
        initialValues={profileUser}
        loading={loading}
        onSubmit={async (values) => {
          await updateProfile(values)
          setShowEditor(false)
        }}
      />
    </div>
  )
}
