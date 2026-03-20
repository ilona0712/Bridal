import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import { useSession } from "../../routes";

interface Dress {
  id: string;
  name: string;
  sizes?: string;
}

interface RentModalProps {
  dress: Dress;
  onClose: () => void;
}

function addDays(dateStr: string, days: number): Date {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d;
}

function formatDateLong(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function toLocalISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function todayISO(): string {
  return toLocalISODate(new Date());
}

async function getOrCreateConversation(userId: string): Promise<string | null> {
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("customer_id", userId)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("conversations")
    .insert({ customer_id: userId })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to create conversation:", error);
    return null;
  }
  return created.id;
}

export default function RentModal({ dress, onClose }: RentModalProps) {
  const session = useSession();
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState("");
  const [duration, setDuration] = useState(3);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const endDate = startDate ? addDays(startDate, duration - 1) : null;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function buildMessage(): string {
    if (!startDate || !endDate) return "";
    const start = formatDateLong(new Date(startDate + "T00:00:00"));
    const end = formatDateLong(endDate);
    return (
      `👗 Rental Request\n\n` +
      `Dress: ${dress.name}` +
      (dress.sizes ? `\nAvailable sizes: ${dress.sizes}` : "") +
      `\n\n📅 Rental period: ${start} → ${end}` +
      `\n⏱ Duration: ${duration} day${duration > 1 ? "s" : ""}` +
      `\n\nPlease confirm availability for these dates.`
    );
  }

  async function handleSubmit() {
    setError("");
    if (!startDate) { setError("Please select a start date."); return; }
    if (new Date(startDate + "T00:00:00") < new Date(todayISO() + "T00:00:00")) {
      setError("Start date cannot be in the past.");
      return;
    }
    if (!session?.user) { setError("You must be logged in to request a rental."); return; }

    setLoading(true);
    const convId = await getOrCreateConversation(session.user.id);
    if (!convId) {
      setError("Failed to start conversation. Please try again.");
      setLoading(false);
      return;
    }

    const { error: msgError } = await supabase.from("messages").insert({
      conversation_id: convId,
      content: buildMessage(),
      sender_type: "customer",
    });

    if (msgError) {
      console.error("Failed to send rental request:", msgError);
      setError("Failed to send request. Please try again.");
      setLoading(false);
      return;
    }

    setLoading(false);
    onClose();
    navigate("/chat");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(28, 25, 23, 0.6)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-stone-200/60 overflow-hidden"
        style={{ animation: "rentPop 0.28s cubic-bezier(0.34,1.56,0.64,1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes rentPop {
            from { opacity: 0; transform: scale(0.9) translateY(16px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        {/* Top accent bar — matches site gradient */}
        <div className="h-1 w-full bg-gradient-to-r from-stone-300 via-pink-200/60 to-stone-300" />

        <div className="p-7">
          {/* Header */}
          <div className="mb-5">
            <span className="inline-block text-[10px] font-semibold tracking-[0.2em] text-stone-500 uppercase bg-gradient-to-r from-stone-100 via-pink-50 to-stone-100 px-3 py-1 rounded-full mb-3 border border-stone-200/60">
              ✦ Request to Rent
            </span>
            <h2 className="font-serif text-2xl text-stone-800">{dress.name}</h2>
            {dress.sizes && (
              <p className="text-sm text-stone-400 mt-1">Available sizes: {dress.sizes}</p>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent mb-5" />

          {/* Start Date */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2">
              📅 Rental Start Date
            </label>
            <input
              type="date"
              min={todayISO()}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50/80 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200/70 focus:border-pink-300 transition"
            />
          </div>

          {/* Duration */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2">
              ⏱ Duration:{" "}
              <span className="text-pink-400 font-bold">{duration} {duration === 1 ? "day" : "days"}</span>
            </label>

            {/* Pills */}
            <div className="flex gap-2 mb-3">
              {[3, 4, 5, 6, 7].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
                    duration === d
                      ? "border-pink-300 bg-gradient-to-r from-stone-100 via-pink-100/60 to-stone-100 text-stone-700 shadow-sm"
                      : "border-stone-200 text-stone-400 hover:border-stone-300 hover:text-stone-600"
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>

            {/* Slider */}
            <input
              type="range"
              min={3}
              max={7}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full accent-pink-300"
            />
            <div className="flex justify-between text-[10px] text-stone-400 mt-1 tracking-wide">
              <span>3 days min</span>
              <span>7 days max</span>
            </div>
          </div>

          {/* Return date preview */}
          {startDate && endDate && (
            <div className="mb-5 flex items-center justify-between bg-gradient-to-r from-stone-50 via-pink-50/40 to-stone-50 border border-stone-200/60 rounded-2xl px-5 py-4">
              <div>
                <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-1">
                  Return Date
                </div>
                <div className="text-sm font-semibold text-stone-700">
                  {formatDateLong(endDate)}
                </div>
              </div>
              <span className="bg-gradient-to-r from-stone-200 via-pink-100/60 to-stone-200 text-stone-600 text-xs font-bold px-3 py-1.5 rounded-full border border-stone-200/50 shadow-sm">
                {duration} nights
              </span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-500">
              ⚠ {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-500 text-sm font-medium hover:bg-stone-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-stone-700 via-stone-800 to-stone-700 text-white text-sm font-semibold shadow-md hover:shadow-lg hover:from-stone-600 hover:to-stone-600 transition-all disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send Rental Request →"}
            </button>
          </div>
        </div>

        {/* Close X */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-400 hover:bg-stone-200 transition text-sm font-medium"
        >
          ✕
        </button>
      </div>
    </div>
  );
}