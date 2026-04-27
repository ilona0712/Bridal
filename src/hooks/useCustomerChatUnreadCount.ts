import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRole, useSession } from "../routes";

export function useCustomerChatUnreadCount() {
  const session = useSession();
  const role = useRole();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!session?.user?.id || role === "admin") {
      setUnreadCount(0);
      return;
    }

    let alive = true;

    const fetchUnreadCount = async () => {
      const { data: conv } = await supabase
        .from("conversations")
        .select("id")
        .eq("customer_id", session.user.id)
        .maybeSingle();

      if (!alive) return;

      if (!conv) {
        setUnreadCount(0);
        return;
      }

      const { data: readRow } = await supabase
        .from("conversation_reads")
        .select("last_read_at")
        .eq("conversation_id", conv.id)
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!alive) return;

      const lastReadAt = readRow?.last_read_at ?? null;
      const base = supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("conversation_id", conv.id)
        .eq("sender_type", "designer");

      const { count } = lastReadAt
        ? await base.gt("created_at", lastReadAt)
        : await base;

      if (!alive) return;
      setUnreadCount(count ?? 0);
    };

    void fetchUnreadCount();

    const channel = supabase
      .channel(`customer-unread-count:${session.user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        fetchUnreadCount,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversation_reads" },
        fetchUnreadCount,
      )
      .subscribe();

    return () => {
      alive = false;
      supabase.removeChannel(channel);
    };
  }, [role, session?.user?.id]);

  return unreadCount;
}
