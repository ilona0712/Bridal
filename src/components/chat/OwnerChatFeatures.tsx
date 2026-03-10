export default function OwnerChatFeatures() {
  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-stone-200/30">
        <h3 className="font-serif text-stone-800 mb-2">
          Real-time Messaging
        </h3>
        <p className="text-xs text-stone-600">
          Instant communication with customers when you connect to Supabase
        </p>
      </div>

      <div className="bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-stone-200/30">
        <h3 className="font-serif text-stone-800 mb-2">Message History</h3>
        <p className="text-xs text-stone-600">
          All conversations saved and accessible from your dashboard
        </p>
      </div>

      <div className="bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-stone-200/30">
        <h3 className="font-serif text-stone-800 mb-2">Notifications</h3>
        <p className="text-xs text-stone-600">
          Get notified when customers send you messages
        </p>
      </div>
    </div>
  );
}