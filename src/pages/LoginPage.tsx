import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AuthImagePanel from "../components/authentication/AuthImagePanel";
import SocialLoginButons from "../components/authentication/SocialLoginButtons";
import PasswordInput from "../components/authentication/PasswordInput";
import { signIn } from "../auth";
import { useSiteSettings } from "../hooks/useSiteSettings";

export default function LoginPage() {
  const { settings } = useSiteSettings();
  const brandName = settings.logo_text || "Bride Me Up";
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [passwordTouched, setPasswordTouched] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  async function handleLogin() {
    setError("");
    setLoading(true);
    const { error } = await signIn(email, password, rememberMe);
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
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <AuthImagePanel
          src={settings.signin_image_url || settings.hero_image_url || "https://images.unsplash.com/photo-1770757588092-6fd47f8a2985?auto=format&fit=crop&w=1080&q=80"}
          alt="Bridal Dress"
        />
        <div className="bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 dark:border-stone-700/50 p-12">
          <div className="max-w-md mx-auto space-y-8">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-stone-200 via-pink-100/30 to-stone-300 rounded-full overflow-hidden">
                {settings.logo_image_url ? (
                  <img src={settings.logo_image_url} alt="Logo" className="w-full h-full object-contain p-1" />
                ) : (
                  <Sparkles className="w-8 h-8 text-stone-600" />
                )}
              </div>
              <h1 className="font-serif text-4xl text-stone-800 dark:text-stone-100">
                {brandName}
              </h1>
              <p className="text-stone-500 dark:text-stone-400">
                Your journey to the perfect dress begins here
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm text-stone-700 dark:text-stone-300">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="bride@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50/50 dark:bg-stone-700/50 border border-stone-200 dark:border-stone-600 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50
                  text-stone-800 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500"
              />
            </div>

            <PasswordInput
              password={password}
              showPassword={showPassword}
              passwordTouched={passwordTouched}
              isPasswordValid={true}
              validateStrength={false}
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
                className="flex items-center gap-2 text-stone-600 dark:text-stone-300 cursor-pointer"
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
              <Link to="/forgot-password" className="text-stone-600 dark:text-stone-300 hover:text-stone-800 dark:hover:text-stone-100">
                Forgot password
              </Link>
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <button
              type="button"
              onClick={handleLogin}
              disabled={!email || !password || loading}
              className="w-full py-3 bg-gradient-to-r from-stone-300 via-pink-200/40 to-stone-300
                text-stone-700 rounded-xl hover:shadow-lg transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200 dark:border-stone-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/60 dark:bg-stone-800/60 text-stone-500 dark:text-stone-400">
                  or continue with
                </span>
              </div>
            </div>

            <SocialLoginButons />

            <div className="text-center text-sm text-stone-600 dark:text-stone-300">
              Don&apos;t have an account?{" "}
              <Link
                to="/signup"
                className="text-stone-700 dark:text-stone-200 hover:text-stone-900 dark:hover:text-stone-50"
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
