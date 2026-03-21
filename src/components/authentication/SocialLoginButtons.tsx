import GoogleLogo from "../../assets/google.svg";
import FacebookLogo from "../../assets/facebook.svg";

export default function SocialLoginButtons() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        type="button"
        className="py-3 px-4 bg-stone-50/50 dark:bg-stone-700/50 border border-stone-200 dark:border-stone-600 rounded-xl hover:bg-stone-100/50 dark:hover:bg-stone-600/50 transition-colors text-stone-700 dark:text-stone-200 flex items-center justify-center gap-2"
      >
        <img src={GoogleLogo} alt="Google" className="h-5 w-5" />
        Google
      </button>

      <button
        type="button"
        className="py-3 px-4 bg-stone-50/50 dark:bg-stone-700/50 border border-stone-200 dark:border-stone-600 rounded-xl hover:bg-stone-100/50 dark:hover:bg-stone-600/50 transition-colors text-stone-700 dark:text-stone-200 flex items-center justify-center gap-2"
      >
        <img src={FacebookLogo} alt="Facebook" className="h-5 w-5" />
        Facebook
      </button>
    </div>
  );
}
