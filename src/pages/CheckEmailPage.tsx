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
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950 flex items-center justify-center p-6">
      <div className="fixed inset-0 bg-stone-100/60 dark:bg-stone-900/60 backdrop-blur-sm" />
      <div className="relative z-10 bg-white dark:bg-stone-800 rounded-3xl shadow-2xl border border-stone-200/50 dark:border-stone-700/50 p-10 w-full max-w-md text-center">
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

        <h1 className="font-serif text-3xl text-stone-800 dark:text-stone-100 mb-2">Check Your Email</h1>
        <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed mb-1">We sent a verification link to</p>
        <p className="font-medium text-stone-700 dark:text-stone-200 text-base mb-6 break-all">{email || "your email address"}</p>

        <div className="bg-stone-50 dark:bg-stone-700/50 rounded-2xl p-5 mb-4 text-left space-y-3">
          {[
            { step: "1", text: "Open your email inbox" },
            { step: "2", text: "Click the verification link we sent you" },
            { step: "3", text: "You'll be redirected back to sign in" },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-gradient-to-br from-stone-300 via-pink-200/40 to-stone-300 flex items-center justify-center text-xs font-medium text-stone-600 shrink-0">
                {step}
              </span>
              <span className="text-sm text-stone-600 dark:text-stone-300">{text}</span>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl px-4 py-3 mb-6 text-left">
          <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
            Can't find the email? Make sure to check your <span className="font-semibold">junk</span> or <span className="font-semibold">spam</span> folder — verification emails sometimes land there.
          </p>
        </div>

        {resent && <p className="text-sm text-green-600 mb-4 animate-pulse">✓ Verification email resent!</p>}

        <div className="space-y-3">
          <button onClick={() => navigate("/login")}
            className="w-full py-3 bg-gradient-to-r from-stone-300 via-pink-200/40 to-stone-300
              text-stone-700 rounded-xl hover:shadow-lg transition-all duration-300 text-sm tracking-wide">
            Go to Sign In
          </button>
          <button onClick={handleResend} disabled={loading}
            className="w-full py-3 border border-stone-200 dark:border-stone-600 text-stone-500 dark:text-stone-400 rounded-xl
              hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors text-sm disabled:opacity-50">
            {loading ? "Resending..." : "Resend verification email"}
          </button>
        </div>
      </div>
    </div>
  )
}