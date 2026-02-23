import { Sparkles } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100 flex items-center justify-center p-6">
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 p-12">
        <div className="max-w-md mx-auto space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-stone-200 via-pink-100/30 to-stone-300 rounded-full">
              <Sparkles className="w-8 h-8 text-stone-600" />
            </div>
            <h1 className="font-serif text-4xl text-stone-800">Bride Me Up</h1>
            <p className="text-stone-500">
              Your journey to the perfect gown begins here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}