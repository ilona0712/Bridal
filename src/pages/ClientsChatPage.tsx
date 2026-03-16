import { MessageCircle, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "../components/common/Header";
import { supabase } from "../../lib/supabase";
import type { ConversationSummary } from "../types/chat";

export default function ClientsChatPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      const { data: convsData, error } = await supabase
        .from("conversations")
        .select("id, customer_id, created_at");

      if (error) {
        console.error("Failed to fetch conversations:", error);
        setLoading(false);
        return;
      }

      const enriched = await Promise.all(
        (convsData ?? []).map(async (conv) => {
          const [{ data: profile }, { data: msgs }] = await Promise.all([
            supabase
              .from("profiles")
              .select("full_name")
              .eq("id", conv.customer_id)
              .single(),
            supabase
              .from("messages")
              .select("content, created_at, sender_type")
              .eq("conversation_id", conv.id)
              .order("created_at", { ascending: false })
              .limit(1),
          ]);

          const last = msgs?.[0];
          return {
            id: conv.id,
            customer_id: conv.customer_id,
            clientName: profile?.full_name ?? "Unknown Client",
            lastMessage: last?.content ?? "No messages yet",
            timestamp: last
              ? new Date(last.created_at).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })
              : "",
            unread: false,
          };
        })
      );

      setConversations(enriched);
      setLoading(false);
    };

    fetchConversations();
  }, []);

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
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-stone-200 via-pink-100/30 to-stone-300 flex items-center justify-center border-2 border-stone-200/30">
                    <span className="text-lg font-serif text-stone-600">
                      {conv.clientName.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-serif text-lg text-stone-800">{conv.clientName}</h3>
                      <span className="text-xs text-stone-400 ml-2">{conv.timestamp}</span>
                    </div>
                    <p className="text-sm truncate text-stone-500">{conv.lastMessage}</p>
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