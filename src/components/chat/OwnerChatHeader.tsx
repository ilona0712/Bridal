import { ArrowLeft, User } from "lucide-react";

type OwnerChatHeaderProps = {
  clientName?: string;
  profileImageUrl?: string | null;
  onBack?: () => void;
};

export default function OwnerChatHeader({
  clientName,
  profileImageUrl,
  onBack,
}: OwnerChatHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-amber-100/60 via-amber-50/40 to-amber-100/60 dark:from-stone-800 dark:via-stone-700 dark:to-stone-800 px-6 py-5 border-b border-amber-200/50 dark:border-stone-700/50">
      <div className="flex items-center gap-4">

        {/* Back button */}
        {onBack && (
          <button
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-200/40 dark:border-stone-600 bg-white/80 dark:bg-stone-700/80 transition hover:bg-white dark:hover:bg-stone-600"
            title="Back"
          >
            <ArrowLeft className="h-4 w-4 text-stone-600" />
          </button>
        )}

        {/* Avatar */}
        <div className="w-14 h-14 bg-white/80 dark:bg-stone-700/80 rounded-full flex items-center justify-center border-2 border-amber-200/30 dark:border-stone-600/30 overflow-hidden">
          {profileImageUrl ? (
            <img src={profileImageUrl} alt={clientName ?? "Client"} className="w-full h-full object-cover" />
          ) : (
            <User className="w-7 h-7 text-stone-600" />
          )}
        </div>

        {/* Name + status */}
        <div>
          <h2 className="font-serif text-2xl text-stone-800 dark:text-stone-100">
            {clientName || "Customer"}
          </h2>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-sm text-stone-600 dark:text-stone-300">
              Customer • Online
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}