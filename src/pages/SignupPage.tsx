import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AuthImagePanel from "../components/authentication/AuthImagePanel";
import PasswordInput from "../components/authentication/PasswordInput";
import ProfilePhotoUpload from "../components/authentication/ProfilePhotoUpload";
import NameFields from "../components/authentication/NameFields";
import { signUp } from "../auth";
import { supabase } from "../../lib/supabase";

export default function Signup() {
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [dressSize, setDressSize] = useState<string>("");
  const [dateOfBirth, setDateOfBirth] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [agreed, setAgreed] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const navigate = useNavigate();

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_.\-#^()\[\]{}|~`<>,:;'"\/\\])[A-Za-z\d@$!%*?&_.\-#^()\[\]{}|~`<>,:;'"\/\\]{8,}$/;
  const isPasswordValid = passwordRegex.test(password);

  function handlePhotoSelect(file: File) {
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSignup() {
    setError("");
    setLoading(true);
    const { data, error } = await signUp({
      email,
      password,
      firstName,
      lastName,
      dressSize,
      dateOfBirth,
    });
    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }
    if (data.user && photoFile) {
      const userId = data.user.id;
      const fileExt = photoFile.name.split(".").pop();
      const filePath = `${userId}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("profile-images")
        .upload(filePath, photoFile, { cacheControl: "3600", upsert: true });
      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("profile-images")
          .getPublicUrl(filePath);
        await supabase.from("profiles").upsert(
          {
            id: userId,
            full_name: `${firstName} ${lastName}`.trim(),
            dress_size: dressSize || null,
            date_of_birth: dateOfBirth || null,
            role: "customer",
            phone: phone || "",
            country: country || "",
            profile_image_url: urlData.publicUrl,
          },
          { onConflict: "id" },
        );
      }
    } else if (data.user && (phone || country)) {
      await supabase.from("profiles").upsert(
        {
          id: data.user.id,
          full_name: `${firstName} ${lastName}`.trim(),
          dress_size: dressSize || null,
          date_of_birth: dateOfBirth || null,
          role: "customer",
          phone: phone || "",
          country: country || "",
        },
        { onConflict: "id" },
      );
    }
    setLoading(false);
    if (data.user) navigate("/check-email", { state: { email } });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <AuthImagePanel
          src="https://images.unsplash.com/photo-1766104797322-3826d7158c64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwZHJlc3MlMjBmaXR0aW5nJTIwYnJpZGV8ZW58MXx8fHwxNzcwODk2NjM5fDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Bridal Fitting"
        />
        <div className="bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 dark:border-stone-700/50 p-12">
          <div className="max-w-md mx-auto space-y-8">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-stone-200 via-pink-100/30 to-stone-300 rounded-full">
                <Sparkles className="w-8 h-8 text-stone-600" />
              </div>
              <h1 className="font-serif text-4xl text-stone-800 dark:text-stone-100">
                Create Your Profile
              </h1>
              <p className="text-stone-500 dark:text-stone-400">
                Begin your journey to finding the perfect dress
              </p>
            </div>

            <div className="space-y-6">
              <ProfilePhotoUpload onPhotoSelect={handlePhotoSelect} preview={photoPreview} />

              <NameFields
                firstName={firstName}
                lastName={lastName}
                onFirstNameChange={setFirstName}
                onLastNameChange={setLastName}
              />

              <div className="space-y-2">
                <label className="text-sm text-stone-700 dark:text-stone-300">
                  Email Address <span className="text-pink-400/60">*</span>
                </label>
                <input
                  type="email"
                  placeholder="emma@example.com"
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
                isPasswordValid={isPasswordValid}
                onPasswordChange={setPassword}
                onToggleShowPassword={() => setShowPassword(!showPassword)}
                onBlur={() => setPasswordTouched(true)}
                label={
                  <>
                    Password <span className="text-pink-400/60">*</span>
                  </>
                }
                id="signup-password"
                placeholder="••••••••"
                autoComplete="new-password"
              />

              <div className="space-y-2">
                <label className="text-sm text-stone-700 dark:text-stone-300">
                  Dress Size <span className="text-pink-400/60">*</span>
                </label>
                <select
                  value={dressSize}
                  onChange={(e) => setDressSize(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50/50 dark:bg-stone-700/50 border border-stone-200 dark:border-stone-600 rounded-xl
                    focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50
                    text-stone-800 dark:text-stone-100 cursor-pointer"
                >
                  <option value="">Select your size</option>
                  {["32", "34", "36", "38", "40", "42", "44", "46"].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-stone-700 dark:text-stone-300">
                  Date of Birth (Optional)
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50/50 dark:bg-stone-700/50 border border-stone-200 dark:border-stone-600 rounded-xl
                    focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50
                    text-stone-800 dark:text-stone-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-stone-700 dark:text-stone-300">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="+961 03 123 456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50/50 dark:bg-stone-700/50 border border-stone-200 dark:border-stone-600 rounded-xl
                      focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50
                      text-stone-800 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-stone-700 dark:text-stone-300">
                    Country (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lebanon"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50/50 dark:bg-stone-700/50 border border-stone-200 dark:border-stone-600 rounded-xl
                      focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50
                      text-stone-800 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500"
                  />
                </div>
              </div>

              <label className="flex items-start gap-2 text-sm text-stone-600 dark:text-stone-300 cursor-pointer">
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

              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}

              <button
                type="button"
                onClick={handleSignup}
                disabled={
                  !firstName ||
                  !lastName ||
                  !email ||
                  !isPasswordValid ||
                  !dressSize ||
                  !agreed ||
                  loading
                }
                className="w-full py-3 bg-gradient-to-r from-stone-300 via-pink-200/40 to-stone-300
                  text-stone-700 rounded-xl hover:shadow-lg transition-all duration-300
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>

              <div className="text-center text-sm text-stone-600 dark:text-stone-300">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-stone-700 dark:text-stone-200 hover:text-stone-900 dark:hover:text-stone-50"
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
