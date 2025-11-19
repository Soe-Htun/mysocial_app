import { useEffect, useRef, useState } from 'react'

const readFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

export default function ProfileEditModal({ open, onClose, initialValues = {}, onSubmit, loading }) {
  const [form, setForm] = useState({
    name: '',
    headline: '',
    location: '',
    avatarUrl: '',
    coverUrl: '',
  })
  const avatarInput = useRef(null)
  const coverInput = useRef(null)

  useEffect(() => {
    if (open) {
      setForm({
        name: initialValues.name || '',
        headline: initialValues.headline || '',
        location: initialValues.location || '',
        avatarUrl: initialValues.avatarUrl || '',
        coverUrl: initialValues.coverUrl || '',
      })
    }
  }, [open, initialValues])

  if (!open) return null

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleFile = async (event, field) => {
    const file = event.target.files?.[0]
    if (!file) return
    const dataUrl = await readFile(file)
    setForm((prev) => ({ ...prev, [field]: dataUrl }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    await onSubmit(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900">Edit profile</h2>
          <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-700">
            Close
          </button>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-slate-600">Name</label>
            <input
              className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">Headline</label>
            <input
              className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm"
              name="headline"
              value={form.headline}
              onChange={handleChange}
              placeholder="Add a short description"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">Location</label>
            <input
              className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="City, Country"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Avatar</label>
              <div className="mt-1 flex items-center gap-3">
                <img
                  src={
                    form.avatarUrl ||
                    `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(form.name || 'Guest User')}`
                  }
                  alt="Avatar preview"
                  className="h-16 w-16 rounded-full object-cover"
                />
                <button
                  type="button"
                  className="px-3 py-2 rounded-2xl border border-slate-200 text-sm"
                  onClick={() => avatarInput.current?.click()}
                >
                  Upload
                </button>
                <input
                  ref={avatarInput}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => handleFile(event, 'avatarUrl')}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Cover image</label>
              <div className="mt-1 flex flex-col gap-3">
                {form.coverUrl ? (
                  <img src={form.coverUrl} alt="Cover preview" className="h-24 w-full rounded-2xl object-cover" />
                ) : (
                  <div className="h-24 rounded-2xl bg-gradient-to-r from-brand-200 to-brand-100" />
                )}
                <button
                  type="button"
                  className="self-start px-3 py-2 rounded-2xl border border-slate-200 text-sm"
                  onClick={() => coverInput.current?.click()}
                >
                  Upload
                </button>
                <input
                  ref={coverInput}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => handleFile(event, 'coverUrl')}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="px-4 py-2 text-sm text-slate-500" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-2xl bg-brand-600 text-white text-sm font-medium disabled:opacity-60"
            >
              {loading ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
