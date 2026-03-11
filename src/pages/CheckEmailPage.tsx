import { useLocation, useNavigate } from "react-router-dom"
import { useState } from "react"
import { supabase } from "../../lib/supabase"

export default function CheckEmailPage() {
  const location  = useLocation()
  const navigate  = useNavigate()
  const email = (location.state as any)?.email || ""
  const [resent,  setResent]  = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleResend() {
    if (!email) return
    setLoading(true)
    await supabase.auth.resend({ type: "signup", email })
    setLoading(false)
    setResent(true)
    setTimeout(() => setResent(false), 4000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100 flex items-center justify-center p-6">
      <div className="fixed inset-0 bg-stone-100/60 backdrop-blur-sm" />
      <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-stone-200/50 p-10 w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-stone-100 via-pink-50 to-stone-200 rounded-full flex items-center justify-center shadow-inner">
              <svg className="w-12 h-12 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <span className="absolute top-1 right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-300 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-pink-400" />
            </span>
          </div>
        </div>

        <h1 className="font-serif text-3xl text-stone-800 mb-2">Check Your Email</h1>
        <p className="text-stone-500 text-sm leading-relaxed mb-1">We sent a verification link to</p>
        <p className="font-medium text-stone-700 text-base mb-6 break-all">{email || "your email address"}</p>

        <div className="bg-stone-50 rounded-2xl p-5 mb-6 text-left space-y-3">
          {[
            { step: "1", text: "Open your email inbox" },
            { step: "2", text: "Click the verification link we sent you" },
            { step: "3", text: "You'll be redirected back to sign in" },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-gradient-to-br from-stone-300 via-pink-200/40 to-stone-300 flex items-center justify-center text-xs font-medium text-stone-600 shrink-0">
                {step}
              </span>
              <span className="text-sm text-stone-600">{text}</span>
            </div>
          ))}
        </div>

        {resent && <p className="text-sm text-green-600 mb-4 animate-pulse">✓ Verification email resent!</p>}

        <div className="space-y-3">
          <button onClick={() => navigate("/login")}
            className="w-full py-3 bg-gradient-to-r from-stone-300 via-pink-200/40 to-stone-300
              text-stone-700 rounded-xl hover:shadow-lg transition-all duration-300 text-sm tracking-wide">
            Go to Sign In
          </button>
          <button onClick={handleResend} disabled={loading}
            className="w-full py-3 border border-stone-200 text-stone-500 rounded-xl
              hover:bg-stone-50 transition-colors text-sm disabled:opacity-50">
            {loading ? "Resending..." : "Resend verification email"}
          </button>
        </div>

        <p className="mt-6 text-xs text-stone-400">Didn't receive it? Check your spam folder.</p>
      </div>
    </div>
  )
}