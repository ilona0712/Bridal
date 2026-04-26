import GoogleLogo from "../../assets/google.svg";
import { signInWithGoogle } from "../../auth";

export default function SocialLoginButtons() {
  return (
    <div className="flex justify-center">
      <button
        type="button"
        onClick={() => signInWithGoogle()}
        className="w-full max-w-xs py-3 px-4 bg-stone-50/50 dark:bg-stone-700/50 border border-stone-200 dark:border-stone-600 rounded-xl hover:bg-stone-100/50 dark:hover:bg-stone-600/50 transition-colors text-stone-700 dark:text-stone-200 flex items-center justify-center gap-2"
      >
        <img src={GoogleLogo} alt="Google" className="h-5 w-5" />
        Google
      </button>
    </div>
  );
}
