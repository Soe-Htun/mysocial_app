import { useRef, useState } from 'react'
import { ImagePlus, Smile, X } from 'lucide-react'
import EmojiPicker from 'emoji-picker-react'
import { useSocialStore } from '../../store/useSocialStore'
import { useAuth } from '../../providers/AuthProvider'

export default function CreatePost() {
  const [isComposerOpen, setComposerOpen] = useState(false)
  const [content, setContent] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [showStickers, setShowStickers] = useState(false)
  const createPost = useSocialStore((state) => state.createPost)
  const { user } = useAuth()
  const fileInputRef = useRef(null)

  const resetComposer = () => {
    setContent('')
    setImagePreview('')
    setShowStickers(false)
    setComposerOpen(false)
  }

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result.toString())
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const text = content.trim()
    if (!text && !imagePreview) return
    await createPost({
      content: text,
      media: imagePreview,
      author: {
        id: user?.id || 0,
        name: user?.name || 'Guest User',
        avatar:
          user?.avatar ||
          `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(user?.name || 'Guest User')}`,
        headline: user?.headline || 'SocialSphere member',
      },
    })
    resetComposer()
  }

  return (
    <>
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4">
        <div className="flex items-center gap-3">
          <img
            src={
              user?.avatar ||
              `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(user?.name || 'Guest User')}`
            }
            alt={user?.name}
            className="h-12 w-12 rounded-full object-cover border border-slate-100"
          />
          <button
            onClick={() => setComposerOpen(true)}
            className="flex-1 text-left rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-500 hover:bg-slate-50"
          >
            Share an update...
          </button>
        </div>
      </div>

      {isComposerOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
            <header className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Share with your community</p>
                <h2 className="text-lg font-semibold text-slate-900">Create post</h2>
              </div>
              <button
                className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center"
                onClick={resetComposer}
              >
                <X size={18} />
              </button>
            </header>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
              <div className="px-6 py-4 space-y-4 overflow-y-auto">
                <div className="relative">
                  <textarea
                    rows={5}
                    placeholder="What do you want to talk about?"
                    className="w-full rounded-3xl border border-slate-200 px-4 py-3 pr-12 text-base focus:outline-none focus:ring-2 focus:ring-brand-100"
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                  />
                  <button
                    type="button"
                    aria-label="Add emoji"
                    className="absolute bottom-3 right-3 text-slate-500 hover:text-brand-600"
                    onClick={() => setShowStickers((prev) => !prev)}
                  >
                    <Smile size={20} />
                  </button>
                  {showStickers && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowStickers(false)}
                        aria-label="Close emoji picker"
                      />
                      <div className="absolute right-0 z-50 mb-2 translate-y-[-110%]">
                        <EmojiPicker
                          onEmojiClick={(emojiData) => {
                            setContent((prev) => `${prev} ${emojiData.emoji}`.trim())
                          }}
                          previewConfig={{ showPreview: false }}
                          skinTonesDisabled={false}
                          searchDisabled={false}
                          lazyLoadEmojis
                          width={320}
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-600">Add to your post</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                      <ImagePlus size={18} className="text-brand-600" />
                      Photo/video
                    </button>
                  </div>
                  {imagePreview && (
                    <div className="relative rounded-3xl overflow-hidden border border-slate-100">
                      <img src={imagePreview} alt="Upload preview" className="w-full object-cover max-h-64" />
                      <button
                        type="button"
                        className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 flex items-center justify-center"
                        onClick={() => setImagePreview('')}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 rounded-2xl border border-slate-200 text-sm font-medium text-slate-600"
                  onClick={resetComposer}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-2xl bg-brand-600 text-white text-sm font-medium disabled:opacity-60"
                  disabled={!content.trim() && !imagePreview}
                >
                  Share
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
