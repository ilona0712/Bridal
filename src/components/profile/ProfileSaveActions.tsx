import { Save } from "lucide-react";

type ProfileSaveActionsProps = {
  onSave: () => void;
  isLoading?: boolean;
};

export default function ProfileSaveActions({
  onSave,
  isLoading = false,
}: ProfileSaveActionsProps) {
  return (
    <div className="pt-6">
      <button
        onClick={onSave}
        disabled={isLoading}
        className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-stone-300 via-pink-200/40 to-stone-300 text-stone-700 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Save className="w-5 h-5" />
        {isLoading ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}