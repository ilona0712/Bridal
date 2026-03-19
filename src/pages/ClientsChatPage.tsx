import { Camera, MessageCircle, Mic, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "../components/common/Header";
import { supabase } from "../../lib/supabase";
import { useSession } from "../routes";
import type { ConversationSummary } from "../types/chat";

export default function ClientsChatPage() {
  const session = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;

    const fetchConversations = async () => {
      const { data: convsData, error } = await supabase
        .from("conversations")
        .select("id, customer_id, created_at");

      if (error) {
        console.error("Failed to fetch conversations:", error);
        setLoading(false);
        return;
      }

      // Fetch admin's read markers for all conversations in one query
      const { data: readMarkers } = await supabase
        .from("conversation_reads")
        .select("conversation_id, last_read_at")
        .eq("user_id", session.user.id);

      const readMap = new Map(
        (readMarkers ?? []).map((r) => [r.conversation_id, r.last_read_at])
      );

      const enriched = await Promise.all(
        (convsData ?? []).map(async (conv) => {
          const [{ data: profile }, { data: msgs }] = await Promise.all([
            supabase
              .from("profiles")
              .select("full_name, profile_image_url")
              .eq("id", conv.customer_id)
              .single(),
            supabase
              .from("messages")
              .select("content, created_at, sender_type, is_audio, attachment_type")
              .eq("conversation_id", conv.id)
              .order("created_at", { ascending: false }),
          ]);

          const last = msgs?.[0];
          const lastReadAt = readMap.get(conv.id) ?? null;
          const unreadCount = (msgs ?? []).filter(
            (m) =>
              m.sender_type === "customer" &&
              (!lastReadAt || new Date(m.created_at) > new Date(lastReadAt))
          ).length;

          const lastMessageType: "text" | "image" | "audio" = last?.is_audio
            ? "audio"
            : last?.attachment_type === "image"
            ? "image"
            : "text";

          return {
            id: conv.id,
            customer_id: conv.customer_id,
            clientName: profile?.full_name ?? "Unknown Client",
            profileImageUrl: profile?.profile_image_url ?? null,
            lastMessage: last?.content ?? "No messages yet",
            lastMessageType,
            timestamp: last
              ? new Date(last.created_at).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })
              : "",
            lastMessageAt: last?.created_at ?? null,
            unreadCount,
            unread: unreadCount > 0,
          };
        })
      );

      const sorted = enriched.sort((a, b) => {
        if (!a.lastMessageAt && !b.lastMessageAt) return 0;
        if (!a.lastMessageAt) return 1;
        if (!b.lastMessageAt) return -1;
        return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
      });
      setConversations(sorted);
      setLoading(false);
    };

    fetchConversations();

    // Real-time: update conversation list when any new message arrives
    const channel = supabase
      .channel("admin-messages-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new as { conversation_id: string; content: string; created_at: string; sender_type: string; is_audio: boolean; attachment_type: string | null };
          const lastMessageType: "text" | "image" | "audio" = msg.is_audio
            ? "audio"
            : msg.attachment_type === "image"
            ? "image"
            : "text";
          setConversations((prev) => {
            const updated = prev.map((conv) => {
              if (conv.id !== msg.conversation_id) return conv;
              return {
                ...conv,
                lastMessage: msg.content,
                lastMessageType,
                lastMessageAt: msg.created_at,
                timestamp: new Date(msg.created_at).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                }),
                unreadCount: msg.sender_type === "customer" ? conv.unreadCount + 1 : conv.unreadCount,
                unread: msg.sender_type === "customer" ? true : conv.unread,
              };
            });
            // Re-sort so the most recent floats to the top
            return [...updated].sort((a, b) => {
              if (!a.lastMessageAt && !b.lastMessageAt) return 0;
              if (!a.lastMessageAt) return 1;
              if (!b.lastMessageAt) return -1;
              return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
            });
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [session]);

  const filtered = conversations.filter((c) =>
    c.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100">
      <Header subtitle="Client Chats" />
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-serif text-3xl text-stone-800">Client Chats</h2>
              <p className="text-stone-500 mt-1">
                {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-stone-200 via-pink-100/30 to-stone-300 rounded-full flex items-center justify-center">
              <MessageCircle className="w-7 h-7 text-stone-600" />
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/60 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 text-stone-800 placeholder:text-stone-400"
            />
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-stone-400">Loading conversations...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <MessageCircle className="w-16 h-16 text-stone-300 mx-auto mb-4" />
              <p className="text-stone-500">No conversations found</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-200/50">
              {filtered.map((conv) => (
                <Link
                  key={conv.id}
                  to="/chat"
                  state={{ conversationId: conv.id, clientName: conv.clientName }}
                  className="flex items-center gap-4 p-5 hover:bg-stone-50/50 transition-colors group"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-stone-200 via-pink-100/30 to-stone-300 flex items-center justify-center border-2 border-stone-200/30 overflow-hidden">
                    {conv.profileImageUrl ? (
                      <img src={conv.profileImageUrl} alt={conv.clientName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-serif text-stone-600">
                        {conv.clientName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-serif text-lg text-stone-800">{conv.clientName}</h3>
                      <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                        <span className="text-xs text-stone-400">{conv.timestamp}</span>
                        {conv.unreadCount > 0 && (
                          <span className="min-w-[20px] h-5 px-1.5 bg-pink-200 text-stone-700 text-xs font-medium rounded-full flex items-center justify-center">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                    {conv.lastMessageType === "audio" ? (
                      <p className="text-sm text-stone-500 flex items-center gap-1">
                        <Mic className="w-3.5 h-3.5 text-pink-500 flex-shrink-0" />
                        Voice message
                      </p>
                    ) : conv.lastMessageType === "image" ? (
                      <p className="text-sm text-stone-500 flex items-center gap-1">
                        <Camera className="w-3.5 h-3.5 text-pink-500 flex-shrink-0" />
                        Photo
                      </p>
                    ) : (
                      <p className="text-sm truncate text-stone-500">{conv.lastMessage}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}