import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login', { email, password })
      login(res.data.user, res.data.access_token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[#f4f1ea] font-sans">

      {/* ─── Left panel — editorial showcase ─────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1c1a17] text-[#f4f1ea] flex-col justify-between p-14 relative overflow-hidden">

        {/* Faint grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(#f4f1ea 1px, transparent 1px), linear-gradient(90deg, #f4f1ea 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Wordmark */}
        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 rounded-sm bg-[#c8642e] flex items-center justify-center">
            <span className="font-serif text-lg font-bold text-[#f4f1ea]">L</span>
          </div>
          <span className="text-sm font-medium tracking-[0.2em] uppercase text-[#a8a298]">
            LLM&nbsp;Chat
          </span>
        </div>

        {/* Centerpiece */}
        <div className="relative max-w-md">
          <p className="text-[#c8642e] text-sm font-medium tracking-[0.18em] uppercase mb-6">
            Issue No. 01
          </p>
          <h2 className="font-serif text-5xl leading-[1.1] tracking-tight">
            A quieter place to think out loud.
          </h2>
          <p className="text-[#a8a298] mt-6 text-base leading-relaxed">
            Pick up every conversation exactly where you left it. Your ideas,
            organized and waiting.
          </p>
        </div>

        {/* Footer quote */}
        <div className="relative border-t border-[#3a3631] pt-6">
          <p className="font-serif italic text-lg text-[#d8d2c6]">
            “The best thoughts arrive mid-sentence.”
          </p>
        </div>
      </div>

      {/* ─── Right panel — form ──────────────────────────────────── */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">

          {/* Mobile wordmark */}
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <div className="w-9 h-9 rounded-sm bg-[#c8642e] flex items-center justify-center">
              <span className="font-serif text-lg font-bold text-[#f4f1ea]">L</span>
            </div>
            <span className="text-sm font-medium tracking-[0.2em] uppercase text-[#8a8478]">
              LLM&nbsp;Chat
            </span>
          </div>

          {/* Heading */}
          <div className="mb-9">
            <p className="text-[#c8642e] text-xs font-semibold tracking-[0.2em] uppercase mb-3">
              Sign in
            </p>
            <h1 className="font-serif text-4xl text-[#1c1a17] tracking-tight">
              Welcome back.
            </h1>
            <p className="text-[#8a8478] mt-2.5 text-sm">
              Enter your details to continue the conversation.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 px-4 py-3 border-l-2 border-[#b3402a] bg-[#b3402a]/[0.06] text-[#8f3322] text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-[#5a564e] uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-transparent border-0 border-b-2 border-[#d6d0c4] px-0 py-2.5 text-[#1c1a17] text-sm placeholder-[#b0aa9e] focus:outline-none focus:border-[#c8642e] transition-colors duration-200"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-[#5a564e] uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-transparent border-0 border-b-2 border-[#d6d0c4] px-0 py-2.5 pr-10 text-[#1c1a17] text-sm placeholder-[#b0aa9e] focus:outline-none focus:border-[#c8642e] transition-colors duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[#a8a298] hover:text-[#1c1a17] transition-colors p-1"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1c1a17] hover:bg-[#c8642e] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#1c1a17] text-[#f4f1ea] font-semibold py-3.5 rounded-sm transition-colors duration-200 text-sm tracking-wide uppercase mt-3"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in
                </span>
              ) : 'Sign in'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-7">
            <div className="flex-1 h-px bg-[#d6d0c4]" />
            <span className="text-[#a8a298] text-xs uppercase tracking-[0.2em]">or</span>
            <div className="flex-1 h-px bg-[#d6d0c4]" />
          </div>

          {/* GitHub OAuth */}
          <a
            href={`${import.meta.env.VITE_API_URL}/auth/github`}
            className="flex items-center justify-center gap-3 w-full border border-[#1c1a17] hover:bg-[#1c1a17] hover:text-[#f4f1ea] text-[#1c1a17] font-medium py-3 rounded-sm transition-colors duration-200 text-sm"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Continue with GitHub
          </a>

          {/* Footer */}
          <p className="text-[#8a8478] text-sm mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#c8642e] hover:text-[#1c1a17] font-semibold underline underline-offset-4 decoration-1 transition-colors">
              Create one free
            </Link>
          </p>

          <p className="text-[#b0aa9e] text-xs mt-6">
            By signing in, you agree to our Terms of Service.
          </p>
        </div>
      </div>
    </div>
  )
}