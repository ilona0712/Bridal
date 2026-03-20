import { useState } from "react"
import { Sparkles } from "lucide-react"
import { Link } from "react-router-dom"
import { supabase } from "../../lib/supabase"

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState("")
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setLoading(false)

    if (error) { setError(error.message); return }
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100 flex items-center justify-center p-6">
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 p-12 w-full max-w-md">
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-stone-200 via-pink-100/30 to-stone-300 rounded-full">
            <Sparkles className="w-8 h-8 text-stone-600" />
          </div>
          <h1 className="font-serif text-3xl text-stone-800">Forgot Password</h1>
          <p className="text-stone-500 text-sm">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-green-700 text-sm">
                ✓ Reset link sent! Check your email inbox.
              </p>
            </div>
            <Link to="/login" className="block text-sm text-stone-600 hover:text-stone-800">
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm text-stone-700">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="bride@example.com"
                required
                className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-pink-200/50 text-stone-800"
              />
            </div>

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-3 bg-gradient-to-r from-stone-300 via-pink-200/40 to-stone-300
                text-stone-700 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <div className="text-center">
              <Link to="/login" className="text-sm text-stone-600 hover:text-stone-800">
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}