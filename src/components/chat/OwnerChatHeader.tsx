import { ArrowLeft, User } from "lucide-react";

type OwnerChatHeaderProps = {
  clientName?: string;
  profileImageUrl?: string | null;
  onBack?: () => void;
  onViewProfile?: () => void;
};

export default function OwnerChatHeader({
  clientName,
  profileImageUrl,
  onBack,
  onViewProfile,
}: OwnerChatHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {onBack && (
        <button
          onClick={onBack}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition"
        >
          <ArrowLeft className="h-4 w-4 text-stone-500 dark:text-stone-400" />
        </button>
      )}

      <button
        type="button"
        onClick={onViewProfile}
        disabled={!onViewProfile}
        className="flex items-center gap-2 disabled:cursor-default group"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden bg-stone-200 dark:bg-stone-700 flex-shrink-0 flex items-center justify-center">
          {profileImageUrl ? (
            <img src={profileImageUrl} alt={clientName ?? "Profile"} className="w-full h-full object-cover" />
          ) : (
            <User className="w-4 h-4 text-stone-500 dark:text-stone-400" />
          )}
        </div>
        <span className="font-serif text-stone-700 dark:text-stone-200 text-base group-hover:text-stone-900 dark:group-hover:text-stone-100 transition">
          {clientName || "Customer"}
        </span>
      </button>
    </div>
  );
}
