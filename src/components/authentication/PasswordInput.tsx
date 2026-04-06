import type { ReactNode } from "react";
import { Eye, EyeOff, Check } from "lucide-react";

type PasswordInputProps = {
  password: string;
  showPassword: boolean;
  passwordTouched: boolean;
  isPasswordValid: boolean;
  /**
   * Show the strength/complexity validation UI. For login we don't want to block
   * submission based on a regex; Supabase will verify the credentials itself.
   * Defaults to true for sign-up/reset flows.
   */
  validateStrength?: boolean;
  onPasswordChange: (value: string) => void;
  onToggleShowPassword: () => void;
  onBlur: () => void;
  label?: ReactNode;
  id?: string;
  placeholder?: string;
  autoComplete?: string;
};

export default function PasswordInput({
  password,
  showPassword,
  passwordTouched,
  isPasswordValid,
  validateStrength = true,
  onPasswordChange,
  onToggleShowPassword,
  onBlur,
  label = "Password",
  id = "password",
  placeholder = "••••••••",
  autoComplete = "current-password",
}: PasswordInputProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm text-stone-700 dark:text-stone-300">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={password}
          minLength={validateStrength ? 8 : 1}
          autoComplete={autoComplete}
          onChange={(e) => onPasswordChange(e.target.value)}
          onBlur={onBlur}
          className="w-full px-4 py-3 pr-20 bg-stone-50/50 dark:bg-stone-700/50 border border-stone-200 dark:border-stone-600 rounded-xl
          focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50
          text-stone-800 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500"
        />

        {validateStrength && password && isPasswordValid && (
          <Check className="absolute right-12 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 z-10" />
        )}

        <button
          type="button"
          onClick={onToggleShowPassword}
          className="absolute inset-y-0 right-3 flex items-center text-sm text-stone-500 dark:text-stone-400"
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>

      {validateStrength && passwordTouched && password.length > 0 && !isPasswordValid && (
        <p className="text-xs text-red-500">
          Must be at least 8 characters and include: uppercase, lowercase,
          number, and a special character.
        </p>
      )}
    </div>
  );
}
