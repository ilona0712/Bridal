import { ImageWithFallback } from "../figma/ImageWithFallback";
import { Sparkles, Upload, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function Signup() {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [dressSize, setDressSize] = useState<string>("");
  const [dateOfBirth, setDateOfBirth] = useState<string>("");
  const [agreed, setAgreed] = useState<boolean>(false);
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Image */}
        <div className="hidden lg:block">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-50/30 to-transparent rounded-3xl"></div>
            <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1766104797322-3826d7158c64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwZHJlc3MlMjBmaXR0aW5nJTIwYnJpZGV8ZW58MXx8fHwxNzcwODk2NjM5fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Bridal Fitting"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 p-12">
          <div className="max-w-md mx-auto space-y-8">
            {/* Logo & Title */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-stone-200 via-pink-100/30 to-stone-300 rounded-full">
                <Sparkles className="w-8 h-8 text-stone-600" />
              </div>
              <h1 className="font-serif text-4xl text-stone-800">
                Create Your Profile
              </h1>
              <p className="text-stone-500">
                Begin your journey to finding the perfect gown
              </p>
            </div>

            {/* Signup Form */}
            <div className="space-y-6">
              {/* Profile Picture Upload */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-24 h-24 bg-stone-100/70 border-2 border-dashed border-stone-300 rounded-full flex items-center justify-center cursor-pointer hover:bg-stone-200/50 transition-colors">
                    <div className="text-center">
                      <User className="w-8 h-8 text-stone-400 mx-auto" />
                      <p className="text-xs text-stone-500 mt-1">Photo</p>
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-br from-stone-300 via-pink-200/40 to-stone-300 rounded-full flex items-center justify-center cursor-pointer shadow-lg">
                    <Upload className="w-4 h-4 text-stone-700" />
                  </div>
                </div>
              </div>
              <p className="text-xs text-center text-stone-500">
                Optional: Upload your photo
              </p>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-stone-700">
                    First Name <span className="text-pink-400/60">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Emma"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50 text-stone-800 placeholder:text-stone-400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-stone-700">
                    Last Name <span className="text-pink-400/60">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Johnson"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50 text-stone-800 placeholder:text-stone-400"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm text-stone-700">
                  Email Address <span className="text-pink-400/60">*</span>
                </label>
                <input
                  type="email"
                  placeholder="emma@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50 text-stone-800 placeholder:text-stone-400"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm text-stone-700">
                  Password <span className="text-pink-400/60">*</span>
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50 text-stone-800 placeholder:text-stone-400"
                />
              </div>

              {/* Dress Size */}
              <div className="space-y-2">
                <label className="text-sm text-stone-700">
                  Dress Size <span className="text-pink-400/60">*</span>
                </label>
                <select
                  value={dressSize}
                  onChange={(e) => setDressSize(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50 text-stone-800 cursor-pointer"
                >
                  <option value="">Select your size</option>
                  <option value="0">0</option>
                  <option value="2">2</option>
                  <option value="4">4</option>
                  <option value="6">6</option>
                  <option value="8">8</option>
                  <option value="10">10</option>
                  <option value="12">12</option>
                  <option value="14">14</option>
                  <option value="16">16</option>
                  <option value="18">18</option>
                  <option value="20">20</option>
                  <option value="22">22</option>
                  <option value="24">24</option>
                  <option value="26">26</option>
                </select>
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <label className="text-sm text-stone-700">
                  Date of Birth (Optional)
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50 text-stone-800"
                />
              </div>

              {/* Terms & Conditions */}
              <div className="space-y-4">
                <label className="flex items-start gap-2 text-sm text-stone-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 rounded border-stone-300 text-pink-300"
                  />
                  <span>
                    I agree to the Terms & Conditions and Privacy Policy
                  </span>
                </label>
              </div>

              <button
                type="button"
                disabled={
                  !firstName ||
                  !lastName ||
                  !email ||
                  !password ||
                  !dressSize ||
                  !agreed
                }
                className="w-full py-3 bg-gradient-to-r from-stone-300 via-pink-200/40 to-stone-300 text-stone-700 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Account
              </button>

              <div className="text-center text-sm text-stone-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-stone-700 hover:text-stone-900"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
