import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AuthImagePanel from "../components/authentication/AuthImagePanel";
import SocialLoginButons from "../components/authentication/SocialLoginButtons";
import PasswordInput from "../components/authentication/PasswordInput";
import { signIn } from "../auth";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [passwordTouched, setPasswordTouched] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_.\-#^()\[\]{}|~`<>,:;'"\/\\])[A-Za-z\d@$!%*?&_.\-#^()\[\]{}|~`<>,:;'"\/\\]{8,}$/;
  const isPasswordValid = passwordRegex.test(password);

  async function handleLogin() {
    setError("");
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        setError("Please confirm your email first. Check your inbox.");
      } else {
        setError(error.message);
      }
      return;
    }
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <AuthImagePanel
          src="https://images.unsplash.com/photo-1770757588092-6fd47f8a2985?auto=format&fit=crop&w=1080&q=80"
          alt="Bridal Gown"
        />
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 p-12">
          <div className="max-w-md mx-auto space-y-8">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-stone-200 via-pink-100/30 to-stone-300 rounded-full">
                <Sparkles className="w-8 h-8 text-stone-600" />
              </div>
              <h1 className="font-serif text-4xl text-stone-800">
                Bride Me Up
              </h1>
              <p className="text-stone-500">
                Your journey to the perfect dress begins here
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm text-stone-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="bride@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50
                  text-stone-800 placeholder:text-stone-400"
              />
            </div>

            <PasswordInput
              password={password}
              showPassword={showPassword}
              passwordTouched={passwordTouched}
              isPasswordValid={isPasswordValid}
              onPasswordChange={setPassword}
              onToggleShowPassword={() => setShowPassword(!showPassword)}
              onBlur={() => setPasswordTouched(true)}
              label="Password"
              id="password"
              placeholder="••••••••"
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between text-sm">
              <label
                htmlFor="remember"
                className="flex items-center gap-2 text-stone-600 cursor-pointer"
              >
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-stone-300 text-pink-300"
                />
                <span>Remember me</span>
              </label>
              <Link to="#" className="text-stone-600 hover:text-stone-800">
                Forgot password
              </Link>
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <button
              type="button"
              onClick={handleLogin}
              disabled={!email || !password || !isPasswordValid || loading}
              className="w-full py-3 bg-gradient-to-r from-stone-300 via-pink-200/40 to-stone-300
                text-stone-700 rounded-xl hover:shadow-lg transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/60 text-stone-500">
                  or continue with
                </span>
              </div>
            </div>

            <SocialLoginButons />

            <div className="text-center text-sm text-stone-600">
              Don&apos;t have an account?{" "}
              <Link
                to="/signup"
                className="text-stone-700 hover:text-stone-900"
              >
                Create one
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
