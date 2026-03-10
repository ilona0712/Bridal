import { User } from "lucide-react";

export default function OwnerChatHeader() {
  return (
    <div className="bg-gradient-to-r from-amber-100/60 via-amber-50/40 to-amber-100/60 px-6 py-5 border-b border-amber-200/50">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-white/80 rounded-full flex items-center justify-center border-2 border-amber-200/30">
          <User className="w-7 h-7 text-stone-600" />
        </div>

        <div>
          <h2 className="font-serif text-2xl text-stone-800">
            Sarah Mitchell
          </h2>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-sm text-stone-600">Owner • Online</span>
          </div>
        </div>
      </div>
    </div>
  );
}