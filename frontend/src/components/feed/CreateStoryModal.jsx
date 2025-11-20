import { useEffect, useState } from 'react'
import { Modal } from '../ui/Modal'

export default function CreateStoryModal({ open, onClose, onCreate }) {
  const [caption, setCaption] = useState('')
  const [media, setMedia] = useState(null)

  useEffect(() => {
    if (!open) {
      setCaption('')
      setMedia(null)
    }
  }, [open])

  if (!open) return null

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setMedia(reader.result)
    reader.readAsDataURL(file)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!caption.trim() && !media) return
    onCreate({ caption, media })
  }

  const footer = (
    <div className="flex justify-end gap-3">
      <button
        type="button"
        onClick={onClose}
        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        form="create-story-form"
        className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
        disabled={!caption.trim() && !media}
      >
        Share story
      </button>
    </div>
  )

  return (
    <Modal title="Share a story" onClose={onClose} footer={footer}>
      <form id="create-story-form" className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="text-xs font-semibold uppercase text-slate-400">Caption</label>
          <textarea
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-brand-200 focus:ring-2 focus:ring-brand-50"
            rows={3}
            placeholder="What do you want to share?"
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase text-slate-400">Media</label>
          {media ? (
            <div className="mt-2 space-y-3">
              <img src={media} alt="Story preview" className="w-full rounded-2xl object-cover max-h-64" />
              <div className="flex justify-between text-xs text-slate-500">
                <span>Preview</span>
                <button type="button" className="font-semibold text-rose-500" onClick={() => setMedia(null)}>
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <label className="mt-2 flex h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 text-sm text-slate-500 hover:border-brand-200 hover:text-brand-600">
              <span>Click to upload</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          )}
        </div>
      </form>
    </Modal>
  )
}
