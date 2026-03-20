import { useState } from "react"
import { Sparkles } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../../lib/supabase"
import PasswordInput from "../components/authentication/PasswordInput"

export default function ResetPasswordPage() {
  const [password,       setPassword]       = useState("")
  const [showPassword,   setShowPassword]   = useState(false)
  const [passwordTouched,setPasswordTouched]= useState(false)
  const [loading,        setLoading]        = useState(false)
  const [error,          setError]          = useState("")
  const navigate = useNavigate()

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_.\-#^()\[\]{}|~`<>,:;'"\/\\])[A-Za-z\d@$!%*?&_.\-#^()\[\]{}|~`<>,:;'"\/\\]{8,}$/
  const isPasswordValid = passwordRegex.test(password)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password })

    setLoading(false)

    if (error) { setError(error.message); return }

    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100 flex items-center justify-center p-6">
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 p-12 w-full max-w-md">
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-stone-200 via-pink-100/30 to-stone-300 rounded-full">
            <Sparkles className="w-8 h-8 text-stone-600" />
          </div>
          <h1 className="font-serif text-3xl text-stone-800">New Password</h1>
          <p className="text-stone-500 text-sm">Enter your new password below.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <PasswordInput
            password={password}
            showPassword={showPassword}
            passwordTouched={passwordTouched}
            isPasswordValid={isPasswordValid}
            onPasswordChange={setPassword}
            onToggleShowPassword={() => setShowPassword(!showPassword)}
            onBlur={() => setPasswordTouched(true)}
            label="New Password"
            id="new-password"
            placeholder="••••••••"
            autoComplete="new-password"
          />

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading || !isPasswordValid}
            className="w-full py-3 bg-gradient-to-r from-stone-300 via-pink-200/40 to-stone-300
              text-stone-700 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  )
}