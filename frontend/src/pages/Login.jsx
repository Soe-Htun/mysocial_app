import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../providers/AuthProvider'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, loading, error, enterDemoMode } = useAuth()
  const [form, setForm] = useState({ email: 'demo@social.app', password: 'password' })
  const from = location.state?.from?.pathname || '/'

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      await login(form)
      navigate(from, { replace: true })
    } catch (err) {
      console.error(err)
    }
  }

  const handleDemoMode = () => {
    enterDemoMode({ email: form.email })
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-100 shadow-xl p-8 space-y-6">
        <div>
          <p className="text-sm uppercase font-semibold tracking-wide text-brand-600">SocialSphere</p>
          <h1 className="text-2xl font-semibold text-slate-900 mt-2">Welcome back</h1>
          <p className="text-sm text-slate-500">Connect with your team, share updates, and stay inspired.</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-slate-600">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-100"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-100"
              required
            />
          </div>
          {error && <p className="text-sm text-rose-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-brand-600 text-white py-2 font-medium disabled:opacity-60"
          >
            {loading ? 'Signing you in...' : 'Sign in'}
          </button>
        </form>
        <div className="space-y-2">
          <p className="text-xs text-slate-400 text-center uppercase tracking-wide">or</p>
          <button
            type="button"
            onClick={handleDemoMode}
            className="w-full rounded-2xl border border-slate-200 text-slate-700 py-2 font-medium"
          >
            Browse in demo mode
          </button>
        </div>
        <p className="text-sm text-slate-500 text-center">
          New here?{' '}
          <Link to="/auth/register" className="text-brand-600 font-medium">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
