import { Sparkles } from "lucide-react";

    export default function LoginPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100 flex items-center justify-center p-6">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="hidden lg:block">
        <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-50/30 to-transparent rounded-3xl" />
            <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl">
            <img
                src="https://images.unsplash.com/photo-1770757588092-6fd47f8a2985?auto=format&fit=crop&w=1080&q=80"
                alt="Bridal Gown"
                className="w-full h-full object-cover"
            />
            </div>
        </div>
        </div>
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
        </div>
    );
}